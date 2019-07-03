/**
 * server.js
 *
 * A loader program to initialize and start up Ghost within a Docker container.
 * This program does a few important things;
 *  - Check various environment variables and set up config files, SSL certificates, etc.
 *  - Verify the database exists and is running, otherwise waits for it to start.
 *  - Tries to wrap some of Ghost's more obscure error reporting with better error output.
 */

// Built-in dependencies
const fs = require('fs');
const url = require('url');

// Third-party dependencies
// --

// Based around code from https://github.com/cobyism/ghost-on-heroku
function makeDbConfigFromUrl(mysqlUrl) {
    let dbConfig = url.parse(mysqlUrl);

    let dbAuth = dbConfig.auth ? dbConfig.auth.split(':') : [];
    let dbUser = dbAuth[0];
    let dbPassword = dbAuth[1];
    let dbName;

    if (dbConfig.pathname == null) {
        dbName = 'ghost';
    } else {
        dbName = dbConfig.pathname.split('/')[1];
    }

    return {
        host: dbConfig.hostname,
        port: dbConfig.port || '3306',
        user: dbUser,
        password: dbPassword,
        database: dbName
    }
}

function generateGhostConfig() {
    // Set up some sane default values and the overall config structure first
    let configData = {
        url: process.env.GHOST_PUBLIC_URL,
        server: {
            host: '0.0.0.0',
            port: 5000
        },
        database: {
            client: 'mysql'
        },
        mail: {
            from: process.env.GHOST_MAIL_FROM,
            transport: 'SMTP',
            options: {
                service: 'Mailgun',
                auth: {
                    user: process.env.GHOST_MAIL_USER || process.env.MAILGUN_SMTP_LOGIN,
                    pass: process.env.GHOST_MAIL_PASSWORD || process.env.MAILGUN_SMTP_PASSWORD
                }
            }
        },
        storage: {},
        scheduling: {},
        paths: {
            contentPath: '/home/node/ghost/content/'
        },
        logging: {
            level: 'info',
            transports: [
                'file',
                'stdout'
            ]
        }
    };

    // Look for JAWSDB_URL, MYSQL_DATABASE_URL, or CLEARDB_DATABASE_URL
    let dbUrl = process.env.JAWSDB_URL || process.env.MYSQL_DATABASE_URL || process.env.CLEARDB_DATABASE_URL;

    if (!!dbUrl) {
        configData.database.connection = makeDbConfigFromUrl(dbUrl);
    } else {
        configData.database.connection = {
            database: process.env.GHOST_MYSQL_DATABASE,
            host: process.env.GHOST_MYSQL_HOST,
            user: process.env.GHOST_MYSQL_USER,
            password: process.env.GHOST_MYSQL_PASSWORD,
            port: process.env.GHOST_MYSQL_PORT
        };
    }

    if (!!process.env.GHOST_MYSQL_CA) {
        if (process.env.GHOST_MYSQL_CA === 'Amazon RDS') {
            // Special case for Amazon RDS SSL profile
            configData.database.connection.ssl = 'Amazon RDS';
        } else {
            // In this case we have the certificates in env variables. Not ideal but it might work.
            configData.database.connection.ssl = {
                secureProtocol: 'TLSv1.2',
                ca: process.env.GHOST_MYSQL_CA,
                key: process.env.GHOST_MYSQL_KEY,
                cert: process.env.GHOST_MYSQL_CERT
            };
        }
    }

    if (!!process.env.GHOST_ADMIN_URL) {
        configData.admin = {
            url: process.env.GHOST_ADMIN_URL
        };
    }

    // Look for PORT, set by Heroku to indicate what port we should use.
    if (!!process.env.GHOST_PORT) {
        configData.server.port = parseInt(process.env.GHOST_PORT, 10);
    } else if (!!process.env.PORT) {
        configData.server.port = parseInt(process.env.PORT, 10);
    }

    configData.storage.active = process.env.GHOST_STORAGE_ADAPTER;

    switch (process.env.GHOST_STORAGE_ADAPTER) {
        case 'gcloud':
            // Generate Google cloud key from env variable, if it exists.
            if (!!process.env.GHOST_STORAGE_GCLOUD_KEY) {
                try {
                    // Extract the key and write it to a file.
                    fs.writeFileSync(
                        '/home/node/ghost/gcloud_key.json',
                        process.env.GHOST_STORAGE_GCLOUD_KEY,
                        'utf8',
                    );
                } catch (err) {
                    throw new Error('Error writing gcloud_key.json.' + (err ? err.toString() : '<unknown error>'));
                    // NEVERREACH
                }
            } else {
                throw new Error('The GCloud storage adapter requires a valid Google credential passed via GHOST_STORAGE_GCLOUD_KEY');
                // NEVERREACH
            }

            configData.storage.gcloud = {
                projectId: process.env.GHOST_STORAGE_GCLOUD_PROJECT_ID,
                key: '/home/node/ghost/gcloud_key.json',
                bucket: process.env.GHOST_STORAGE_GCLOUD_BUCKET,
                maxAge: process.env.GHOST_STORAGE_GCLOUD_MAX_AGE
            };

            if (!!process.env.GHOST_STORAGE_GCLOUD_ASSET_DOMAIN) {
                configData.storage.gcloud.assetDomain = process.env.GHOST_STORAGE_GCLOUD_ASSET_DOMAIN;
            }

            // Validate the storage config
            if (!configData.storage.gcloud.projectId || !configData.storage.gcloud.bucket) {
                throw new Error('The GCloud storage adapter requires valid values for GHOST_STORAGE_GCLOUD_PROJECT_ID and GHOST_STORAGE_GCLOUD_BUCKET');
                // NEVERREACH
            }

            break;

        case 's3':
            configData.storage.s3 = {
                accessKeyId: process.env.GHOST_STORAGE_S3_ACCESS_KEY_ID,
                secretAccessKey: process.env.GHOST_STORAGE_S3_SECRET_ACCESS_KEY,
                bucket: process.env.GHOST_STORAGE_S3_BUCKET,
                region: process.env.GHOST_STORAGE_S3_REGION,
            };

            if (!!process.env.GHOST_STORAGE_S3_ASSET_HOST) {
                configData.storage.s3.assetHost = process.env.GHOST_STORAGE_S3_ASSET_HOST;
            }
            if (!!process.env.GHOST_STORAGE_S3_BUCKET_SUBDIR) {
                configData.storage.s3.pathPrefix = process.env.GHOST_STORAGE_S3_BUCKET_SUBDIR;
            }

            // Validate the storage config
            if (!configData.storage.s3.accessKeyId || !configData.storage.s3.secretAccessKey || !configData.storage.s3.bucket) {
                throw new Error('The S3 storage adapter requires valid values for GHOST_STORAGE_S3_ACCESS_KEY_ID, GHOST_STORAGE_S3_SECRET_ACCESS_KEY, and GHOST_STORAGE_S3_BUCKET');
                // NEVERREACH
            }

            break;

        case 'digitalocean':
            configData.storage.digitalocean = {
                key: process.env.GHOST_STORAGE_DO_KEY,
                secret: process.env.GHOST_STORAGE_DO_SECRET,
                bucket: process.env.GHOST_STORAGE_DO_BUCKET,
                region: process.env.GHOST_STORAGE_DO_REGION,
            };
            if (!!process.env.GHOST_STORAGE_DO_SPACEURL) {
                configData.storage.digitalocean.spaceUrl = process.env.GHOST_STORAGE_DO_SPACEURL;
            }
            if (!!process.env.GHOST_STORAGE_DO_SUBFOLDER) {
                configData.storage.digitalocean.subFolder = process.env.GHOST_STORAGE_DO_SUBFOLDER;
            }
            if (!!process.env.GHOST_STORAGE_DO_ENDPOINT) {
                configData.storage.digitalocean.endpoint = process.env.GHOST_STORAGE_DO_ENDPOINT;
            }

            // Validate the storage config
            if (!configData.storage.digitalocean.key || !configData.storage.digitalocean.secret || !configData.storage.digitalocean.bucket || !configData.storage.digitalocean.region) {
                throw new Error('The Digital Ocean storage adapter requires valid values for GHOST_STORAGE_DO_KEY, GHOST_STORAGE_DO_SECRET, GHOST_STORAGE_DO_BUCKET, and GHOST_STORAGE_DO_REGION');
                // NEVERREACH
            }
            break;
            // NEVERREACH

        default:
            throw new Error(`Unknown storage adapter '${process.env.GHOST_STORAGE_ADAPTER}'`);
        // NEVERREACH

        case 'local':
            // Local file storage is not supported, but we could add the ability to use a docker volume in future...??
            throw new Error('Storage adapter "local" is not supported.');
        // NEVERREACH
    }

    if (!configData.url) {
        throw new Error('A valid GHOST_PUBLIC_URL is required to start the Ghost service.');
    }
    if (!configData.mail.from) {
        throw new Error('A GHOST_MAIL_FROM is required to start the Ghost service.');
    }
    if (!configData.mail.options.auth.user) {
        throw new Error('A GHOST_MAIL_USER is required to start the Ghost service.');
    }
    if (!configData.mail.options.auth.pass) {
        throw new Error('A GHOST_MAIL_PASSWORD is required to start the Ghost service.');
    }

    if (
        !configData.database.connection.database
        || !configData.database.connection.host
        || !configData.database.connection.port
        || !configData.database.connection.user
        || !configData.database.connection.password
    ) {
        throw new Error('Ghost requires a complete MYSQL configuration including host, user, port, password, and database name');
        // NEVERREACH
    }

    return configData;
}

module.exports.generateGhostConfig = generateGhostConfig;
module.exports.makeDbConfigFromUrl = makeDbConfigFromUrl;

