FROM node:16.14.0-alpine3.15 AS NODE

RUN mkdir /app

COPY . /app/

RUN cd /app && npm install
