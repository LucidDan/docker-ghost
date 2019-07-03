# Notes:
#  - We are using 10.15.0 instead of the latest NodeJS, because of https://github.com/nodejs/node/issues/26315

# ##### Multi-stage build: #####
# first stage has all the bits we need (git etc) to build node_modules/ and content/
FROM node:10.15.0-alpine as builder

# This makes npm install -g install to a known directory that we can copy across
# (not sure why we can't just PATH to the node_modules directory?)
ENV NPM_CONFIG_PREFIX=/home/node/.npm-global
ENV GHOST_VERSION 2.25.4
ENV GHOST_INSTALL /home/node/ghost/

WORKDIR $GHOST_INSTALL

# For ghost install;
# We have to add some stuff for the database to stop it freaking out.
# It would be really nice if ghost install had a '--docker' flag or something.
# We also remove all of content/, because we'll replace it in the next command with our own.
# Note we use su-exec here in the builder, NEVER put that in the main container for security.
RUN apk add --update git python make g++ su-exec \
	&& chown node "$GHOST_INSTALL" \
	&& su-exec node npm install -g ghost-cli@latest mocha \
	&& su-exec node mkdir -p "$GHOST_INSTALL" \
	&& su-exec node /home/node/.npm-global/bin/ghost install "$GHOST_VERSION" --no-prompt --no-setup --disable --no-check-mem --dir "$GHOST_INSTALL" --ip 0.0.0.0 --port 2368 --url https://localhost:2368 --db mysql --dbhost db --dbuser mysql --dbpass mysql --dbname ghost_prod --no-stack --no-start \
	&& rm -rf "$GHOST_INSTALL/content" 

# Copy package.json and the content directory to the builder
COPY --chown=node package.json npm-shrinkwrap.json ./
# We can't do this until we've done ghost install
COPY --chown=node content ./content
# We can't do this until we've copied across the ./content directory
RUN su-exec node npm install \
	&& mkdir -p ./content/adapters/storage \
	&& cp -r ./node_modules/ghost-digitalocean ./content/adapters/storage/digitalocean \
	&& cp -r ./node_modules/ghost-google-cloud-storage-new ./content/adapters/storage/gcloud \
	&& cp -r ./node_modules/ghost-storage-adapter-s3 ./content/adapters/storage/s3 \
	&& rm -rf package.json npm-shrinkwrap.json

# ##### END BUILDER IMAGE #####


# ##### Now for the actual real image: #####
# This image is separate to cut down image size by not including git etc.
FROM node:10.15.0-alpine

# set the npm global location and add it to path to make life easier
ENV NPM_CONFIG_PREFIX=/home/node/.npm-global
ENV PATH=$PATH:/home/node/.npm-global/bin
# This is for production
ENV NODE_ENV production
ENV GHOST_ENVIRONMENT production

RUN apk add --update mysql-client
USER node

# Copy ghost itself and the ghost-cli across from the builder image
COPY --from=builder --chown=node /home/node/ghost /home/node/ghost/
COPY --from=builder --chown=node /home/node/.npm-global /home/node/.npm-global/
# Copy from our repo - this is our bootstrap code that generates and validates config
COPY --chown=node server.js /home/node/ghost/

WORKDIR /home/node/ghost/

CMD ["node", "main.js"]

EXPOSE 5000

