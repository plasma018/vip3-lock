const lock_db = require('./db_mutex.js')
const uuid = require('uuid')

const DEFAULT_TTL = 60
const DEFAULT_TTL_UPPER = 3600
const DEFAULT_TTL_LOWER = 1
/**
 * Update ttl
 *
 * mutexKey String 
 * mutexHandle String Mutex id to delete
 * mutex Ttl  (optional)
 * returns Mutex
 **/
function extendMutex(mutexKey, mutexHandle, ttl) {
  if (parseInt(ttl, 10) != ttl || (ttl < DEFAULT_TTL_LOWER || ttl > DEFAULT_TTL_UPPER)) {
    throw new Error('ttl error')
  }
  return lock_db.updateItemttl(mutexKey, mutexHandle, ttl).then(({Attributes:data}) => {
    console.log(`Extend Mutex ttl:${ttl} `, JSON.stringify(data, null, 2))
    return {
      "handle": data["mutexHandle"],
      "id": data["mutexKey"],
      "expiry": data["expiry"]
    }
  })
}


/**
 * Acquires the lock
 *
 * mutexKey String Mutex ID
 * ttl Ttl  (optional)
 * returns Mutex
 **/
function lockMutex(mutexKey, ttl) {
  const mutexHandle = uuid.v4();
  let time = DEFAULT_TTL
  if (parseInt(ttl, 10) === ttl) {
    time = ttl
  }
  const expiry = Date.now() / 1000 + time;
  return lock_db.createItem(mutexKey, mutexHandle, expiry).then((data) => {
    console.log(`Lock Mutex:${mutexKey} TTL:${ttl} `, JSON.stringify(data, null, 2))
    return {
      "handle": mutexHandle,
      "id": mutexKey,
      "expiry": expiry
    }
  })
}


/**
 * Query mutex status
 *
 * mutexKey String Mutex identifier
 * returns Mutex
 **/
function queryMutex(mutexKey) {
  return lock_db.readItem(mutexKey).then(({
    Item
  }) => {
    console.log(`Query Mutex:${mutexKey} `, JSON.stringify(Item));
    return {
      "id": mutexKey,
      "expiry": Item["expiry"]
    }
  })
}


/**
 * Releases the lock
 *
 * mutexKey String Mutex ID
 * mutexHandle String Mutex id to delete
 * returns Mutex
 **/
function unlockMutex(mutexKey, mutexHandle) {
  return lock_db.deleteItem(mutexKey, mutexHandle).then(data => {
    console.log(`Delete Mutex:${mutexKey} Handler:${mutexHandle}`, JSON.stringify(data, null, 2))
  })
}

module.exports = {
  extendMutex,
  lockMutex,
  queryMutex,
  unlockMutex
}