# Anything beyond local dev should pin this to a specific version at https://hub.docker.com/_/node/
# FROM node:8

# # install dependencies in a different location for easier app bind mounting for local development
# WORKDIR /user
# COPY package.json package-lock.json* jest.config.js tsconfig.json ./
# RUN npm install && npm cache clean --force
# ENV PATH /opt/node_modules/.bin:$PATH

# WORKDIR /user/app
# COPY . /user/app

# # Build source and clean up
# RUN npm run build
# RUN npm install

# CMD ["npm", "start"]

# Anything beyond local dev should pin this to a specific version at https://hub.docker.com/_/node/
FROM node:8

WORKDIR /user/app

COPY . .

RUN npm install

CMD ["npm", "start"]








