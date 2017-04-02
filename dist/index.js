(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("express"), require("babel-polyfill"), require("fs-extra"), require("http"), require("multer"), require("node-watchtower"), require("os"));
	else if(typeof define === 'function' && define.amd)
		define(["express", "babel-polyfill", "fs-extra", "http", "multer", "node-watchtower", "os"], factory);
	else {
		var a = typeof exports === 'object' ? factory(require("express"), require("babel-polyfill"), require("fs-extra"), require("http"), require("multer"), require("node-watchtower"), require("os")) : factory(root["express"], root["babel-polyfill"], root["fs-extra"], root["http"], root["multer"], root["node-watchtower"], root["os"]);
		for(var i in a) (typeof exports === 'object' ? exports : root)[i] = a[i];
	}
})(this, function(__WEBPACK_EXTERNAL_MODULE_0__, __WEBPACK_EXTERNAL_MODULE_2__, __WEBPACK_EXTERNAL_MODULE_5__, __WEBPACK_EXTERNAL_MODULE_6__, __WEBPACK_EXTERNAL_MODULE_7__, __WEBPACK_EXTERNAL_MODULE_8__, __WEBPACK_EXTERNAL_MODULE_9__) {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
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
/******/ 	return __webpack_require__(__webpack_require__.s = 10);
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
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_http__ = __webpack_require__(6);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_http___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_http__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_express__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_express___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1_express__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__router__ = __webpack_require__(4);
/* eslint-disable no-unused-vars */




const PORT = 5888;
const app = __WEBPACK_IMPORTED_MODULE_1_express___default()();
const server = __WEBPACK_IMPORTED_MODULE_0_http___default.a.createServer(app);

app.use(__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__router__["a" /* default */])({
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


/***/ }),
/* 2 */
/***/ (function(module, exports) {

module.exports = require("babel-polyfill");

/***/ }),
/* 3 */
/***/ (function(module, exports) {

module.exports = {
	"name": "docker-watchtower",
	"version": "0.9.2",
	"description": "A docker image update server.",
	"main": "dist/index.js",
	"dependencies": {
		"autobind-decorator": "^1.3.4",
		"debug": "^2.6.3",
		"express": "^4.15.2",
		"fs-extra": "^2.1.2",
		"multer": "^1.3.0",
		"node-watchtower": "^0.9.2"
	},
	"devDependencies": {
		"babel-core": "^6.23.1",
		"babel-eslint": "^7.1.1",
		"babel-loader": "^6.3.1",
		"babel-plugin-transform-async-to-generator": "^6.22.0",
		"babel-plugin-transform-decorators-legacy": "^1.3.4",
		"babel-plugin-transform-export-extensions": "^6.22.0",
		"babel-polyfill": "^6.23.0",
		"babel-preset-es2015": "^6.22.0",
		"debug": "^2.6.3",
		"eslint": "^3.15.0",
		"eslint-config-airbnb-base": "^11.1.0",
		"eslint-plugin-import": "^2.2.0",
		"json-loader": "^0.5.4",
		"mocha": "^3.2.0",
		"webpack": "^2.2.1",
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
		"url": "https://github.com/csy1983/docker-watchtower.git"
	},
	"scripts": {
		"test": "./node_modules/.bin/mocha -b --require babel-core/register --require babel-polyfill"
	}
};

/***/ }),
/* 4 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_express__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_express___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_express__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_fs_extra__ = __webpack_require__(5);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_fs_extra___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1_fs_extra__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_multer__ = __webpack_require__(7);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_multer___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_2_multer__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3_os__ = __webpack_require__(9);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3_os___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_3_os__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4_node_watchtower__ = __webpack_require__(8);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4_node_watchtower___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_4_node_watchtower__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__package_json__ = __webpack_require__(3);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__package_json___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_5__package_json__);







const DEFAULT_UPDATE_INTERVAL = 3;
const DEFAULT_TIME_TO_WAIT_BEFORE_HEALTHY_CHECK = 10;
const DEFAULT_UPDATE_IMAGE_PATH = `${__WEBPACK_IMPORTED_MODULE_3_os___default.a.homedir()}/.watchtower/images`;

/**
 * Create watchtower express router.
 */
/* harmony default export */ __webpack_exports__["a"] = (function (options) {
  const router = __WEBPACK_IMPORTED_MODULE_0_express___default.a.Router();
  const availableUpdates = {};

  let watchtower = new __WEBPACK_IMPORTED_MODULE_4_node_watchtower___default.a({
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

  const storage = __WEBPACK_IMPORTED_MODULE_2_multer___default.a.diskStorage({
    destination(req, file, cb) {
      __WEBPACK_IMPORTED_MODULE_1_fs_extra___default.a.mkdirp(uploadPath, err => cb(err, uploadPath));
    },
    filename(req, file, cb) {
      cb(null, `${file.fieldname}-${Date.now()}`);
    },
  });

  const uploader = __WEBPACK_IMPORTED_MODULE_2_multer___default()({
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

      watchtower = new __WEBPACK_IMPORTED_MODULE_4_node_watchtower___default.a({
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
   * Ping watchtower server
   */
  router.get('/version', (req, res) => {
    res.status(200).send(__WEBPACK_IMPORTED_MODULE_5__package_json__["version"]);
  });

  return router;
});


/***/ }),
/* 5 */
/***/ (function(module, exports) {

module.exports = require("fs-extra");

/***/ }),
/* 6 */
/***/ (function(module, exports) {

module.exports = require("http");

/***/ }),
/* 7 */
/***/ (function(module, exports) {

module.exports = require("multer");

/***/ }),
/* 8 */
/***/ (function(module, exports) {

module.exports = require("node-watchtower");

/***/ }),
/* 9 */
/***/ (function(module, exports) {

module.exports = require("os");

/***/ }),
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(2);
module.exports = __webpack_require__(1);


/***/ })
/******/ ]);
});