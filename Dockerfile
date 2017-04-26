FROM mhart/alpine-node:6

COPY package.json /home/app/package.json
COPY dist /home/app

RUN set -ex && npm install --production

ENV LANG=C.UTF-8

LABEL com.centurylinklabs.watchtower="true" \
      tw.chardi.watchtower="true"

EXPOSE 5050

WORKDIR /home/app

CMD node index.js
