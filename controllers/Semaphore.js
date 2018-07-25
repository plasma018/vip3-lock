'use strict';

var utils = require('../utils/writer.js');
var Semaphore = require('../service/SemaphoreService');

module.exports.acquire = function acquire (req, res, next) {
  var semaphoreKey = req.swagger.params['semaphoreKey'].value;
  var semaphoreHandle = req.swagger.params['semaphoreHandle'].value;
  Semaphore.acquire(semaphoreKey,semaphoreHandle)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.availablePermits = function availablePermits (req, res, next) {
  var semaphoreKey = req.swagger.params['semaphoreKey'].value;
  var semaphoreHandle = req.swagger.params['semaphoreHandle'].value;
  Semaphore.availablePermits(semaphoreKey,semaphoreHandle)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.creatSemaphore = function creatSemaphore (req, res, next) {
  var semaphoreKey = req.swagger.params['semaphoreKey'].value;
  var capacity = req.swagger.params['capacity'].value;
  Semaphore.creatSemaphore(semaphoreKey,capacity)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.deleteSemaphore = function deleteSemaphore (req, res, next) {
  var semaphoreKey = req.swagger.params['semaphoreKey'].value;
  var semaphoreHandle = req.swagger.params['semaphoreHandle'].value;
  Semaphore.deleteSemaphore(semaphoreKey,semaphoreHandle)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.extendttl = function extendttl (req, res, next) {
  var semaphoreKey = req.swagger.params['semaphoreKey'].value;
  var semaphoreHandle = req.swagger.params['semaphoreHandle'].value;
  var ttl = req.swagger.params['ttl'].value;
  Semaphore.extendttl(semaphoreKey,semaphoreHandle,ttl)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.releases = function releases (req, res, next) {
  var semaphoreKey = req.swagger.params['semaphoreKey'].value;
  var semaphoreHandle = req.swagger.params['semaphoreHandle'].value;
  Semaphore.releases(semaphoreKey,semaphoreHandle)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};
