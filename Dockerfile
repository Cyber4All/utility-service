# Anything beyond local dev should pin this to a specific version at https://hub.docker.com/_/node/
FROM node:8

WORKDIR /user/app

COPY . .

RUN npm install

CMD ["npm", "start"]








