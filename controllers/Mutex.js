const utils = require('../utils/response.js');
const Mutex = require('../service/MutexService');


function extendMutex(req, res, next) {
  const mutexKey = req.swagger.params['mutexKey'].value;
  const mutexHandle = req.swagger.params['mutexHandle'].value;
  const {ttl} = req.swagger.params['mutex'].value;
  console.log(req.swagger.params)
  Mutex.extendMutex(mutexKey, mutexHandle, ttl)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      console.error(`Unable Extend Mutex:${mutexKey} handler:${mutexHandle} ttl:${ttl} `, JSON.stringify(response, null, 2))
      if(response.code === 'ConditionalCheckFailedException'){
        response.code = 'MutextKeyNotExist'
      }
      utils.writeErrJson(res, response)
    });
};

function lockMutex(req, res, next) {
  const mutexKey = req.swagger.params['mutexKey'].value;
  const {ttl} = req.swagger.params['ttl'].value;
  Mutex.lockMutex(mutexKey, ttl)
    .then(function (response) {
      utils.writeJson(res, response)
    })
    .catch(function (response) {
      console.error(`Unable Lock Mutex: ${mutexKey} ttl: ${ttl} Error JSON:`, JSON.stringify(response, null, 2))
      utils.writeErrJson(res, response)
    });
};

function queryMutex(req, res, next) {
  const mutexKey = req.swagger.params['mutexKey'].value;
  Mutex.queryMutex(mutexKey)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      console.error(`Unable Query Mutex:${mutexKey} Error JSON:`, JSON.stringify(response, null, 2));
      if(response instanceof TypeError){
        response.code = 'MutextKeyNotExist'
      }
      utils.writeErrJson(res, response)
    });
};

function unlockMutex(req, res, next) {
  const mutexKey = req.swagger.params['mutexKey'].value;
  const mutexHandle = req.swagger.params['mutexHandle'].value;
  Mutex.unlockMutex(mutexKey, mutexHandle)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      console.error(`Unable Delete Mutex:${mutexKey} Handler:${mutexHandle} Error JSON:`, JSON.stringify(response, null, 2))
      if(response.code === 'ConditionalCheckFailedException'){
        utils.writeJson(res, null);
        return
      }
      utils.writeErrJson(res, response)
    })
}

module.exports = {
  extendMutex,
  lockMutex,
  queryMutex,
  unlockMutex
}