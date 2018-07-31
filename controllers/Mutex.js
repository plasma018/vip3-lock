'use strict';

var utils = require('../utils/writer.js');
var Mutex = require('../service/MutexService');

const error_code = {
  condition_mismatch: "The conditional request failed",
  key_not_exist: "mutexKey is not exist!!",
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

module.exports.extendMutex = function extendMutex(req, res, next) {
  var mutexKey = req.swagger.params['mutexKey'].value;
  var mutexHandle = req.swagger.params['mutexHandle'].value;
  var mutex = req.swagger.params['mutex'].value;
  Mutex.extendMutex(mutexKey, mutexHandle, mutex)
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

module.exports.lockMutex = function lockMutex(req, res, next) {
  var mutexKey = req.swagger.params['mutexKey'].value;
  var ttl = req.swagger.params['ttl'].value;
  Mutex.lockMutex(mutexKey, ttl)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      if (response.message == error_code.condition_mismatch) {
        utils.writeJson(res, res_message.Key_In_Used, 409);
      } else if (response.code === error_code.Networking_Error) {
        utils.writeJson(res, res_message.Networking_Error, 500);
      } else {
        utils.writeJson(res, res_message.Bad_Request, 400);
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
      if (response.code === error_code.Networking_Error) {
        utils.writeJson(res, res_message.Networking_Error, 500);
      } else {
        utils.writeJson(res, res_message.Invalid_ID_Supplied, 400);
      }
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
      if (response.code === error_code.Networking_Error) {
        utils.writeJson(res, res_message.Networking_Error, 500);
      } else {
        utils.writeJson(res, res_message.Invalid_ID_Supplied, 400);
      }
    });
};