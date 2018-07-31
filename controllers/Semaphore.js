'use strict';

var utils = require('../utils/writer.js');
var Semaphore = require('../service/SemaphoreService');

const error_code = {
  condition_mismatch: "The conditional request failed",
  key_not_exist: "semaphoreKey is not exist!!",
  handle_mismatch: "semaphoreHandle isn't same",
  Networking_Error: "NetworkingError"
}

const res_message = {
  Bad_Request: {
    "message": "Bad Request"
  },
  Invalid_ID_Supplied: {
    "message": "Invalid ID Supplied"
  },
  Key_In_Used: {
    "message": "lock in use"
  },
  Networking_Error: {
    "message": "Internal Server Error..."
  }
}


module.exports.acquire = function acquire(req, res, next) {
  var semaphoreKey = req.swagger.params['semaphoreKey'].value;
  var semaphoreHandle = req.swagger.params['semaphoreHandle'].value;
  Semaphore.acquire(semaphoreKey, semaphoreHandle)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      if (response.code === error_code.Networking_Error) {
        utils.writeJson(res, res_message.Networking_Error, 500);
      } else {
        utils.writeJson(res, res_message.Bad_Request, 400);
      }
    });
};

module.exports.availablePermits = function availablePermits(req, res, next) {
  var semaphoreKey = req.swagger.params['semaphoreKey'].value;
  var semaphoreHandle = req.swagger.params['semaphoreHandle'].value;
  Semaphore.availablePermits(semaphoreKey, semaphoreHandle)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      if (response.code === error_code.Networking_Error) {
        utils.writeJson(res, res_message.Networking_Error, 500);
      } else {
        utils.writeJson(res, res_message.Invalid_ID_Supplied, 400);
      }
    });
};

module.exports.creatSemaphore = function creatSemaphore(req, res, next) {
  var semaphoreKey = req.swagger.params['semaphoreKey'].value;
  var capacity = req.swagger.params['capacity'].value;
  Semaphore.creatSemaphore(semaphoreKey, capacity)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      if (response.code === error_code.Networking_Error) {
        utils.writeJson(res, res_message.Networking_Error, 500);
      } else {
        utils.writeJson(res, res_message.Key_In_Used, 409);
      }
    });
};

module.exports.deleteSemaphore = function deleteSemaphore(req, res, next) {
  var semaphoreKey = req.swagger.params['semaphoreKey'].value;
  var semaphoreHandle = req.swagger.params['semaphoreHandle'].value;
  Semaphore.deleteSemaphore(semaphoreKey, semaphoreHandle)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      if (response.code === error_code.Networking_Error) {
        utils.writeJson(res, res_message.Networking_Error, 500);
      } else {
        utils.writeJson(res, res_message.Invalid_ID_Supplied, 400);
      }
    });
};

module.exports.extendttl = function extendttl(req, res, next) {
  var semaphoreKey = req.swagger.params['semaphoreKey'].value;
  var semaphoreHandle = req.swagger.params['semaphoreHandle'].value;
  var ttl = req.swagger.params['ttl'].value;
  Semaphore.extendttl(semaphoreKey, semaphoreHandle, ttl)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      if (response.code === error_code.Networking_Error) {
        utils.writeJson(res, res_message.Networking_Error, 500);
      } else {
        utils.writeJson(res, res_message.Invalid_ID_Supplied, 400);
      }
    });
};

module.exports.releases = function releases(req, res, next) {
  var semaphoreKey = req.swagger.params['semaphoreKey'].value;
  var semaphoreHandle = req.swagger.params['semaphoreHandle'].value;
  Semaphore.releases(semaphoreKey, semaphoreHandle)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      if (response.code === error_code.Networking_Error) {
        utils.writeJson(res, res_message.Networking_Error, 500);
      } else {
        utils.writeJson(res, res_message.Bad_Request, 400);
      }
    });
};