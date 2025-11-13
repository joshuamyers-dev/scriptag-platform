package main

import (
	"github.com/pulumi/pulumi-docker/sdk/v4/go/docker"
	"github.com/pulumi/pulumi-gcp/sdk/v8/go/gcp/artifactregistry"
	"github.com/pulumi/pulumi-gcp/sdk/v8/go/gcp/cloudrunv2"
	"github.com/pulumi/pulumi-gcp/sdk/v8/go/gcp/cloudscheduler"
	"github.com/pulumi/pulumi-gcp/sdk/v8/go/gcp/compute"
	"github.com/pulumi/pulumi-gcp/sdk/v8/go/gcp/projects"
	"github.com/pulumi/pulumi-gcp/sdk/v8/go/gcp/secretmanager"
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
			AddressType:  pulumi.String("INTERNAL"),
			PrefixLength: pulumi.Int(16),
			Network:      pulumi.String("projects/scriptag/global/networks/default"),
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
					Ipv4Enabled:                             pulumi.Bool(false),
					PrivateNetwork:                          pulumi.String("projects/scriptag/global/networks/default"),
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

		// Create secrets for database credentials
		// 1. Create secret for DB connection string
		dbConnStrSecret, err := secretmanager.NewSecret(ctx, "db-conn-str-secret", &secretmanager.SecretArgs{
			SecretId: pulumi.String("db-conn-str"),
			Replication: &secretmanager.SecretReplicationArgs{
				Auto: &secretmanager.SecretReplicationAutoArgs{},
			},
		})
		if err != nil {
			return err
		}

		// 2. Create secret version with the connection string
		_, err = secretmanager.NewSecretVersion(ctx, "db-conn-str-secret-version", &secretmanager.SecretVersionArgs{
			Secret: dbConnStrSecret.ID(),
			SecretData: pulumi.Sprintf("host=localhost user=%s password=%s dbname=%s port=5432 sslmode=disable TimeZone=UTC",
				dbUser.Name, password.Result, database.Name),
		})
		if err != nil {
			return err
		}

		// 3. Create secret for DB username
		dbUsernameSecret, err := secretmanager.NewSecret(ctx, "db-username-secret", &secretmanager.SecretArgs{
			SecretId: pulumi.String("db-username"),
			Replication: &secretmanager.SecretReplicationArgs{
				Auto: &secretmanager.SecretReplicationAutoArgs{},
			},
		})
		if err != nil {
			return err
		}

		// 4. Create secret version with the username
		_, err = secretmanager.NewSecretVersion(ctx, "db-username-secret-version", &secretmanager.SecretVersionArgs{
			Secret:     dbUsernameSecret.ID(),
			SecretData: dbUser.Name,
		})
		if err != nil {
			return err
		}

		// 5. Create secret for DB password
		dbPasswordSecret, err := secretmanager.NewSecret(ctx, "db-password-secret", &secretmanager.SecretArgs{
			SecretId: pulumi.String("db-password"),
			Replication: &secretmanager.SecretReplicationArgs{
				Auto: &secretmanager.SecretReplicationAutoArgs{},
			},
		})
		if err != nil {
			return err
		}

		// 6. Create secret version with the password
		_, err = secretmanager.NewSecretVersion(ctx, "db-password-secret-version", &secretmanager.SecretVersionArgs{
			Secret:     dbPasswordSecret.ID(),
			SecretData: password.Result,
		})
		if err != nil {
			return err
		}

		dbNameSecret, err := secretmanager.NewSecret(ctx, "db-name-secret", &secretmanager.SecretArgs{
			SecretId: pulumi.String("db-name"),
			Replication: &secretmanager.SecretReplicationArgs{
				Auto: &secretmanager.SecretReplicationAutoArgs{},
			},
		})

		if err != nil {
			return err
		}

		_, err = secretmanager.NewSecretVersion(ctx, "db-name-secret-version", &secretmanager.SecretVersionArgs{
			Secret:     dbNameSecret.ID(),
			SecretData: database.Name,
		})
		if err != nil {
			return err
		}

		// Grant Secret Manager Secret Accessor role to the Compute service account
		computeServiceAccount := "447797338394-compute@developer.gserviceaccount.com"

		// We'll use IAM policy binding at the project level instead of individual secret IAM members
		// This is more reliable for initial setup
		_, err = projects.NewIAMBinding(ctx, "compute-secretmanager-binding", &projects.IAMBindingArgs{
			Project: pulumi.String("447797338394"),
			Role:    pulumi.String("roles/secretmanager.secretAccessor"),
			Members: pulumi.StringArray{
				pulumi.Sprintf("serviceAccount:%s", computeServiceAccount),
			},
		})
		if err != nil {
			return err
		}

		// Build and push the Docker image
		apiImage, err := docker.NewImage(ctx, "docker-api-image", &docker.ImageArgs{
			Build: docker.DockerBuildArgs{
				Context:    pulumi.String("../../"),
				Dockerfile: pulumi.String("../../services/go-api/Dockerfile"),
				Platform:   pulumi.String("linux/amd64"),
			},
			ImageName: pulumi.Sprintf("%s/docker-api-image", repoUrl),
			SkipPush:  pulumi.Bool(false),
		}, pulumi.DependsOn([]pulumi.Resource{registry}))

		if err != nil {
			return err
		}

		image, err := docker.NewImage(ctx, "docker-notification-dispatcher-image", &docker.ImageArgs{
			Build: docker.DockerBuildArgs{
				Context:    pulumi.String("../../"),
				Dockerfile: pulumi.String("../../jobs/notification-dispatcher/Dockerfile"),
				Platform:   pulumi.String("linux/amd64"),
			},
			ImageName: pulumi.Sprintf("%s/notification-dispatcher-image:latest", repoUrl),
			SkipPush:  pulumi.Bool(false),
		}, pulumi.DependsOn([]pulumi.Resource{registry}))

		if err != nil {
			return err
		}

		// Create a Cloud Run service
		apiService, err := cloudrunv2.NewService(ctx, "testing-graphql", &cloudrunv2.ServiceArgs{
			Name:     pulumi.String("testing-graphql"),
			Location: pulumi.String("australia-southeast1"),
			Template: &cloudrunv2.ServiceTemplateArgs{
				ServiceAccount: pulumi.String(computeServiceAccount),
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
							InitialDelaySeconds: pulumi.Int(15),
							TimeoutSeconds:      pulumi.Int(3),
							PeriodSeconds:       pulumi.Int(10),
							FailureThreshold:    pulumi.Int(5),
						},
						Envs: cloudrunv2.ServiceTemplateContainerEnvArray{
							&cloudrunv2.ServiceTemplateContainerEnvArgs{
								Name:  pulumi.String("ENVIRONMENT"),
								Value: pulumi.String("production"),
							},
							&cloudrunv2.ServiceTemplateContainerEnvArgs{
								Name:  pulumi.String("INSTANCE_CONNECTION_NAME"),
								Value: instance.ConnectionName,
							},
							&cloudrunv2.ServiceTemplateContainerEnvArgs{
								Name:  pulumi.String("DB_PORT"),
								Value: pulumi.String("5432"),
							},
							// Reference secrets in environment variables
							&cloudrunv2.ServiceTemplateContainerEnvArgs{
								Name: pulumi.String("DB_CONN_STR"),
								ValueSource: &cloudrunv2.ServiceTemplateContainerEnvValueSourceArgs{
									SecretKeyRef: &cloudrunv2.ServiceTemplateContainerEnvValueSourceSecretKeyRefArgs{
										Secret:  pulumi.String("db-conn-str"),
										Version: pulumi.String("latest"),
									},
								},
							},
							&cloudrunv2.ServiceTemplateContainerEnvArgs{
								Name: pulumi.String("DB_NAME"),
								ValueSource: &cloudrunv2.ServiceTemplateContainerEnvValueSourceArgs{
									SecretKeyRef: &cloudrunv2.ServiceTemplateContainerEnvValueSourceSecretKeyRefArgs{
										Secret:  pulumi.String("db-name"),
										Version: pulumi.String("latest"),
									},
								},
							},
							&cloudrunv2.ServiceTemplateContainerEnvArgs{
								Name: pulumi.String("DB_USERNAME"),
								ValueSource: &cloudrunv2.ServiceTemplateContainerEnvValueSourceArgs{
									SecretKeyRef: &cloudrunv2.ServiceTemplateContainerEnvValueSourceSecretKeyRefArgs{
										Secret:  pulumi.String("db-username"),
										Version: pulumi.String("latest"),
									},
								},
							},
							&cloudrunv2.ServiceTemplateContainerEnvArgs{
								Name: pulumi.String("DB_PASSWORD"),
								ValueSource: &cloudrunv2.ServiceTemplateContainerEnvValueSourceArgs{
									SecretKeyRef: &cloudrunv2.ServiceTemplateContainerEnvValueSourceSecretKeyRefArgs{
										Secret:  pulumi.String("db-password"),
										Version: pulumi.String("latest"),
									},
								},
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
		}, pulumi.DependsOn([]pulumi.Resource{apiImage, instance, connection}))

		if err != nil {
			return err
		}

		// Make the API service publicly accessible
		_, err = cloudrunv2.NewServiceIamMember(ctx, "testing-graphql-public-access", &cloudrunv2.ServiceIamMemberArgs{
			Name:     pulumi.String("testing-graphql"),
			Location: pulumi.String("australia-southeast1"),
			Role:     pulumi.String("roles/run.invoker"),
			Member:   pulumi.String("allUsers"),
		}, pulumi.DependsOn([]pulumi.Resource{apiService}))

		if err != nil {
			return err
		}

		// Create Cloud Run job for notification dispatcher
		job, err := cloudrunv2.NewJob(ctx, "notification-dispatcher", &cloudrunv2.JobArgs{
			Name:     pulumi.String("notification-dispatcher"),
			Location: pulumi.String("australia-southeast1"),
			Template: &cloudrunv2.JobTemplateArgs{
				Template: &cloudrunv2.JobTemplateTemplateArgs{
					Containers: cloudrunv2.JobTemplateTemplateContainerArray{
						&cloudrunv2.JobTemplateTemplateContainerArgs{
							Image: pulumi.Sprintf("%s/notification-dispatcher-image:latest", repoUrl),
							Envs: cloudrunv2.JobTemplateTemplateContainerEnvArray{
								// Reference secrets in environment variables
								&cloudrunv2.JobTemplateTemplateContainerEnvArgs{
									Name: pulumi.String("DB_CONN_STR"),
									ValueSource: &cloudrunv2.JobTemplateTemplateContainerEnvValueSourceArgs{
										SecretKeyRef: &cloudrunv2.JobTemplateTemplateContainerEnvValueSourceSecretKeyRefArgs{
											Secret:  pulumi.String("db-conn-str"),
											Version: pulumi.String("latest"),
										},
									},
								},
								&cloudrunv2.JobTemplateTemplateContainerEnvArgs{
									Name: pulumi.String("DB_USERNAME"),
									ValueSource: &cloudrunv2.JobTemplateTemplateContainerEnvValueSourceArgs{
										SecretKeyRef: &cloudrunv2.JobTemplateTemplateContainerEnvValueSourceSecretKeyRefArgs{
											Secret:  pulumi.String("db-username"),
											Version: pulumi.String("latest"),
										},
									},
								},
								&cloudrunv2.JobTemplateTemplateContainerEnvArgs{
									Name: pulumi.String("DB_PASSWORD"),
									ValueSource: &cloudrunv2.JobTemplateTemplateContainerEnvValueSourceArgs{
										SecretKeyRef: &cloudrunv2.JobTemplateTemplateContainerEnvValueSourceSecretKeyRefArgs{
											Secret:  pulumi.String("db-password"),
											Version: pulumi.String("latest"),
										},
									},
								},
								&cloudrunv2.JobTemplateTemplateContainerEnvArgs{
									Name:  pulumi.String("INSTANCE_CONNECTION_NAME"),
									Value: instance.ConnectionName,
								},
								&cloudrunv2.JobTemplateTemplateContainerEnvArgs{
									Name:  pulumi.String("DB_PORT"),
									Value: pulumi.String("5432"),
								},
							},
							VolumeMounts: cloudrunv2.JobTemplateTemplateContainerVolumeMountArray{
								&cloudrunv2.JobTemplateTemplateContainerVolumeMountArgs{
									Name:      pulumi.String("cloudsql"),
									MountPath: pulumi.String("/cloudsql"),
								},
							},
						},
					},
					Volumes: cloudrunv2.JobTemplateTemplateVolumeArray{
						&cloudrunv2.JobTemplateTemplateVolumeArgs{
							Name: pulumi.String("cloudsql"),
							CloudSqlInstance: &cloudrunv2.JobTemplateTemplateVolumeCloudSqlInstanceArgs{
								Instances: pulumi.StringArray{
									instance.ConnectionName,
								},
							},
						},
					},
					VpcAccess: &cloudrunv2.JobTemplateTemplateVpcAccessArgs{
						NetworkInterfaces: cloudrunv2.JobTemplateTemplateVpcAccessNetworkInterfaceArray{
							&cloudrunv2.JobTemplateTemplateVpcAccessNetworkInterfaceArgs{
								Network:    pulumi.String("default"),
								Subnetwork: pulumi.String("default"),
							},
						},
					},
				},
			},
		}, pulumi.DependsOn([]pulumi.Resource{instance, connection, image}))

		if err != nil {
			return err
		}

		// Create Cloud Scheduler job to trigger the notification dispatcher
		schedulerJob, err := cloudscheduler.NewJob(ctx, "notification-dispatcher-trigger", &cloudscheduler.JobArgs{
			Name:            pulumi.String("notification-dispatcher-trigger"),
			Description:     pulumi.String("Triggers the notification dispatcher job every minute"),
			Schedule:        pulumi.String("* * * * *"),
			TimeZone:        pulumi.String("UTC"),
			AttemptDeadline: pulumi.String("180s"),
			Region:          pulumi.String("australia-southeast1"),
			HttpTarget: &cloudscheduler.JobHttpTargetArgs{
				HttpMethod: pulumi.String("POST"),
				Uri:        pulumi.Sprintf("https://%s-run.googleapis.com/apis/run.googleapis.com/v1/namespaces/%s/jobs/notification-dispatcher:run", "australia-southeast1", "scriptag"),
				OauthToken: &cloudscheduler.JobHttpTargetOauthTokenArgs{
					ServiceAccountEmail: pulumi.String("scriptag@appspot.gserviceaccount.com"),
				},
			},
		}, pulumi.DependsOn([]pulumi.Resource{job}))

		if err != nil {
			return err
		}

		// Add required IAM permissions for Cloud Scheduler to invoke Cloud Run job
		_, err = cloudrunv2.NewJobIamMember(ctx, "notification-dispatcher-invoker", &cloudrunv2.JobIamMemberArgs{
			Name:     job.Name,
			Location: job.Location,
			Role:     pulumi.String("roles/run.invoker"),
			Member:   pulumi.Sprintf("serviceAccount:%s@appspot.gserviceaccount.com", "scriptag"),
		}, pulumi.DependsOn([]pulumi.Resource{schedulerJob}))

		if err != nil {
			return err
		}

		return nil
	})
}
