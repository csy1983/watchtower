/* eslint-disable no-unused-vars */
import 'babel-polyfill';
import http from 'http';
import express from 'express';
import Watchtower from 'node-watchtower';
import router from './router';

const PORT = 5050;
const DEFAULT_UPDATE_INTERVAL = 180;
const DEFAULT_TIME_TO_WAIT_BEFORE_HEALTHY_CHECK = 10;

const app = express();
const server = http.createServer(app);

const watchtower = new Watchtower({
  checkUpdateInterval: DEFAULT_UPDATE_INTERVAL,
  timeToWaitBeforeHealthyCheck: DEFAULT_TIME_TO_WAIT_BEFORE_HEALTHY_CHECK,
  pruneImages: true,
  retireOldWatchtower: true,
});

app.use(router(watchtower, {
  uploadPath: '',
  webhookPersistPath: '',
  sizeLimit: Infinity,
  mimeType: 'application/zip;application/gzip;application/x-gzip;application/octet-stream',
  willApplyUpdateForWatchtower(containerInfo) {
    /* Stop web server before updating it */
    server.close();
  },
  didApplyUpdateForWatchtower(containerInfo) {
    /* Restart web server after watchtower container is updated */
    server.listen(PORT, 'localhost');
  },
  didFailedToApplyUpdateForWatchtower(error, containerInfo) {
    /* Restart previous working version of web server */
    server.listen(PORT, 'localhost');
  },
}));

function retry() {
  console.log('Address in use, retrying...');
  setTimeout(() => {
    server.listen(PORT, 'localhost');
  }, 3000);
}

process.on('uncaughtException', (error) => {
  if (error.errno === 'EADDRINUSE') {
    retry();
  } else {
    console.log(error);
    process.exit(1);
  }
});

server.listen(PORT, 'localhost');
