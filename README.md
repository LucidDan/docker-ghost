# docker-ghost

[![Build Status](https://travis-ci.org/LucidDan/docker-ghost.svg?branch=master)](https://travis-ci.org/LucidDan/docker-ghost)
[![Coverage Status](https://coveralls.io/repos/github/LucidDan/docker-ghost/badge.svg?branch=master)](https://coveralls.io/github/LucidDan/docker-ghost?branch=master)
[![Gitter](https://badges.gitter.im/LucidDan/docker-ghost.svg)](https://gitter.im/LucidDan/docker-ghost)

[Want to find out more about Ghost, the professional open-source publishing platform?](https://ghost.org/)

This repository builds a Docker container image for the Ghost publishing platform, designed to be used on a variety of cloud platforms and environments, with as many storage and scheduling options as we can reasonably manage and maintain.

## More details

First of all, if you're interested in trying Ghost, and you are at all unsure about how to get going, or you have no experience building custom solutions on platforms like AWS, Kubernetes, and Google Cloud: this project is not for you.

Seriously, if you're just looking for a cheap way to deploy a publishing platform, I strongly encourage you to pay the money and get a [Ghost(Pro) subsrciption](https://ghost.org/pricing/) - the hosted service is run by the Ghost Foundation, and all the money they make goes straight back into the foundation to pay for the infrastructure and the salaries of the core developers that make Ghost amazing.

That having been said, if you have a need or desire to run your own self-hosted Ghost server, this project is a great way to get that going.

The docker images built by this project are designed to run in a variety of cloud environments, at a minimum including:

- Heroku
- Google Cloud (GKE or GCE)
- AWS (EC2, EKS)
- Digital Ocean (Docker or Kubernetes)
- and probably many more; in theory, any Kubernetes based platform should work.

Database support and documentation is included for:
- Amazon RDS
- Google Cloud SQL
- Heroku JAWSDB

Mail integration support and documentation is included for:
- Mailgun

Adapters for storage and scheduling are included for:

- Amazon S3 (storage)
- Google Cloud Storage (storage)

Support for custom scheduling (e.g. Heroku scheduler) is currently in the works.

Looking into Digital Ocean block storage as well.

## Getting Started

You can deploy the Docker image directly from hub.docker.org.

Setup of a Ghost server can be quite involved; be sure to check the documentation for more guidance.

## Environment Variables

Here is a quick summary of the environment variables to pass through to the container.
Note that this does not include the low level Ghost environment variables, which are typically lower case (for example 'database__connection__filename').

| Variable Name | Ghost Config Node (if any) | Description |
| :---- | :----: | ---- |
| PORT | server.port | Defines the port to expose. Automatically defined by Heroku. GHOST_PORT overrides this |
| MAILGUN_SMTP_LOGIN | mail.options.auth.user | Mailgun user. Automatically defined by Heroku's Mailgun app. | 
| MAILGUN_SMTP_PASSWORD | mail.options.auth.pass | Mailgun password. Automatically defined by Heroku's Mailgun app. |
| JAWSDB_URL | database.connection.* | Connection URL for database. Automatically defined by Heroku's JAWSDB app. |
| MYSQL_DATABASE_URL | database.connection.* | Alternative connection URL for database. |
| CLEARDB_DATABASE_URL | database.connection.* | Alternative connection URL for database. |
| GHOST_PORT | server.port | The port to listen for connections on. |
| GHOST_ADMIN_URL | admin.url | The hostname and path of the admin site. |
| GHOST_PUBLIC_URL | url | The public URL used to access the blog site. |
| GHOST_MYSQL_DATABASE | database.connection.database | The name of the database to be used, if no URL specified. |
| GHOST_MYSQL_HOST | database.connection.host | The hostname of the database to be used, if no URL specified. |
| GHOST_MYSQL_PORT | database.connection.port | The TCP port of the database to be used, if no URL specified. |
| GHOST_MYSQL_USER | database.connection.user | The username of the database to be used, if no URL specified. |
| GHOST_MYSQL_PASSWORD | database.connection.password | The password of the database to be used, if no URL specified. |
| GHOST_MYSQL_CA | database.connection.ssl.ca | The contents of the CA for the server. If set to 'Amazon RDS', ignore the cert and key fields and use the special RDS profile. |
| GHOST_MYSQL_CERT | database.connection.ssl.cert | The contents of the public SSL certificate for this client. |
| GHOST_MYSQL_KEY | database.connection.ssl.key | The contents of the private SSL key for this client. |
| GHOST_MAIL_FROM | mail.from | The email 'From' address, in format '"Some Name" <email@address.com>' |
| GHOST_MAIL_USER | mail.options.auth.user | The username of the SMTP account to email from |
| GHOST_MAIL_PASSWORD | mail.options.auth.pass | The password of the SMTP account to email from |
| GHOST_LOG_LEVEL | logging.level | The logging level. Defaults to info, can be set to error or debug for less or more logging respectively. |
| GHOST_STORAGE_ADAPTER | storage.active | The active storage adapter |
| GHOST_STORAGE_GCLOUD_KEY | storage.gcloud.key | The contents of the Google service account credential JSON file. |
| GHOST_STORAGE_GCLOUD_PROJECT_ID | storage.gcloud.projectId | The Project ID in Google Storage for this bucket. |
| GHOST_STORAGE_GCLOUD_BUCKET | storage.gcloud.bucket | The name of the Google Storage bucket. May often be the domain name of the site. |
| GHOST_STORAGE_GCLOUD_MAX_AGE | storage.gcloud.maxAge | The maximum age of objects in Storage before they need to be replaced. | 
| GHOST_STORAGE_GCLOUD_ASSET_DOMAIN | storage.gcloud.assetDomain | The asset domain to access the storage bucket. |
| GHOST_STORAGE_S3_ACCESS_KEY_ID | storage.s3.accessKeyId | The AWS S3 access key. |
| GHOST_STORAGE_S3_SECRET_ACCESS_KEY | storage.s3.secretAccessKey | The AWS S3 secret access key. |
| GHOST_STORAGE_S3_BUCKET | storage.s3.bucket | The name of the S3 bucket to use for static files. | 
| GHOST_STORAGE_S3_REGION | storage.s3.region | The name of the AWS region where the S3 bucket is hosted. |
| GHOST_STORAGE_S3_ASSET_HOST | storage.s3.assetHost | The hostname to access assets in this bucket via a public URL. |
| GHOST_STORAGE_S3_BUCKET_SUBDIR | storage.s3.pathPrefix | The base subdirectory to access the assets in this bucket under. |

 
## Continuous Integration

Continuous Integration of the master branch is done via Travis-CI, with Docker images automatically deployed to Docker Hub whenever new code is commited to the master branch.

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the processes for contributing to the project.

## Versioning

We use [SemVer](http://semver.org/) for versioning. For the versions available, see the [tags on this repository](https://github.com/LucidDan/docker-ghost/tags).

## Authors

* [**Dan Sloan**](https://github.com/LucidDan) - primary maintainer - [website](https://luciddan.com) (yes, it runs on Ghost using this project)

See also the list of [contributors](https://github.com/LucidDan/docker-ghost/contributors) who have participated in this project.

## License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details

## Acknowledgments

* Ghost is amazing, and the Ghost Foundation is fantastic in the relatively unique model of non-profit open source development they've set up.
