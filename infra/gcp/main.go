package main

import (
	"github.com/pulumi/pulumi-docker/sdk/v4/go/docker"
	"github.com/pulumi/pulumi-gcp/sdk/v8/go/gcp/artifactregistry"
	"github.com/pulumi/pulumi-gcp/sdk/v8/go/gcp/cloudrunv2"
	"github.com/pulumi/pulumi-gcp/sdk/v8/go/gcp/compute"
	"github.com/pulumi/pulumi-gcp/sdk/v8/go/gcp/servicenetworking"
	"github.com/pulumi/pulumi-gcp/sdk/v8/go/gcp/sql"
	"github.com/pulumi/pulumi-random/sdk/v4/go/random"
	"github.com/pulumi/pulumi/sdk/v3/go/pulumi"
)

func main() {
	pulumi.Run(func(ctx *pulumi.Context) error {
		repoUrl := "australia-southeast1-docker.pkg.dev/scriptag/scriptag-gcr"

		registry, err := artifactregistry.NewRepository(ctx, "registry", &artifactregistry.RepositoryArgs{
			Location:     pulumi.String("australia-southeast1"),
			RepositoryId: pulumi.String("scriptag-gcr"),
			Description:  pulumi.String("Holds Docker images for services & apps."),
			Format:       pulumi.String("DOCKER"),
		})

		if err != nil {
			return err
		}

		ctx.Export("gcrRegistryUrl", registry.URN())

		// Set up VPC network peering for private IP
		address, err := compute.NewGlobalAddress(ctx, "private-ip-address", &compute.GlobalAddressArgs{
			Purpose:      pulumi.String("VPC_PEERING"),
			AddressType: pulumi.String("INTERNAL"),
			PrefixLength: pulumi.Int(16),
			Network:     pulumi.String("projects/scriptag/global/networks/default"),
		})
		if err != nil {
			return err
		}

		// Create the VPC peering connection
		connection, err := servicenetworking.NewConnection(ctx, "private-vpc-connection", &servicenetworking.ConnectionArgs{
			Network: pulumi.String("projects/scriptag/global/networks/default"),
			Service: pulumi.String("servicenetworking.googleapis.com"),
			ReservedPeeringRanges: pulumi.StringArray{
				address.Name,
			},
		})
		if err != nil {
			return err
		}

		// Create a PostgreSQL instance
		instance, err := sql.NewDatabaseInstance(ctx, "testing-db-instance", &sql.DatabaseInstanceArgs{
			Region:          pulumi.String("australia-southeast1"),
			DatabaseVersion: pulumi.String("POSTGRES_17"),
			Settings: &sql.DatabaseInstanceSettingsArgs{
				Tier:             pulumi.String("db-f1-micro"),
				AvailabilityType: pulumi.String("ZONAL"),
				Edition:          pulumi.String("ENTERPRISE"),
				BackupConfiguration: &sql.DatabaseInstanceSettingsBackupConfigurationArgs{
					Enabled: pulumi.Bool(false),
				},
				ActivationPolicy:          pulumi.String("ALWAYS"),
				DiskAutoresize:            pulumi.Bool(false),
				DeletionProtectionEnabled: pulumi.Bool(false),
				IpConfiguration: &sql.DatabaseInstanceSettingsIpConfigurationArgs{
					Ipv4Enabled: pulumi.Bool(false),
					PrivateNetwork:     pulumi.String("projects/scriptag/global/networks/default"),
					EnablePrivatePathForGoogleCloudServices: pulumi.Bool(true),
				},
			},
		}, pulumi.DependsOn([]pulumi.Resource{connection}))

		if err != nil {
			return err
		}

		// Create a PostgreSQL database
		database, err := sql.NewDatabase(ctx, "testing-db", &sql.DatabaseArgs{
			Instance: instance.Name,
			// DeletionPolicy: pulumi.String("ABANDON"),
		})

		if err != nil {
			return err
		}

		// Generate a random password
		password, err := random.NewRandomPassword(ctx, "db-password", &random.RandomPasswordArgs{
			Length:  pulumi.Int(16),
			Special: pulumi.Bool(true),
		})

		if err != nil {
			return err
		}

		// Create a PostgreSQL user
		dbUser, err := sql.NewUser(ctx, "api-user", &sql.UserArgs{
			Instance: instance.Name,
			Password: password.Result,
			Project:  pulumi.String("scriptag"),
		}, pulumi.DependsOn([]pulumi.Resource{instance}))

		if err != nil {
			return err
		}

		// Build and push the Docker image
		image, err := docker.NewImage(ctx, "docker-api-image", &docker.ImageArgs{
			Build: docker.DockerBuildArgs{
				Context:  pulumi.String("../../services/go-api/."),
				Platform: pulumi.String("linux/amd64"),
			},
			ImageName: pulumi.Sprintf("%s/docker-api-image", repoUrl),
			SkipPush:  pulumi.Bool(false),
		}, pulumi.DependsOn([]pulumi.Resource{registry}))

		if err != nil {
			return err
		}

		// Create a Cloud Run service
		_, err = cloudrunv2.NewService(ctx, "testing-graphql", &cloudrunv2.ServiceArgs{
			Name:     pulumi.String("testing-graphql"),
			Location: pulumi.String("australia-southeast1"),
			Template: &cloudrunv2.ServiceTemplateArgs{
				Containers: cloudrunv2.ServiceTemplateContainerArray{
					&cloudrunv2.ServiceTemplateContainerArgs{
						Image: pulumi.String(repoUrl + "/docker-api-image"),
						Ports: cloudrunv2.ServiceTemplateContainerPortsArgs{
							ContainerPort: pulumi.Int(8080),
						},
						StartupProbe: &cloudrunv2.ServiceTemplateContainerStartupProbeArgs{
							HttpGet: &cloudrunv2.ServiceTemplateContainerStartupProbeHttpGetArgs{
								Path: pulumi.String("/health"),
							},
							InitialDelaySeconds: pulumi.Int(10),
						},
						Envs: cloudrunv2.ServiceTemplateContainerEnvArray{
							&cloudrunv2.ServiceTemplateContainerEnvArgs{
								Name:  pulumi.String("ENVIRONMENT"),
								Value: pulumi.String("production"),
							},
							&cloudrunv2.ServiceTemplateContainerEnvArgs{
								Name:  pulumi.String("DB_CONN_STR"),
								Value: pulumi.Sprintf("host=localhost user=%s password=%s dbname=%s port=5432 sslmode=disable TimeZone=UTC", dbUser.Name, password.Result, database.Name),
							},
							&cloudrunv2.ServiceTemplateContainerEnvArgs{
								Name:  pulumi.String("DB_PORT"),
								Value: pulumi.String("5432"),
							},
							&cloudrunv2.ServiceTemplateContainerEnvArgs{
								Name:  pulumi.String("INSTANCE_CONNECTION_NAME"),
								Value: instance.ConnectionName,
							},
						},
					},
				},
				Annotations: pulumi.StringMap{
					"run.googleapis.com/cloudsql-instances": instance.ConnectionName,
				},
				VpcAccess: &cloudrunv2.ServiceTemplateVpcAccessArgs{
					NetworkInterfaces: cloudrunv2.ServiceTemplateVpcAccessNetworkInterfaceArray{
						&cloudrunv2.ServiceTemplateVpcAccessNetworkInterfaceArgs{
							Network:    pulumi.String("default"),
							Subnetwork: pulumi.String("default"),
						},
					},
				},
			},
			Ingress: pulumi.String("INGRESS_TRAFFIC_ALL"),
		}, pulumi.DependsOn([]pulumi.Resource{image, instance}))

		if err != nil {
			return err
		}

		return nil
	})
}
