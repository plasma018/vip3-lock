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
    }).promise().then(data => {
        console.log("GetItem succeeded:", JSON.stringify(data));
        if (data["Item"] === undefined) {
            throw new Error("mutexKey is not exist!!");
        } else {
            return data["Item"];
        }
    }).catch(err => {
        console.error("Unable to read item. Error JSON:", JSON.stringify(err, null, 2))
        throw new Error(err)
    })
};

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
    }).promise().then(data => console.log("Added item:", JSON.stringify(data, null, 2)) || data).catch(err => {
        console.error("Unable to add item. Error JSON:", JSON.stringify(err, null, 2))
        throw new Error(err)
    })
};

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
    }).promise().then(data => console.log("DeleteItem succeeded:", JSON.stringify(data, null, 2)) || {
        statusCode: 200,
        msg: data
    }).catch(err => {
        console.error("Unable to delete item. Error JSON:", JSON.stringify(err, null, 2))
        throw new Error(err)
    })
};

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
    }).promise().then(data => console.log("UpdateItem succeeded:", JSON.stringify(data, null, 2)) || data["Attributes"]).catch(err => {
        console.error("Unable to update item. Error JSON:", JSON.stringify(err, null, 2))
        throw new Error(err)
    })
}

module.exports = {
    readItem,
    createItem,
    deleteItem,
    updateItemttl
}