const {
    docClient
} = require('../config/config.js')

const table = "lock_db_mutex";

require('./helper_ddb').ensureTable({
    tableName: table,
    hashKey: 'mutexKey',
})

function readItem(mutexKey) {
    return docClient.get({
        TableName: table,
        Key: {
            "mutexKey": mutexKey
        },
        ConsistentRead: true
    }).promise()
}

function createItem(mutexKey, mutexHandle, expiry) {
    return docClient.put({
        TableName: table,
        Item: {
            "mutexKey": mutexKey,
            "mutexHandle": mutexHandle,
            "expiry": expiry
        },
        ConditionExpression: "attribute_not_exists(mutexKey) OR #expiry < :expiry",
        ExpressionAttributeNames: {
            "#expiry": "expiry"
        },
        ExpressionAttributeValues: {
            ":expiry": Date.now() / 1000
        }
    }).promise()
}

function deleteItem(mutexKey, mutexHandle) {
    return docClient.delete({
        TableName: table,
        Key: {
            "mutexKey": mutexKey,
        },
        ConditionExpression: "#m = :m",
        ExpressionAttributeNames: {
            "#m": "mutexHandle"
        },
        ExpressionAttributeValues: {
            ":m": mutexHandle
        }
    }).promise()
}

function updateItemttl(mutexKey, mutexHandle, ttl) {
    return docClient.update({
        TableName: table,
        Key: {
            "mutexKey": mutexKey
        },
        UpdateExpression: "set #expiry = #expiry + :ttl",
        ConditionExpression: "#m = :m",
        ExpressionAttributeNames: {
            "#expiry": "expiry",
            "#m": "mutexHandle"
        },
        ExpressionAttributeValues: {
            ":ttl": ttl,
            ":m": mutexHandle
        },
        ReturnValues: "ALL_NEW"
    }).promise()
}

module.exports = {
    readItem,
    createItem,
    deleteItem,
    updateItemttl
}