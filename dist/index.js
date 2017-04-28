(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("express"), require("babel-polyfill"), require("body-parser"), require("debug"), require("fs-extra"), require("http"), require("multer"), require("node-fetch"), require("node-watchtower"), require("os"));
	else if(typeof define === 'function' && define.amd)
		define(["express", "babel-polyfill", "body-parser", "debug", "fs-extra", "http", "multer", "node-fetch", "node-watchtower", "os"], factory);
	else {
		var a = typeof exports === 'object' ? factory(require("express"), require("babel-polyfill"), require("body-parser"), require("debug"), require("fs-extra"), require("http"), require("multer"), require("node-fetch"), require("node-watchtower"), require("os")) : factory(root["express"], root["babel-polyfill"], root["body-parser"], root["debug"], root["fs-extra"], root["http"], root["multer"], root["node-fetch"], root["node-watchtower"], root["os"]);
		for(var i in a) (typeof exports === 'object' ? exports : root)[i] = a[i];
	}
})(this, function(__WEBPACK_EXTERNAL_MODULE_0__, __WEBPACK_EXTERNAL_MODULE_4__, __WEBPACK_EXTERNAL_MODULE_5__, __WEBPACK_EXTERNAL_MODULE_6__, __WEBPACK_EXTERNAL_MODULE_7__, __WEBPACK_EXTERNAL_MODULE_8__, __WEBPACK_EXTERNAL_MODULE_9__, __WEBPACK_EXTERNAL_MODULE_10__, __WEBPACK_EXTERNAL_MODULE_11__, __WEBPACK_EXTERNAL_MODULE_12__) {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 13);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports) {

module.exports = require("express");

/***/ }),
/* 1 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_babel_polyfill__ = __webpack_require__(4);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_babel_polyfill___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_babel_polyfill__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_http__ = __webpack_require__(8);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_http___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1_http__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_express__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_express___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_2_express__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3_node_watchtower__ = __webpack_require__(11);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3_node_watchtower___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_3_node_watchtower__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__router__ = __webpack_require__(3);
/* eslint-disable no-unused-vars */






const PORT = 5050;
const DEFAULT_UPDATE_INTERVAL = 180;
const DEFAULT_TIME_TO_WAIT_BEFORE_HEALTHY_CHECK = 10;

const app = __WEBPACK_IMPORTED_MODULE_2_express___default()();
const server = __WEBPACK_IMPORTED_MODULE_1_http___default.a.createServer(app);

const watchtower = new __WEBPACK_IMPORTED_MODULE_3_node_watchtower___default.a({
  checkUpdateInterval: DEFAULT_UPDATE_INTERVAL,
  timeToWaitBeforeHealthyCheck: DEFAULT_TIME_TO_WAIT_BEFORE_HEALTHY_CHECK,
  pruneImages: true,
  retireOldWatchtower: true,
});

app.use(__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_4__router__["a" /* default */])(watchtower, {
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


/***/ }),
/* 2 */
/***/ (function(module, exports) {

module.exports = {
	"name": "watchtower",
	"version": "0.9.8",
	"description": "A docker container update server.",
	"main": "dist/index.js",
	"dependencies": {
		"autobind-decorator": "^1.3.4",
		"babel-polyfill": "^6.23.0",
		"body-parser": "^1.17.1",
		"debug": "^2.6.3",
		"express": "^4.15.2",
		"fs-extra": "^2.1.2",
		"multer": "^1.3.0",
		"node-fetch": "^1.6.3",
		"node-watchtower": "^0.9.8"
	},
	"devDependencies": {
		"babel-core": "^6.24.1",
		"babel-eslint": "^7.2.3",
		"babel-loader": "^7.0.0",
		"babel-plugin-transform-async-to-generator": "^6.24.1",
		"babel-plugin-transform-decorators-legacy": "^1.3.4",
		"babel-plugin-transform-export-extensions": "^6.22.0",
		"babel-preset-es2015": "^6.24.1",
		"debug": "^2.6.3",
		"dockerode": "^2.4.3",
		"eslint": "^3.15.0",
		"eslint-config-airbnb-base": "^11.1.0",
		"eslint-plugin-import": "^2.2.0",
		"form-data": "^2.1.4",
		"json-loader": "^0.5.4",
		"mocha": "^3.2.0",
		"node-fetch": "^1.6.3",
		"webpack": "^2.4.1",
		"webpack-node-externals": "^1.5.4"
	},
	"keywords": [
		"docker",
		"watchtower",
		"updater",
		"container",
		"registry",
		"express"
	],
	"author": "Chen Shou Yuan",
	"license": "MIT",
	"repository": {
		"type": "git",
		"url": "https://github.com/csy1983/watchtower.git"
	},
	"scripts": {
		"test": "./node_modules/.bin/mocha -b --require babel-core/register --require babel-polyfill"
	}
};

/***/ }),
/* 3 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_body_parser__ = __webpack_require__(5);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_body_parser___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_body_parser__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_debug__ = __webpack_require__(6);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_debug___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1_debug__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_express__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_express___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_2_express__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3_node_fetch__ = __webpack_require__(10);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3_node_fetch___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_3_node_fetch__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4_fs_extra__ = __webpack_require__(7);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4_fs_extra___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_4_fs_extra__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5_multer__ = __webpack_require__(9);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5_multer___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_5_multer__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6_os__ = __webpack_require__(12);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6_os___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_6_os__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_7__package_json__ = __webpack_require__(2);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_7__package_json___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_7__package_json__);









const IMAGE_UPLOAD_PATH = `${__WEBPACK_IMPORTED_MODULE_6_os___default.a.homedir()}/.watchtower/images`;
const WEBHOOK_PERSIST_PATH = `${__WEBPACK_IMPORTED_MODULE_6_os___default.a.homedir()}/.watchtower/webhook`;
const WEBHOOK_PERSIST_FILE = 'db.json';
const DEBUG = __WEBPACK_IMPORTED_MODULE_1_debug___default()('docker-watchtower:api');

/**
 * Create watchtower express router.
 */
/* harmony default export */ __webpack_exports__["a"] = (function (watchtower, options) {
  const router = __WEBPACK_IMPORTED_MODULE_2_express___default.a.Router();
  const webhookPersistFile = `${WEBHOOK_PERSIST_PATH}/${WEBHOOK_PERSIST_FILE}`;
  let webhookPersist = {
    updateFound: [],
    updateNotFound: [],
  };

  /* Create webhook persistence path */
  __WEBPACK_IMPORTED_MODULE_4_fs_extra___default.a.ensureDirSync(WEBHOOK_PERSIST_PATH);

  /* Check existence for webhook config file */
  __WEBPACK_IMPORTED_MODULE_4_fs_extra___default.a.access(webhookPersistFile, __WEBPACK_IMPORTED_MODULE_4_fs_extra___default.a.constants.R_OK | __WEBPACK_IMPORTED_MODULE_4_fs_extra___default.a.constants.W_OK, (error) => {
    if (error) {
      /* Create default webhook config file */
      __WEBPACK_IMPORTED_MODULE_4_fs_extra___default.a.writeJson(webhookPersistFile, webhookPersist, (writeError) => {
        if (writeError) {
          throw new Error(`Unable to create webhook config file. ${writeError.message}`);
        }
      });
    } else {
      __WEBPACK_IMPORTED_MODULE_4_fs_extra___default.a.readJson(webhookPersistFile, (readError, data) => {
        if (readError) {
          throw new Error(`Unable to read webhook config file. ${readError.message}`);
        }
        webhookPersist = data;
      });
    }
  });

  const storage = __WEBPACK_IMPORTED_MODULE_5_multer___default.a.diskStorage({
    destination(req, file, cb) {
      /* Create a clean image folder */
      __WEBPACK_IMPORTED_MODULE_4_fs_extra___default.a.removeSync(IMAGE_UPLOAD_PATH);
      __WEBPACK_IMPORTED_MODULE_4_fs_extra___default.a.mkdirp(IMAGE_UPLOAD_PATH, err => cb(err, IMAGE_UPLOAD_PATH));
    },
    filename(req, file, cb) {
      cb(null, `${file.fieldname}-${Date.now()}`);
    },
  });

  const uploader = __WEBPACK_IMPORTED_MODULE_5_multer___default()({
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
    webhookPersist.updateFound.forEach((url) => {
      __WEBPACK_IMPORTED_MODULE_3_node_fetch___default()(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `image=${image}`,
      }).then((res) => {
        DEBUG(`POSTed 'updateFound' event with image ${image} to ${url}. ${res.json()}`);
        if (res.status === 100) {
          /* Apply update immediately */
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
        DEBUG(`Failed to POST 'updateFound' event with image ${image} to ${url}. ${error}`);
      });
    });
  });

  watchtower.on('updateNotFound', (image) => {
    webhookPersist.updateNotFound.forEach((url) => {
      __WEBPACK_IMPORTED_MODULE_3_node_fetch___default()(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `image=${image}`,
      }).then((res) => {
        DEBUG(`POSTed 'updateNotFound' event with image ${image} to ${url}. ${res.json()}`);
      })
      .catch((error) => {
        DEBUG(`Failed to POST 'updateNotFound' event with image ${image} to ${url}. ${error}`);
      });
    });
  });

  /* Activate watchtower with default configs */
  watchtower.activate();

  /* Parse application/x-www-form-urlencoded */
  router.use(__WEBPACK_IMPORTED_MODULE_0_body_parser___default.a.urlencoded({ extended: false }));

  /**
   * Get watchtower server version
   */
  router.get('/version', (req, res) => {
    res.status(200).send(__WEBPACK_IMPORTED_MODULE_7__package_json__["version"]);
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
      __WEBPACK_IMPORTED_MODULE_4_fs_extra___default.a.writeJson(webhookPersistFile, webhookPersist, (writeError) => {
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
      __WEBPACK_IMPORTED_MODULE_4_fs_extra___default.a.writeJson(webhookPersistFile, webhookPersist, (writeError) => {
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

      watchtower.applyUpdate(containerInfo).then((updatedContainerInfo) => {
        if (watchtower.isWatchtower(containerInfo)) {
          if (options.didApplyUpdateForWatchtower) {
            options.didApplyUpdateForWatchtower(containerInfo);
          }
        } else {
          res.status(200).send(updatedContainerInfo);
        }
      }).catch((error) => {
        if (watchtower.isWatchtower(containerInfo)) {
          if (options.didFailedToApplyUpdateForWatchtower) {
            options.didFailedToApplyUpdateForWatchtower(error, containerInfo);
          }
        }
        res.status(500).send(error.message);
      });
    } else {
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
    uploader(req, res, (uploadError) => {
      if (uploadError) {
        res.status(uploadError.code).send(uploadError.message);
        return;
      }

      watchtower.upload(req.files[0].path, { tagToLatest: !!req.query.latest }).then((repoTag) => {
        /* Image file has been loaded, remove it */
        __WEBPACK_IMPORTED_MODULE_4_fs_extra___default.a.remove(req.files[0].path);
        res.status(200).send(repoTag);
      }).catch((error) => {
        res.status(500).send(error.message);
      });
    });
  });

  return router;
});


/***/ }),
/* 4 */
/***/ (function(module, exports) {

module.exports = require("babel-polyfill");

/***/ }),
/* 5 */
/***/ (function(module, exports) {

module.exports = require("body-parser");

/***/ }),
/* 6 */
/***/ (function(module, exports) {

module.exports = require("debug");

/***/ }),
/* 7 */
/***/ (function(module, exports) {

module.exports = require("fs-extra");

/***/ }),
/* 8 */
/***/ (function(module, exports) {

module.exports = require("http");

/***/ }),
/* 9 */
/***/ (function(module, exports) {

module.exports = require("multer");

/***/ }),
/* 10 */
/***/ (function(module, exports) {

module.exports = require("node-fetch");

/***/ }),
/* 11 */
/***/ (function(module, exports) {

module.exports = require("node-watchtower");

/***/ }),
/* 12 */
/***/ (function(module, exports) {

module.exports = require("os");

/***/ }),
/* 13 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(1);


/***/ })
/******/ ]);
});