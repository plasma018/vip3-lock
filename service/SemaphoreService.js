'use strict';
const lock_db = require('./db_semaphore.js')
const uuid = require('uuid')


/**
 * Acquires a permit from this semaphore
 * Acquires a permit, reducing the number of available permits by one
 *
 * semaphoreKey String semaphore identifier
 * semaphoreHandle String check semaphore owner
 * returns Semaphore
 **/
module.exports.acquire = function (semaphoreKey, semaphoreHandle) {
  return lock_db.updateItem(semaphoreKey, semaphoreHandle, 1).then((data) => {
    var examples = {};
    examples['application/json'] = {
      "count": data["count"],
      "handle": data["semaphoreHandle"],
      "id": data["semaphoreKey"],
      "expiry": data["expiry"],
      "capacity": data["capacity"]
    };
    return examples[Object.keys(examples)[0]];
  })
}


/**
 * Query semaphore status
 * Returns the current status in this semaphore.
 *
 * semaphoreKey String semaphore identifier
 * semaphoreHandle String check semaphore owner
 * returns Semaphore
 **/
module.exports.availablePermits = function (semaphoreKey, semaphoreHandle) {
  return lock_db.readItem(semaphoreKey, semaphoreHandle).then((data) => {
    var examples = {};
    examples['application/json'] = {
      "count": data["count"],
      "handle": data["semaphoreHandle"],
      "id": data["semaphoreKey"],
      "expiry": data["expiry"],
      "capacity": data["capacity"]
    };
    return examples[Object.keys(examples)[0]];
  });
}


/**
 * Create a semaphore.
 * Creates a Semaphore with the given number of permits
 *
 * semaphoreKey String semaphore identifier
 * capacity Capacity number of permits
 * returns Semaphore
 **/
module.exports.creatSemaphore = function (semaphoreKey, capacity) {
  const semaphoreHandle = uuid.v4();
  const expiry = Date.now() / 1000 + 60;
  capacity = capacity["capacity"] || 5;
  return lock_db.createItem(semaphoreKey, semaphoreHandle, capacity, expiry).then((data) => {
    var examples = {};
    examples['application/json'] = {
      "count": 0,
      "handle": semaphoreHandle,
      "id": semaphoreKey,
      "expiry": expiry,
      "capacity": capacity
    };
    return examples[Object.keys(examples)[0]];
  });
}


/**
 * delete semaphore
 * delete semaphore
 *
 * semaphoreKey String semaphore identifier
 * semaphoreHandle String check semaphore owner
 * no response value expected for this operation
 **/
module.exports.deleteSemaphore = function (semaphoreKey, semaphoreHandle) {
  return lock_db.deleteItem(semaphoreKey, semaphoreHandle).then(() => {
    return;
  });
}


/**
 * update ttl
 * update ttl
 *
 * semaphoreKey String semaphore identifier
 * semaphoreHandle String check semaphore owner
 * ttl Ttl update ttl
 * returns Semaphore
 **/
module.exports.extendttl = function (semaphoreKey, semaphoreHandle, ttl) {
  return lock_db.updateItemttl(semaphoreKey, semaphoreHandle, ttl["ttl"]).then((data) => {
    var examples = {};
    examples['application/json'] = {
      "count": data["count"],
      "handle": data["semaphoreHandle"],
      "id": data["semaphoreKey"],
      "expiry": data["expiry"],
      "capacity": data["capacity"]
    };
    return examples[Object.keys(examples)[0]];
  });
};


/**
 * releases a permit, returning it to the semaphore.
 * releases a permit, increasing the number of available permits by one
 *
 * semaphoreKey String semaphore identifier
 * semaphoreHandle String check semaphore owner
 * returns Semaphore
 **/
module.exports.releases = function (semaphoreKey, semaphoreHandle) {
  return lock_db.updateItem(semaphoreKey, semaphoreHandle, -1).then((data) => {
    var examples = {};
    examples['application/json'] = {
      "count": data["count"],
      "handle": data["semaphoreHandle"],
      "id": data["semaphoreKey:"],
      "expiry": data["expiry"],
      "capacity": data["capacity"]
    };
    return examples[Object.keys(examples)[0]];
  })
}