const utils = require('../utils/response.js');
const Semaphore = require('../service/SemaphoreService');


function acquireSeat(req, res, next) {
  const semaphoreKey = req.swagger.params['semaphoreKey'].value;
  const {
    ttl
  } = req.swagger.params['ttl'].value;
  Semaphore.acquireSeat(semaphoreKey, ttl)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      console.error("Unable to acquire seat. Error JSON:", JSON.stringify(response, null, 2));
      //如果找不到key
      if (response instanceof TypeError) {
        response.code = 'SemaphoreKeyNotExist'
      } else if (response.code === 'ConditionalCheckFailedException') {
        repsonde.code = 'NoSeatAvailable'
      }
      utils.writeErrJson(res, response)
    });
};

function querySemaphore(req, res, next) {
  const semaphoreKey = req.swagger.params['semaphoreKey'].value;
  Semaphore.querySemaphore(semaphoreKey, null)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      console.error("Unable to read semaphore. Error JSON:", JSON.stringify(response, null, 2));
      if (response instanceof TypeError) {
        response.code = 'SemaphoreKeyNotExist'
      }
      utils.writeErrJson(res, response)
    });
};

function creatSemaphore(req, res, next) {
  const semaphoreKey = req.swagger.params['semaphoreKey'].value;
  const capacity = req.swagger.params['seat'].value;
  Semaphore.creatSemaphore(semaphoreKey, capacity)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      console.error("Unable to create semaphore. Error JSON:", JSON.stringify(response, null, 2));
      utils.writeErrJson(res, response)
    });
};

function deleteSemaphore(req, res, next) {
  const semaphoreKey = req.swagger.params['semaphoreKey'].value;
  Semaphore.deleteSemaphore(semaphoreKey)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      //如果找不到key回傳200 
      if (response instanceof TypeError) {
        utils.writeJson(res, null);
        return
      }
      console.log("Unable to delete semaphore. Someone In The Seat. Error JSON:", JSON.stringify(response, null, 2))
      utils.writeErrJson(res, response)
    });
};

function extendttl(req, res, next) {
  const semaphoreKey = req.swagger.params['semaphoreKey'].value;
  const semaphoreHandle = req.swagger.params['semaphoreHandle'].value;
  const {
    ttl
  } = req.swagger.params['ttl'].value;
  Semaphore.extendttl(semaphoreKey, semaphoreHandle, ttl)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      console.error("Unable to extend ttl . Error JSON:", JSON.stringify(response, null, 2));
      if (response.code === 'ConditionalCheckFailedException') {
        response.code = 'HandlerNotExist'
      }
      utils.writeErrJson(res, response)
    });
};

function releasesSeat(req, res, next) {
  const semaphoreKey = req.swagger.params['semaphoreKey'].value;
  const semaphoreHandle = req.swagger.params['semaphoreHandle'].value;
  Semaphore.releasesSeat(semaphoreKey, semaphoreHandle)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      console.error(`Unable to delete seat key:${semaphoreKey} handler:${semaphoreHandle}. Error JSON:`, JSON.stringify(response, null, 2));
      if (response.code === 'NetworkingError') {
        utils.writeErrJson(res, response)
        return
      }
      utils.writeJson(res, null)
    });
};

module.exports = {
  acquireSeat,
  querySemaphore,
  creatSemaphore,
  deleteSemaphore,
  extendttl,
  releasesSeat
}