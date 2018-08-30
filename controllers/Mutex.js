const utils = require('../utils/writer.js');
const Mutex = require('../service/MutexService');

function errorHandler({code}){
  let response;
  switch(code){
    case "ConditionalCheckFailedException":
      response = {code:409, body:{message:'Lock In Use'}}
      break;
    case "NetworkingError":
      response = {code:500, body:{message:'Internal Server Error'}}
      break;
    case 'SemaphoreKeyNotExist':
      response = {code: 404, body:{message:'Key Not Exist'}}
      break;
    case 'NoSeatAvailable':
      response = {code: 409, body:{message:'No Seat Available'}}
      break
    case 'MutextKeyNotExist':
      response = {code: 404, body:{message:'MutextKey Or Handler Not Exist'}}
      break;
    default:
      response = {code:400, body:{message:'Bad Request'}}
      break;
  }
  return response
}

function extendMutex(req, res, next) {
  const mutexKey = req.swagger.params['mutexKey'].value;
  const mutexHandle = req.swagger.params['mutexHandle'].value;
  const {ttl} = req.swagger.params['mutex'].value;
  Mutex.extendMutex(mutexKey, mutexHandle, ttl)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      console.error(`Unable Extend Mutex:${mutexKey} handler:${mutexHandle} ttl:${ttl} `, JSON.stringify(response, null, 2))
      if(response.code === 'ConditionalCheckFailedException'){
        response.code = 'MutextKeyNotExist'
      }
      const {code, body} = errorHandler(response)
      utils.writeJson(res, body, code);
    });
};

function lockMutex(req, res, next) {
  const mutexKey = req.swagger.params['mutexKey'].value;
  const {ttl} = req.swagger.params['ttl'].value;
  Mutex.lockMutex(mutexKey, ttl)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      console.error(`Unable Lock Mutex: ${mutexKey} ttl: ${ttl} Error JSON:`, JSON.stringify(response, null, 2))
      const {code, body} = errorHandler(response)
      utils.writeJson(res, body, code);
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
      const {code, body} = errorHandler(response)
      utils.writeJson(res, body, code);
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
      const {code, body} = errorHandler(response)
      utils.writeJson(res, body, code);
    })
}

module.exports = {
  extendMutex,
  lockMutex,
  queryMutex,
  unlockMutex
}