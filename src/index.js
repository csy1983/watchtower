/* eslint-disable no-unused-vars */
import http from 'http';
import express from 'express';
import router from './router';

const PORT = 5888;
const app = express();
const server = http.createServer(app);

app.use(router({
  uploadPath: '',
  sizeLimit: Infinity,
  mimeType: 'application/zip;application/gzip;application/x-gzip',
  onUpdateFound(containerInfo) {
    /* Send notifications */
  },
  willApplyUpdateFor(containerInfo, req, res) {
    if (containerInfo.isWatchtower) {
      /* Handle this request here because we are going to stop the server */
      res.status(202).send(containerInfo);
      /* Stop web server before updating it */
      server.close();
    }
  },
  didApplyUpdateFor(containerInfo, req, res) {
    if (containerInfo.isWatchtower) {
      /* Restart web server after watchtower container is updated */
      server.listen(PORT);
      /* Return true indicates that this request has been responsed */
      return true;
    }
    /* Return false indicates that the router has to respond this request */
    return false;
  },
}));

server.listen(PORT);
