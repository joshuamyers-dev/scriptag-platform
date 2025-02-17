package main

import (
	"github.com/pulumi/pulumi-docker/sdk/v4/go/docker"
	"github.com/pulumi/pulumi-gcp/sdk/v8/go/gcp/artifactregistry"
	"github.com/pulumi/pulumi-gcp/sdk/v8/go/gcp/cloudrun"
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

		// Create a PostgreSQL instance
		instance, err := sql.NewDatabaseInstance(ctx, "testing-db-instance", &sql.DatabaseInstanceArgs{
			Region:          pulumi.String("australia-southeast1"),
			DatabaseVersion: pulumi.String("POSTGRES_17"),
			Settings: &sql.DatabaseInstanceSettingsArgs{
				Tier:             pulumi.String("db-f1-micro"),
				AvailabilityType: pulumi.String("ZONAL"),
				BackupConfiguration: &sql.DatabaseInstanceSettingsBackupConfigurationArgs{
					Enabled: pulumi.Bool(false),
				},
				ActivationPolicy:          pulumi.String("ALWAYS"),
				DiskAutoresize:            pulumi.Bool(false),
				DeletionProtectionEnabled: pulumi.Bool(false),
				IpConfiguration: &sql.DatabaseInstanceSettingsIpConfigurationArgs{
					Ipv4Enabled: pulumi.Bool(true),
					AuthorizedNetworks: sql.DatabaseInstanceSettingsIpConfigurationAuthorizedNetworkArray{
                        &sql.DatabaseInstanceSettingsIpConfigurationAuthorizedNetworkArgs{
                            Name:  pulumi.String("public-access"),
                            Value: pulumi.String("0.0.0.0/0"),
                        },
                    },
				},
			},
		})

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
		})

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
		service, err := cloudrun.NewService(ctx, "testing-graphql", &cloudrun.ServiceArgs{
			Name:     pulumi.String("testing-graphql"),
			Project:  pulumi.String("scriptag"),
			Location: pulumi.String("australia-southeast1"),
			Template: &cloudrun.ServiceTemplateArgs{
				Spec: &cloudrun.ServiceTemplateSpecArgs{
					Containers: cloudrun.ServiceTemplateSpecContainerArray{
						&cloudrun.ServiceTemplateSpecContainerArgs{
							Image: pulumi.String(repoUrl + "/docker-api-image"),
							Ports: cloudrun.ServiceTemplateSpecContainerPortArray{
								&cloudrun.ServiceTemplateSpecContainerPortArgs{
									ContainerPort: pulumi.Int(8080),
								},
							},
							StartupProbe: &cloudrun.ServiceTemplateSpecContainerStartupProbeArgs{
								HttpGet: &cloudrun.ServiceTemplateSpecContainerStartupProbeHttpGetArgs{
									Path: pulumi.String("/health"),
								},
								InitialDelaySeconds: pulumi.Int(10),
							},
							Envs: cloudrun.ServiceTemplateSpecContainerEnvArray{
								&cloudrun.ServiceTemplateSpecContainerEnvArgs{
									Name:  pulumi.String("ENVIRONMENT"),
									Value: pulumi.String("production"),
								},
								&cloudrun.ServiceTemplateSpecContainerEnvArgs{
									Name:  pulumi.String("DB_CONN_STR"),
									Value: pulumi.Sprintf("host=%s user=%s password=%s dbname=%s port=5432 sslmode=disable TimeZone=UTC", instance.PublicIpAddress, dbUser.Name, password.Result, database.Name),
								},
							},
						},
					},
				},
				Metadata: &cloudrun.ServiceTemplateMetadataArgs{
					Annotations: pulumi.StringMap{
						"run.googleapis.com/cloudsql-instances": instance.ConnectionName,
					},
				},
			},
			Traffics: cloudrun.ServiceTrafficArray{
				&cloudrun.ServiceTrafficArgs{
					Percent:        pulumi.Int(100),
					LatestRevision: pulumi.Bool(true),
				},
			},
		}, pulumi.DependsOn([]pulumi.Resource{image, instance}))

		if err != nil {
			return err
		}

		_, err = cloudrun.NewIamMember(ctx, "testing-graphql-service", &cloudrun.IamMemberArgs{
			Service: service.Name,
			Role:    pulumi.String("roles/run.invoker"),
			Member:  pulumi.String("allUsers"),
			Location: pulumi.String("australia-southeast1"),
		}, pulumi.DependsOn([]pulumi.Resource{service}))

		if err != nil {
			return err
		}

		// // Grant the Cloud Run service account access to the Cloud SQL instance
		// _, err = cloudrun.NewIamMember(ctx, "cloudsql-client", &cloudrun.IamMemberArgs{
		// 	Service: service.Name,
		// 	Role:    pulumi.String("roles/cloudsql.client"),
		// 	Member:  pulumi.String("allUsers"),
		// 	Location: pulumi.String("australia-southeast1"),
		// }, pulumi.DependsOn([]pulumi.Resource{service}))

		// if err != nil {
		// 	return err
		// }

		ctx.Export("databaseName", database.Name)
		ctx.Export("serviceUrl", service.Statuses.Index(pulumi.Int(0)).Url())

		return nil
	})
}
