'use strict';

var utils = require('../utils/writer.js');
var Mutex = require('../service/MutexService');

const error_code = {
  condition_mismatch : "The conditional request failed"
}

module.exports.extendMutex = function extendMutex(req, res, next) {
  var mutexKey = req.swagger.params['mutexKey'].value;
  var mutexHandle = req.swagger.params['mutexHandle'].value;
  var mutex = req.swagger.params['mutex'].value;
  Mutex.extendMutex(mutexKey, mutexHandle, mutex)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.lockMutex = function lockMutex(req, res, next) {
  var mutexKey = req.swagger.params['mutexKey'].value;
  var ttl = req.swagger.params['ttl'].value;
  Mutex.lockMutex(mutexKey, ttl)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      if (response.message == error_code.condition_mismatch) {
        utils.writeJson(res, {"message":"lock in use"}, 409);
      }
    });
};

module.exports.queryMutex = function queryMutex(req, res, next) {
  var mutexKey = req.swagger.params['mutexKey'].value;
  Mutex.queryMutex(mutexKey)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.unlockMutex = function unlockMutex(req, res, next) {
  var mutexKey = req.swagger.params['mutexKey'].value;
  var mutexHandle = req.swagger.params['mutexHandle'].value;
  Mutex.unlockMutex(mutexKey, mutexHandle)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};