FROM node:10

WORKDIR /app

ADD package.json /app/package.json

ENV APIFY_LOCAL_STORAGE_DIR /data

EXPOSE 3000

RUN npm install

ADD . /app

CMD npm start