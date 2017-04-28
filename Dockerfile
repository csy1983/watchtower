FROM mhart/alpine-node:6

COPY package.json /home/app/package.json
COPY dist /home/app

WORKDIR /home/app

RUN set -ex && npm install --production

ENV LANG=C.UTF-8

LABEL com.centurylinklabs.watchtower="true" \
      tw.chardi.watchtower="true" \
      com.docker.compose.service-config="{\"image\":\"weblab-master:5000/watchtower\",\"container_name\":\"watchtower\",\"restart\":\"unless-stopped\",\"ports\":[\"5050:5050\"],\"privileged\":true,\"network_mode\":\"host\",\"volumes\":[\"/var/run/docker.sock:/var/run/docker.sock\",\"/tmp:/tmp\"]}"

EXPOSE 80-65535

ENTRYPOINT ["node", "index.js"]
