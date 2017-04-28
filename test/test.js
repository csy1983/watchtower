/* eslint-disable no-undef, prefer-arrow-callback, func-names, space-before-function-paren */
import debug from 'debug';
import fetch from 'node-fetch';
import fs from 'fs-extra';
import FormData from 'form-data';
import Docker from 'dockerode';
import os from 'os';
import WebhookServer from './webhook-server';
import '../src';

const TEST_REPO_LATEST = 'alpine';
const TEST_REPO_OLD = 'alpine:3.4';
const TEST_PRIVATE_IMAGE = 'test/images/alpine-3.5.tar.gz';
const TEST_PRIVATE_REPO = 'csy-mbp:5000/alpine';
const DEBUG = debug('node-watchtower:test');
const docker = new Docker();
const serverURL = 'http://localhost:5050';
const webhookServerURL = 'http://localhost:8080';
const webhookServer = new WebhookServer();
const testRegistry = {
  serveraddress: 'csy-mbp:5000',
  username: 'csy',
  password: 'chardi',
  auth: '',
  email: '',
};

describe('Watchtower Server', function() {
  describe('check version test', function() {
    it('should return server version', function(done) {
      fetch(`${serverURL}/version`).then((res) => {
        if (res.status === 200) {
          return res.buffer();
        }
        done(res);
      }).then((buf) => {
        DEBUG(`Server version is ${buf.toString()}`);
        done();
      });
    });
  });

  describe('configure server test', function() {
    it('should return 200 OK', function(done) {
      let form = [
        encodeURI('checkUpdateInterval=120'),
        encodeURI('timeToWaitBeforeHealthyCheck=5'),
      ];
      fetch(`${serverURL}/config`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: form.join('&'),
      })
      .then((res) => {
        if (res.status === 200) done();
        else done(res.status);
      });
    });
  });

  describe('add registry server test', function() {
    it('should return 200 OK', function(done) {
      let form = [
        encodeURI(`serveraddress=${testRegistry.serveraddress}`),
        encodeURI(`username=${testRegistry.username}`),
        encodeURI(`password=${testRegistry.password}`),
        encodeURI(`auth=${testRegistry.auth}`),
        encodeURI(`email=${testRegistry.email}`),
      ];

      fetch(`${serverURL}/registry`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: form.join('&'),
      })
      .then((res) => {
        if (res.status === 200) done();
        else done(res.status);
      });
    });
  });

  describe('add/remove webhooks test', function() {
    it('should add updateFound event webhook and return 200 OK', function(done) {
      let form = [
        encodeURI('event=updateFound'),
        encodeURI(`url=${webhookServerURL}/update/found`),
      ];

      fetch(`${serverURL}/webhook`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: form.join('&'),
      })
      .then((res) => {
        if (res.status === 200) done();
        else done(res.status);
      });
    });

    it('should add updateNotFound event webhook and return 200 OK', function(done) {
      let form = [
        encodeURI('event=updateNotFound'),
        encodeURI(`url=${webhookServerURL}/update/notfound`),
      ];

      fetch(`${serverURL}/webhook`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: form.join('&'),
      })
      .then((res) => {
        if (res.status === 200) done();
        else done(res.status);
      });
    });

    it('should add dummy updateFound event webhook for remove test and return 200 OK', function(done) {
      let form = [
        encodeURI('event=updateFound'),
        encodeURI('url=http://localhost/dummy'),
      ];

      fetch(`${serverURL}/webhook`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: form.join('&'),
      })
      .then((res) => {
        if (res.status === 200) done();
        else done(res.status);
      });
    });

    it('should verify webhook database and match the expected result', function(done) {
      fs.readJson(`${os.homedir()}/.watchtower/webhook/db.json`, (readError, webhooks) => {
        if (readError) {
          throw new Error(`Unable to read webhook config file. ${readError.message}`);
        }

        if (webhooks.updateFound.includes(`${webhookServerURL}/update/found`) &&
          webhooks.updateFound.includes('http://localhost/dummy') &&
          webhooks.updateNotFound.includes(`${webhookServerURL}/update/notfound`)) {
          done();
        } else {
          done('Webhook database error');
        }
      });
    });

    it('should remove dummy updateFound event webhook and return 200 OK', function(done) {
      let form = [
        encodeURI('event=updateFound'),
        encodeURI('url=http://localhost/dummy'),
      ];

      fetch(`${serverURL}/webhook`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: form.join('&'),
      })
      .then((res) => {
        if (res.status === 200) done();
        else done(res.status);
      });
    });

    it('should verify webhook database again and match the expected result', function(done) {
      fs.readJson(`${os.homedir()}/.watchtower/webhook/db.json`, (readError, webhooks) => {
        if (readError) {
          throw new Error(`Unable to read webhook config file. ${readError.message}`);
        }

        if (webhooks.updateFound.includes(`${webhookServerURL}/update/found`) &&
          webhooks.updateNotFound.includes(`${webhookServerURL}/update/notfound`)) {
          done();
        } else {
          done('Webhook database error');
        }
      });
    });
  });

  describe('prepare image upload test', function() {
    this.timeout(60000);

    it(`should remove ${TEST_PRIVATE_REPO} container`, function(done) {
      docker.listContainers().then((containers) => {
        let testContainers = containers.filter(container => container.Image.includes(TEST_PRIVATE_REPO));
        if (testContainers.length > 0) {
          docker.getContainer(testContainers[0].Id).stop()
            .then(() => docker.getContainer(testContainers[0].Id).remove())
            .then(done)
            .catch(done);
        } else {
          done();
        }
      });
    });

    it(`should remove ${TEST_PRIVATE_REPO} image`, function(done) {
      docker.getImage(TEST_PRIVATE_REPO).remove()
        .then(() => done())
        .catch(() => done());
    });

    it(`should pull ${TEST_REPO_OLD}`, function(done) {
      docker.pull(`${TEST_REPO_OLD}`, (error, stream) => {
        if (error) {
          done(error);
          return;
        }

        docker.modem.followProgress(stream, (progressError) => {
          done(progressError);
        });
      });
    });

    it(`should tag ${TEST_REPO_OLD} to ${TEST_PRIVATE_REPO}`, function(done) {
      docker.getImage(TEST_REPO_OLD).tag({ repo: TEST_PRIVATE_REPO, tag: 'latest' })
        .then(() => done())
        .catch(error => done(error));
    });

    it(`should run ${TEST_PRIVATE_REPO} in detach mode`, function(done) {
      docker.createContainer({
        _query: { name: 'private-alpine-for-test' },
        Image: TEST_PRIVATE_REPO,
        Cmd: ['/bin/ping', 'www.google.com'],
      })
      .then(container => container.start())
      .then(() => done())
      .catch(done);
    });
  });

  describe('upload image test', function() {
    this.timeout(60000);

    it('should upload an image', function(done) {
      const form = new FormData();
      form.append('image-file', fs.createReadStream(TEST_PRIVATE_IMAGE));
      fetch(`${serverURL}/upload?latest=1`, {
        method: 'POST',
        headers: form.getHeaders(),
        body: form,
      })
      .then((res) => {
        res.text().then((repoTag) => {
          DEBUG(repoTag);
          if (res.status === 200) {
            done();
          } else {
            done(repoTag);
          }
        });
      });
    });

    it('should set shorter polling interval for the test', function(done) {
      fetch(`${serverURL}/pollint`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: 'checkUpdateInterval=5',
      })
      .then((res) => {
        if (res.status === 200) done();
        else done(res.status);
      });
    });

    it('should get updateFound event', function(done) {
      webhookServer.on('webhookUpdateFound', (image) => {
        webhookServer.removeAllListeners();
        if (image === TEST_PRIVATE_REPO) done();
        else done(image);
      });
    });

    it('should set back to longer polling interval', function(done) {
      fetch(`${serverURL}/pollint`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: 'checkUpdateInterval=180',
      })
      .then((res) => {
        if (res.status === 200) done();
        else done(res.status);
      });
    });

    it('should apply update without error', function(done) {
      fetch(`${serverURL}/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `image=${TEST_PRIVATE_REPO}`,
      })
      .then((res) => {
        if (res.status === 200) done();
        else done(res.status);
      });
    });
  });

  describe('prepare pull latest image test', function() {
    this.timeout(60000);

    it(`should remove ${TEST_REPO_LATEST} container`, function(done) {
      docker.listContainers().then((containers) => {
        let testContainers = containers.filter(container => (
          container.Image === TEST_REPO_LATEST
        ));
        if (testContainers.length > 0) {
          docker.getContainer(testContainers[0].Id).stop()
            .then(() => docker.getContainer(testContainers[0].Id).remove())
            .then(done)
            .catch(done);
        } else {
          done();
        }
      });
    });

    it(`should remove ${TEST_REPO_LATEST} image`, function(done) {
      docker.getImage(TEST_REPO_LATEST).remove()
        .then(() => done())
        .catch(() => done());
    });

    it(`should tag ${TEST_REPO_OLD} to ${TEST_REPO_LATEST}`, function(done) {
      docker.getImage(TEST_REPO_OLD).tag({ repo: TEST_REPO_LATEST, tag: 'latest' })
        .then(() => done())
        .catch(error => done(error));
    });

    it(`should run ${TEST_REPO_LATEST} in detach mode`, function(done) {
      docker.createContainer({
        _query: { name: 'alpine-for-test' },
        Image: TEST_REPO_LATEST,
        Cmd: ['/bin/ping', 'www.google.com'],
      })
      .then(container => container.start())
      .then(() => done())
      .catch(done);
    });
  });

  describe('auto pull latest image from docker hub test', function() {
    this.timeout(60000);

    it('should set shorter polling interval for the test', function(done) {
      fetch(`${serverURL}/pollint`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: 'checkUpdateInterval=5',
      })
      .then((res) => {
        if (res.status === 200) done();
        else done(res.status);
      });
    });

    it('should get updateFound event', function(done) {
      webhookServer.on('webhookUpdateFound', (image) => {
        webhookServer.removeAllListeners();
        if (image === TEST_REPO_LATEST) done();
        else done(image);
      });
    });

    it('should set back to longer polling interval', function(done) {
      fetch(`${serverURL}/pollint`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: 'checkUpdateInterval=180',
      })
      .then((res) => {
        if (res.status === 200) done();
        else done(res.status);
      });
    });

    it('should apply update without error', function(done) {
      fetch(`${serverURL}/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `image=${TEST_REPO_LATEST}`,
      })
      .then((res) => {
        if (res.status === 200) done();
        else done(res.status);
      });
    });
  });
});

describe('Cleanup Test', function() {
  this.timeout(30000);
  it('should stop and remove test container', function(done) {
    docker.listContainers().then((containers) => {
      let testContainers = containers.filter(container => (
        container.Image === TEST_REPO_LATEST || container.Image === TEST_PRIVATE_REPO
      ));
      if (testContainers.length > 0) {
        Promise.all(testContainers.map(container => (
          docker.getContainer(container.Id).stop()
            .then(() => docker.getContainer(container.Id).remove())
        ))).then(() => done()).catch(done);
      } else {
        done('No test container found');
      }
    });
  });

  it('should remove test images', function(done) {
    docker.getImage(TEST_REPO_LATEST).remove()
      .then(() => docker.getImage(TEST_REPO_OLD).remove())
      .then(() => docker.getImage(TEST_PRIVATE_REPO).remove())
      .then(() => done())
      .catch(done);
  });
});
