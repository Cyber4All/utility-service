FROM node:8

WORKDIR /user/app

COPY . .

RUN npm install

CMD ["npm", "start"]








