const docClient = require('../config/config.js').docClient

const table = "lock_db_mutex";

require('./helper_ddb').ensureTable({
    tableName: table,
    hashKey: 'mutexKey',
})

exports.readItem = function (mutexKey) {
    return new Promise(function (resolve, reject) {
        docClient.get({
            TableName: table,
            Key: {
                "mutexKey": mutexKey
            },
            ConsistentRead: true
        }, function (err, data) {
            if (err) {
                console.error("Unable to read item. Error JSON:", JSON.stringify(err, null, 2));
                reject(err);
            } else {
                console.log("GetItem succeeded:", JSON.stringify(data));
                if (data["Item"] === undefined) {
                    reject(new Error("mutexKey is not exist!!"));
                    // } else if (data["Item"]["mutexHandle"] !== mutexHandle) {
                    //     reject(new Error("mutexHandle isn't same"));
                } else {
                    resolve(data["Item"]);
                }
            }
        });
    });
};


exports.createItem = function (mutexKey, mutexHandle, expiry) {
    return new Promise(function (resolve, reject) {
        docClient.put({
            TableName: table,
            Item: {
                "mutexKey": mutexKey,
                "mutexHandle": mutexHandle,
                "expiry": expiry,
                "locked": true
            },
            ConditionExpression: "attribute_not_exists(mutexKey) OR #expiry < :expiry",
            ExpressionAttributeNames: {
                "#expiry": "expiry"
            },
            ExpressionAttributeValues: {
                ":expiry": Date.now() / 1000
            }
        }, function (err, data) {
            if (err) {
                console.error("Unable to add item. Error JSON:", JSON.stringify(err, null, 2));
                reject(err);
            } else {
                console.log("Added item:", JSON.stringify(data, null, 2));
                resolve(data);
            }
        });
    })
};

exports.deleteItem = function (mutexKey, mutexHandle) {
    return new Promise(function (resolve, reject) {
        docClient.delete({
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
        }, function (err, data) {
            if (err) {
                console.error("Unable to delete item. Error JSON:", JSON.stringify(err, null, 2));
                reject(err);
            } else {
                console.log("DeleteItem succeeded:", JSON.stringify(data, null, 2));
                resolve();
            }
        });
    });
};

exports.updateItemttl = function (mutexKey, mutexHandle, ttl) {
    return new Promise(function (resolve, reject) {
        docClient.update({
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
        }, function (err, data) {
            if (err) {
                console.error("Unable to update item. Error JSON:", JSON.stringify(err, null, 2));
                reject(err);
            } else {
                console.log("UpdateItem succeeded:", JSON.stringify(data, null, 2));
                resolve(data["Attributes"])
            }
        })
    })
}

exports.updateItem = function (mutexKey, mutexHandle, locked) {
    return new Promise(function (resolve, reject) {
        docClient.update({
            TableName: table,
            Key: {
                "mutexKey": mutexKey
            },
            UpdateExpression: "set #l = :l",
            ConditionExpression: "#m = :m AND #l <> :l",
            ExpressionAttributeNames: {
                "#m": "mutexHandle",
                "#l": "locked"
            },
            ExpressionAttributeValues: {
                ":m": mutexHandle,
                ":l": locked
            },
            ReturnValues: "ALL_NEW"
        }, function (err, data) {
            if (err) {
                console.error("Unable to update item. Error JSON:", JSON.stringify(err, null, 2));
                if (!locked) {
                    reject()
                }
                reject({
                    status: "lock in use"
                })
            } else {
                console.log("UpdateItem succeeded:", JSON.stringify(data, null, 2));
                resolve(data["Attributes"])
            }
        })
    })
}