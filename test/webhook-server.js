import bodyParser from 'body-parser';
import express from 'express';
import EventEmitter from 'events';
import http from 'http';

export default class WebhookServer extends EventEmitter {
  constructor() {
    super();
    this.app = express();
    this.server = http.createServer(this.app);
    this.found = '';
    this.notfound = '';

    this.app.use(bodyParser.urlencoded({ extended: false }));

    this.app.get('/update/found', (req, res) => {
      if (this.found) res.status(200).send(this.found);
      else res.sendStatus(404);
    });

    this.app.post('/update/found', (req) => {
      const image = req.body.image;
      this.emit('webhookUpdateFound', image);
    });

    this.app.get('/update/notfound', (req, res) => {
      if (this.notfound) res.status(200).send(this.notfound);
      else res.sendStatus(404);
    });

    this.app.post('/update/notfound', (req) => {
      const image = req.body.image;
      this.emit('webhookUpdateNotFound', image);
    });

    this.server.listen(8080);
  }
}
