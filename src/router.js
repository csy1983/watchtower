import bodyParser from 'body-parser';
import debug from 'debug';
import express from 'express';
import fetch from 'node-fetch';
import fs from 'fs-extra';
import multer from 'multer';
import os from 'os';
import { version } from '../package.json';

const IMAGE_UPLOAD_PATH = `${os.homedir()}/.watchtower/images`;
const WEBHOOK_PERSIST_PATH = `${os.homedir()}/.watchtower/webhook`;
const WEBHOOK_PERSIST_FILE = 'db.json';
const DEBUG = debug('watchtower:server');

/**
 * Create watchtower express router.
 */
export default function (watchtower, options) {
  const router = express.Router();
  const webhookPersistFile = `${WEBHOOK_PERSIST_PATH}/${WEBHOOK_PERSIST_FILE}`;
  let webhookPersist = {
    updateFound: [],
    updateNotFound: [],
  };

  /* Create webhook persistence path */
  fs.ensureDirSync(WEBHOOK_PERSIST_PATH);

  /* Check existence for webhook config file */
  fs.access(webhookPersistFile, fs.constants.R_OK | fs.constants.W_OK, (error) => {
    if (error) {
      /* Create default webhook config file */
      fs.writeJson(webhookPersistFile, webhookPersist, (writeError) => {
        if (writeError) {
          throw new Error(`Unable to create webhook config file. ${writeError.message}`);
        }
      });
    } else {
      fs.readJson(webhookPersistFile, (readError, data) => {
        if (readError) {
          throw new Error(`Unable to read webhook config file. ${readError.message}`);
        }
        webhookPersist = data;
      });
    }
  });

  const storage = multer.diskStorage({
    destination(req, file, cb) {
      /* Create a clean image folder */
      fs.removeSync(IMAGE_UPLOAD_PATH);
      fs.mkdirp(IMAGE_UPLOAD_PATH, err => cb(err, IMAGE_UPLOAD_PATH));
    },
    filename(req, file, cb) {
      cb(null, `${file.fieldname}-${Date.now()}`);
    },
  });

  const uploader = multer({
    storage,
    limits: { fileSize: options.sizeLimit || Infinity },
    fileFilter(req, file, cb) {
      if (options.mimeType && options.mimeType.indexOf(file.mimetype) < 0) {
        cb({ code: 415, message: `Bad MIME Type:${file.mimetype}` });
      } else {
        cb(null, true);
      }
    },
  }).any();

  watchtower.on('updateFound', (image) => {
    DEBUG(`Got 'updateFound' event for ${image}`);
    webhookPersist.updateFound.forEach((webhook) => {
      DEBUG(`Calling webhook: ${webhook}`);
      fetch(webhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `image=${image}`,
      }).then((res) => {
        DEBUG(`Sent 'updateFound' event with image ${image} to ${webhook}.`);
        if (res.status === 202) {
          /* Apply update immediately */
          DEBUG(`Apply update for ${image} immediately`);
          const containerInfo = watchtower.getAvailableUpdate(image);
          if (containerInfo) {
            if (watchtower.isWatchtower(containerInfo)) {
              if (options.willApplyUpdateForWatchtower) {
                options.willApplyUpdateForWatchtower(containerInfo);
              }
            }

            watchtower.applyUpdate(containerInfo).then(() => {
              if (watchtower.isWatchtower(containerInfo)) {
                if (options.didApplyUpdateForWatchtower) {
                  options.didApplyUpdateForWatchtower(containerInfo);
                }
              }
            }).catch((error) => {
              if (watchtower.isWatchtower(containerInfo)) {
                if (options.didFailedToApplyUpdateForWatchtower) {
                  options.didFailedToApplyUpdateForWatchtower(error, containerInfo);
                }
              }
              DEBUG(`Failed to apply update immediately. ${error}`);
            });
          }
        }
      })
      .catch((error) => {
        DEBUG(`Failed to POST 'updateFound' event with image ${image} to ${webhook}. ${error}`);
      });
    });
  });

  watchtower.on('updateNotFound', (image) => {
    DEBUG(`Got 'updateNotFound' event for ${image}`);

    webhookPersist.updateNotFound.forEach((webhook) => {
      DEBUG(`Calling webhook: ${webhook}`);
      fetch(webhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `image=${image}`,
      }).then((res) => { // eslint-disable-line
        DEBUG(`Sent 'updateNotFound' event with image ${image} to ${webhook}.`);
      })
      .catch((error) => {
        DEBUG(`Failed to POST 'updateNotFound' event with image ${image} to ${webhook}. ${error}`);
      });
    });
  });

  /* Activate watchtower with default configs */
  watchtower.activate();

  /* Parse application/x-www-form-urlencoded */
  router.use(bodyParser.urlencoded({ extended: false }));

  /**
   * Get watchtower server version
   */
  router.get('/version', (req, res) => {
    DEBUG(`[version] ${version}`);
    res.status(200).send(version);
  });

  /**
   * Restart watchtower with new configs
   * @param  {Number} checkUpdateInterval          Check update interval in seconds
   * @param  {Number} timeToWaitBeforeHealthyCheck Time to wait before healthy for updated containers
   * @return {Status} 200                          Success
   * @return {Status} 400                          Bad parameters
   * @return {String} 500                          Error message
   */
  router.post('/config', (req, res) => {
    const checkUpdateInterval = req.body.checkUpdateInterval;
    const timeToWaitBeforeHealthyCheck = req.body.timeToWaitBeforeHealthyCheck;

    /* Update watchtower and restart it */
    let error = watchtower.updateConfig({
      checkUpdateInterval,
      timeToWaitBeforeHealthyCheck,
    });

    if (error) res.sendStatus(400);
    else res.sendStatus(200);
  });

  /**
   * Set update check polling interval
   * @param  {Number} checkUpdateInterval Check update interval
   * @return {Status} 200                 Success
   */
  router.put('/pollint', (req, res) => {
    const checkUpdateInterval = req.body.checkUpdateInterval;
    let error = watchtower.updateConfig({ checkUpdateInterval });
    if (error) res.sendStatus(400);
    else res.sendStatus(200);
  });

  /**
   * Add registry server auth info
   * @param  {String} serveraddress Registry server URL
   * @param  {String} username      Login user name
   * @param  {String} password      Login password
   * @param  {String} auth          Base64 encoded auth credentials (Optional)
   * @param  {String} email         User email (Optional)
   * @return {Status} 200           Success
   * @return {Status} 400           Bad parameters
   */
  router.post('/registry', (req, res) => {
    const { serveraddress, username, password, auth, email } = req.body;
    if (watchtower.addRegistryAuth({ serveraddress, username, password, auth, email })) {
      res.sendStatus(200);
    } else {
      res.sendStatus(400);
    }
  });

  /**
   * Add webhooks for given event.
   * Events available:
   *   'updateFound'
   *   'updateNotFound'
   *
   * @param  {String} event Event name to listen
   * @param  {String} url   Webhook URL for the event
   * @return {Status} 200   Success
   * @return {Status} 400   Invalid parameters
   * @return {Status} 404   Given event not found
   * @return {String} 500   Error message
   */
  router.post('/webhook', (req, res) => {
    const { event, url } = req.body;

    if (!event || !url) {
      res.sendStatus(400);
    } else if (!webhookPersist[event]) {
      res.sendStatus(404);
    } else if (webhookPersist[event].indexOf(url) >= 0) {
      res.sendStatus(200);
    } else {
      webhookPersist[event].push(url);
      fs.writeJson(webhookPersistFile, webhookPersist, (writeError) => {
        if (writeError) {
          res.status(500).send(`Unable to write webhook config file. ${writeError.message}`);
        } else {
          res.sendStatus(200);
        }
      });
    }
  });

  /**
   * Remove webhook URL from given event.
   * @param  {String} event Event name of the webhook
   * @param  {String} url   Webhook URL to be removed from given event
   * @return {Status} 200   Success
   * @return {Status} 400   Invalid parameters
   * @return {Status} 404   Given event or URL not found
   * @return {String} 500   Error message
   */
  router.delete('/webhook', (req, res) => {
    const { event, url } = req.body;

    if (!event || !url) {
      res.sendStatus(400);
    } else if (!webhookPersist[event] || webhookPersist[event].indexOf(url) < 0) {
      res.sendStatus(404);
    } else {
      let index = webhookPersist[event].indexOf(url);
      webhookPersist[event].splice(index, 1);
      fs.writeJson(webhookPersistFile, webhookPersist, (writeError) => {
        if (writeError) {
          res.status(500).send(`Unable to write webhook config file. ${writeError.message}`);
        } else {
          res.sendStatus(200);
        }
      });
    }
  });

  /**
   * Apply update for given image
   * @param  {String} image Image repo:tag to be applied
   * @return {Object} 200   Updated container info object
   * @return {Status} 202   Updating watchtower image, server will shutdown for a while
   * @return {Status} 404   Image not found
   * @return {String} 500   Error message
   */
  router.post('/apply', (req, res) => {
    const containerInfo = watchtower.getAvailableUpdate(req.body.image);
    if (containerInfo) {
      if (watchtower.isWatchtower(containerInfo)) {
        res.status(202).send(containerInfo);

        if (options.willApplyUpdateForWatchtower) {
          options.willApplyUpdateForWatchtower(containerInfo);
        }
      }

      DEBUG(`[apply] applying image ${req.body.image}`);
      watchtower.applyUpdate(containerInfo).then((updatedContainerInfo) => {
        if (watchtower.isWatchtower(containerInfo)) {
          if (options.didApplyUpdateForWatchtower) {
            options.didApplyUpdateForWatchtower(containerInfo);
          }
        } else {
          res.status(200).send(updatedContainerInfo);
        }
      }).catch((error) => {
        DEBUG(`[apply] apply image ${req.body.image} failed: ${error.message}`);
        if (watchtower.isWatchtower(containerInfo)) {
          if (options.didFailedToApplyUpdateForWatchtower) {
            options.didFailedToApplyUpdateForWatchtower(error, containerInfo);
          }
        }
        res.status(500).send(error.message);
      });
    } else {
      DEBUG(`[apply] image ${req.body.image} not found`);
      res.sendStatus(404);
    }
  });

  /**
   * Upload image and load it to local docker environment
   * @param  {Boolean} latest Tag image to latest
   * @param  {File}    file   File to upload
   * @return {Array}   200    Repo tags of the image
   * @return {String}  500    Error message
   */
  router.post('/upload', (req, res) => {
    DEBUG('[upload] Initiating uploader...');
    uploader(req, res, (uploadError) => {
      if (uploadError) {
        DEBUG('[upload] Upload error', uploadError);
        res.status(uploadError.code).send(uploadError.message);
        return;
      }

      DEBUG(`[upload] Uploading ${req.files[0].path}`);
      watchtower.upload(req.files[0].path, {
        tagToLatest: !!req.query.latest,
        registryURL: req.query.registry,
      }).then((repoTag) => {
        DEBUG(`[upload] Upload successfully: ${repoTag}`);
        /* Image file has been loaded, remove it */
        fs.remove(req.files[0].path);
        res.status(200).send(repoTag);
      }).catch((error) => {
        DEBUG(`[upload] Upload failed: ${error}`);
        res.status(500).send(error.message);
      });
    });
  });

  return router;
}
