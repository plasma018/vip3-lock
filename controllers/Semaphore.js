'use strict';

const utils = require('../utils/writer.js');
const Semaphore = require('../service/SemaphoreService');

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
    case 'HandlerNotExist':
      response = {code: 404, body:{message:'Handler Not Exist'}}
      break;
    default:
      response = {code:400, body:{message:'Bad Request'}}
      break;
  }
  return response
}


function acquireSeat(req, res, next) {
  const semaphoreKey = req.swagger.params['semaphoreKey'].value;
  const {ttl} = req.swagger.params['ttl'].value;
  Semaphore.acquireSeat(semaphoreKey, ttl)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      console.error("Unable to acquire seat. Error JSON:", JSON.stringify(response, null, 2));
       //如果找不到key
      console.log(response)
      if(response instanceof TypeError){
        response.code = 'SemaphoreKeyNotExist'
      }else if(response.code === 'ConditionalCheckFailedException'){
        repsonde.code = 'NoSeatAvailable'
      }
      const {code, body} = errorHandler(response)
      utils.writeJson(res, body, code)
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
      const {code, body} = errorHandler({code:'SemaphoreKeyNotExist'})
      utils.writeJson(res, body, code);
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
      const {code, body} = errorHandler(response)
      utils.writeJson(res, body, code);
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
      if(response instanceof TypeError){
        utils.writeJson(res, null);
        return
      }
      console.log("Unable to delete semaphore. Someone In The Seat. Error JSON:", JSON.stringify(response, null, 2))
      const {code, body} = errorHandler(response)
      utils.writeJson(res, body, code);
    });
};

function extendttl(req, res, next) {
  const semaphoreKey = req.swagger.params['semaphoreKey'].value;
  const semaphoreHandle = req.swagger.params['semaphoreHandle'].value;
  const {ttl} = req.swagger.params['ttl'].value;
  Semaphore.extendttl(semaphoreKey, semaphoreHandle, ttl)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      console.error("Unable to extend ttl . Error JSON:", JSON.stringify(response, null, 2));
      if(response.code === 'ConditionalCheckFailedException'){
        response.code = 'HandlerNotExist'
      }
      const {code, body} = errorHandler(response)
      utils.writeJson(res, body, code);
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
      if(response.code === 'NetworkingError'){
        const {code, body} = errorHandler(response)
        utils.writeJson(res, body, code);
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