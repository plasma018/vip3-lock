'use strict';
const lock_db = require('./db_mutex.js')
const uuid = require('uuid')

/**
 * Update ttl
 *
 * mutexKey String 
 * mutexHandle String Mutex id to delete
 * mutex Ttl  (optional)
 * returns Mutex
 **/
exports.extendMutex = function (mutexKey, mutexHandle, mutex) {
  return lock_db.updateItemttl(mutexKey, mutexHandle, mutex["ttl"]).then((data) => {
    var examples = {};
    examples['application/json'] = {
      "handle": data["mutexHandle"],
      "id": data["mutexKey"],
      "expiry": data["expiry"],
      "locked": data["locked"]
    };
    return examples[Object.keys(examples)[0]];
  });
}


/**
 * Acquires the lock
 *
 * mutexKey String Mutex ID
 * ttl Ttl  (optional)
 * returns Mutex
 **/
exports.lockMutex = function (mutexKey, ttl) {
  const mutexHandle = uuid.v4();
  const expiry = Date.now() / 1000 + (ttl["ttl"] || 60);
  return lock_db.createItem(mutexKey, mutexHandle, expiry).then((data) => {
    var examples = {};
    examples['application/json'] = {
      "handle": mutexHandle,
      "id": mutexKey,
      "expiry": expiry,
      "locked": true
    };
    return examples[Object.keys(examples)[0]];
  })
}


/**
 * Query mutex status
 *
 * mutexKey String Mutex identifier
 * returns Mutex
 **/
exports.queryMutex = function (mutexKey) {
  return lock_db.readItem(mutexKey).then((data) => {
    var examples = {};
    examples['application/json'] = {
      "id": mutexKey,
      "expiry": data["expiry"],
      "locked": data["locked"]
    };
    return examples[Object.keys(examples)[0]];
  })
}


/**
 * Releases the lock
 *
 * mutexKey String Mutex ID
 * mutexHandle String Mutex id to delete
 * returns Mutex
 **/
exports.unlockMutex = function (mutexKey, mutexHandle) {
  return lock_db.deleteItem(mutexKey, mutexHandle)
}