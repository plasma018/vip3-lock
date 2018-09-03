const {writeJson} = require('../utils/writer.js');

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
      case 'MutextKeyNotExist':
        response = {code: 404, body:{message:'MutextKey Or Handler Not Exist'}}
        break;
      case 'TTLError':
        response = {code: 400,body:{message:'TTL Format Error Or Not Exist'}}
        break;
      default:
        response = {code:400, body:{message:'Bad Request'}}
        break;
    }
    return response
}

function writeErrJson(res, status){
    const {code, body} = errorHandler(status)
    writeJson(res, body, code);
}

module.exports = {
    writeErrJson,
    writeJson
}

