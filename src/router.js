import express from 'express';
import fs from 'fs-extra';
import multer from 'multer';
import os from 'os';
import Watchtower from 'node-watchtower';
import { version } from '../package.json';

const DEFAULT_UPDATE_INTERVAL = 3;
const DEFAULT_TIME_TO_WAIT_BEFORE_HEALTHY_CHECK = 10;
const DEFAULT_UPDATE_IMAGE_PATH = `${os.homedir()}/.watchtower/images`;

/**
 * Create watchtower express router.
 */
export default function (options) {
  const router = express.Router();
  const availableUpdates = {};

  let watchtower = new Watchtower({
    checkUpdateInterval: DEFAULT_UPDATE_INTERVAL,
    timeToWaitBeforeHealthyCheck: DEFAULT_TIME_TO_WAIT_BEFORE_HEALTHY_CHECK,
  });

  function addEventListeners() {
    watchtower.on('updateFound', (containerInfo) => {
      availableUpdates[containerInfo.Image] = containerInfo;
      if (options.onUpdateFound) {
        containerInfo.isWatchtower = watchtower.isWatchtower(containerInfo);
        options.onUpdateFound(containerInfo);
      }
    });
  }

  /* Attach watchtower event listeners */
  addEventListeners();

  /* Activate watchtower with default configs */
  watchtower.activate();

  /* Clear old update images and create update image uploader */
  const uploadPath = options.uploadPath || DEFAULT_UPDATE_IMAGE_PATH;
  // TODO: clear old images

  const storage = multer.diskStorage({
    destination(req, file, cb) {
      fs.mkdirp(uploadPath, err => cb(err, uploadPath));
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
        cb(new Error({ code: 415, message: `Bad MIME Type:${file.mimetype}` }));
      } else {
        cb(null, true);
      }
    },
  }).any();

  /**
   * Restart watchtower with new configs
   * @param  {Number} checkUpdateInterval
   * @param  {Number} timeToWaitBeforeHealthyCheck
   * @return 200 {}       Success
   * @return 500 {String} Error message
   */
  router.post('/', (req, res) => {
    const checkUpdateInterval = req.params.checkUpdateInterval;
    const timeToWaitBeforeHealthyCheck = req.params.timeToWaitBeforeHealthyCheck;

    /* Restart watchtower */
    watchtower.inactivate().then(() => {
      watchtower.removeAllListeners();

      watchtower = new Watchtower({
        checkUpdateInterval,
        timeToWaitBeforeHealthyCheck,
      });

      addEventListeners();

      watchtower.activate().then(() => {
        res.sendStatus(200);
      }).catch((error) => {
        res.status(500).send(error.message);
      });
    });
  });

  /**
   * Set check update interval
   * @param  {Number} checkUpdateInterval Check update interval
   * @return {200} Success
   */
  router.put('/', (req, res) => {
    const interval = req.params.checkUpdateInterval;
    watchtower.setCheckUpdateInterval(interval);
    res.sendStatus(200);
  });

  /**
   * Add registry server auth info
   * @param  {String} username      Login user name
   * @param  {String} password      Login password
   * @param  {String} auth          Base64 encoded auth credentials (Optional)
   * @param  {String} email         User email (Optional)
   * @param  {String} serveraddress Registry server URL
   * @return 200 {} Success
   * @return 400 {} Bad parameters
   */
  router.post('/registry', (req, res) => {
    const { username, password, auth, email, serveraddress } = req.params;
    if (watchtower.addRegistryAuth(serveraddress, { username, password, auth, email })) {
      res.sendStatus(200);
    } else {
      res.sendStatus(400);
    }
  });

  /**
   * Apply update
   * @param  {String} repoTag Apply image with given repo:tag
   * @return 200 {Object} Updated container info object
   * @return 404 {}       Image not found
   * @return 500 {String} Error message
   */
  router.post('/update/apply', (req, res) => {
    const containerInfo = this.availableUpdates[req.params.repoTag];
    if (containerInfo) {
      if (options.willApplyUpdateFor) {
        options.willApplyUpdateFor(containerInfo, req, res);
      }
      watchtower.applyUpdate(containerInfo).then((updatedContainerInfo) => {
        if (options.didApplyUpdateFor) {
          if (!options.didApplyUpdateFor(containerInfo, req, res)) {
            res.status(200).send(updatedContainerInfo);
          }
        } else {
          res.status(200).send(updatedContainerInfo);
        }
      }).catch((error) => {
        res.status(500).send(error.message);
      });
    } else {
      res.sendStatus(404);
    }
  });

  /**
   * Upload image and load it to local docker environment
   * @param  {File} file File to upload
   * @return 200 {String} Repo tag of the image
   * @return 500 {String} Error message
   */
  router.post('/load', uploader, (req, res) => {
    watchtower.load(req.files[0].path).then((repoTags) => {
      res.status(200).send(repoTags[0]);
    }).catch((error) => {
      res.status(500).send(error.message);
    });
  });

  /**
   * Push image with given repo:tag
   * @param  {String} repoTag Image repo tag
   * @return 200 {}       Success
   * @return 500 {String} Error message
   */
  router.post('/push', (req, res) => {
    const repoTag = req.params.repoTag;
    watchtower.push(repoTag).then(() => {
      res.sendStatus(200);
    }).catch((error) => {
      res.status(500).send(error.message);
    });
  });

  /**
   * Get watchtower server version
   */
  router.get('/version', (req, res) => {
    res.status(200).send(version);
  });

  return router;
}
