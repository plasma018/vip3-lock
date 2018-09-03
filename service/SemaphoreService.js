const lock_db = require('./db_semaphore.js')
const uuid = require('uuid')

const DEFAULT_SEAT = 5
const DEFAULT_TTL = 60
const DEFAULT_TTL_UPPER = 3600
const DEFAULT_TTL_LOWER = 1

/**
 * Acquires a permit from this semaphore
 * Acquires a permit, reducing the number of available permits by one
 *
 * semaphoreKey String semaphore identifier
 * semaphoreHandle String check semaphore owner
 * returns Semaphore
 **/
function acquireSeat(semaphoreKey, ttl) {
  const semaphoreHandle = uuid.v4();
  let time = DEFAULT_TTL
  if (parseInt(ttl, 10) === ttl || (ttl < DEFAULT_TTL_LOWER || ttl > DEFAULT_TTL_UPPER)) {
    time = ttl
  }
  const expiry = Date.now() / 1000 + time;
  return lock_db.acquireSeat(semaphoreKey, semaphoreHandle, expiry).then(_ => {
    console.log(`Added item handler:${semaphoreKey} handler:${semaphoreHandle} expiry:${expiry} `);
    return {
      "id": semaphoreKey,
      "handler": semaphoreHandle,
      "expiry": expiry
    }
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
function querySemaphore(semaphoreKey) {
  return lock_db.querySemaphore(semaphoreKey).then(({
    Item
  }) => {
    console.log("GetItem succeeded:", JSON.stringify(Item));
    return {
      "id": semaphoreKey,
      "seat": Item["seat"],
      "occupied": Item["occupied"]
    }
  })
}


/**
 * Create a semaphore.
 * Creates a Semaphore with the given number of permits
 *
 * semaphoreKey String semaphore identifier
 * capacity Capacity number of permits
 * returns Semaphore
 **/
function creatSemaphore(semaphoreKey, capacity) {
  let seat = DEFAULT_SEAT
  if (capacity['seat'] === parseInt(capacity['seat'], 10)) {
    seat = capacity["seat"]
  }
  return lock_db.createSemaphore(semaphoreKey, seat).then(_ => {
    console.log(`Added item key:${semaphoreKey} seat:${seat} `);
    return {
      "id": semaphoreKey,
      "seat": seat
    }
  })
}


/**
 * delete semaphore
 * delete semaphore
 *
 * semaphoreKey String semaphore identifier
 * semaphoreHandle String check semaphore owner
 * no response value expected for this operation
 **/
function deleteSemaphore(semaphoreKey) {
  return lock_db.deleteSemaphore(semaphoreKey).then(_ => {
    console.log(`Delete item key: ${semaphoreKey}`);
    return null;
  })
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
function extendttl(semaphoreKey, semaphoreHandle, ttl) {
  if (parseInt(ttl, 10) != ttl || (ttl < DEFAULT_TTL_LOWER || ttl > DEFAULT_TTL_UPPER)) {
    let error =  new Error('ttl error')
    error.code = 'TTLError'
    return Promise.reject(error)
  }
  return lock_db.updateItemttl(semaphoreKey, semaphoreHandle, ttl).then(({
    Attributes: {
      handlers
    }
  }) => {
    console.log(`ExtendTTL Succeeded key: ${semaphoreKey} handler: ${semaphoreHandle} ttl: ${ttl} expiry: ${handlers[semaphoreHandle]}`);
    return {
      "id": semaphoreKey,
      "handler": semaphoreHandle,
      "expiry": handlers[semaphoreHandle]
    }
  })
}


/**
 * releases a permit, returning it to the semaphore.
 * releases a permit, increasing the number of available permits by one
 *
 * semaphoreKey String semaphore identifier
 * semaphoreHandle String check semaphore owner
 * returns Semaphore
 **/
function releasesSeat(semaphoreKey, semaphoreHandle) {
  return lock_db.releasesSeat(semaphoreKey, semaphoreHandle).then(_ => {
    console.log(`Delete Seat key: ${semaphoreKey} handler: ${semaphoreHandle}`);
    return null;
  })
}

module.exports = {
  acquireSeat,
  querySemaphore,
  creatSemaphore,
  deleteSemaphore,
  extendttl,
  releasesSeat
}