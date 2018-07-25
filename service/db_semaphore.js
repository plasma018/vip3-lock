const AWS = require("aws-sdk");

AWS.config.update({
    region: "local",
    endpoint: "http://localhost:8000"
});

const docClient = new AWS.DynamoDB.DocumentClient();
const table = "lock_db_semaphore";

function createTable() {
    const dynamodb = new AWS.DynamoDB();

    var params = {
        TableName: table,
        KeySchema: [{
                AttributeName: "semaphoreKey",
                KeyType: "HASH"
            }, //Partition key
        ],
        AttributeDefinitions: [{
            AttributeName: "semaphoreKey",
            AttributeType: "S"
        }, ],
        ProvisionedThroughput: {
            ReadCapacityUnits: 10,
            WriteCapacityUnits: 10
        }
    };

    dynamodb.createTable(params, function (err, data) {
        if (err) {
            console.error("Unable to create table. Error JSON:", JSON.stringify(err, null, 2));
        } else {
            console.log("Created table. Table description JSON:", JSON.stringify(data, null, 2));
        }
    });
}

exports.createItem = function (semaphoreKey, semaphoreHandle, capacity, expiry) {
    return new Promise(function (resolve, reject) {
        docClient.put({
            TableName: table,
            Item: {
                "semaphoreKey": semaphoreKey,
                "semaphoreHandle": semaphoreHandle,
                "capacity": capacity,
                "count": 0,
                "expiry": expiry
            },
            ConditionExpression: "attribute_not_exists(semaphoreKey) OR #expiry < :expiry",
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
    }).catch((err) => {
        console.log("err: ", err);
    });
};

exports.updateItem = function (semaphoreKey, semaphoreHandle, op) {
    return new Promise(function (resolve, reject) {
        docClient.update({
            TableName: table,
            Key: {
                "semaphoreKey": semaphoreKey
            },
            UpdateExpression: "set #c = #c + :incr",
            ConditionExpression: "((:incr > :n AND #c < #cap) OR (:incr < :n  AND #c > :n )) AND #s = :s",
            ExpressionAttributeNames: {
                "#c": "count",
                "#s": "semaphoreHandle",
                "#cap": "capacity"
            },
            ExpressionAttributeValues: {
                ":incr": op,
                ":s": semaphoreHandle,
                ":n": 0
            },
            ReturnValues: "ALL_NEW"
        }, function (err, data) {
            if (err) {
                console.error("Unable to update item. Error JSON:", JSON.stringify(err, null, 2));
                reject(err)
            } else {
                console.log("UpdateItem succeeded:", JSON.stringify(data, null, 2));
                resolve(data["Attributes"])
            }
        })
    }).catch((err) => {
        console.log("err: ", err);
    });
}

exports.readItem = function (semaphoreKey, semaphoreHandle) {
    return new Promise(function (resolve, reject) {
        docClient.get({
            TableName: table,
            Key: {
                "semaphoreKey": semaphoreKey
            }
        }, function (err, data) {
            if (err) {
                console.error("Unable to read item. Error JSON:", JSON.stringify(err, null, 2));
                reject(err);
            } else {
                console.log("GetItem succeeded:", JSON.stringify(data));
                if (data["Item"] === undefined) {
                    reject(new Error("semaphoreKey is not exist!!"));
                } else if (data["Item"]["semaphoreHandle"] !== semaphoreHandle) {
                    reject(new Error("semaphoreHandle isn't same"));
                } else {
                    resolve(data["Item"]);
                }
            }
        });
    }).catch((err) => {
        console.log("err: ", err);
    });
};

exports.deleteItem = function (semaphoreKey, semaphoreHandle) {
    return new Promise(function (resolve, reject) {
        docClient.delete({
            TableName: table,
            Key: {
                "semaphoreKey": semaphoreKey,
            },
            ConditionExpression: "#s = :s",
            ExpressionAttributeNames: {
                "#s": "semaphoreHandle"
            },
            ExpressionAttributeValues: {
                ":s": semaphoreHandle
            }
        }, function (err, data) {
            if (err) {
                console.error("Unable to delete item. Error JSON:", JSON.stringify(err, null, 2));
                reject(err)
            } else {
                console.log("DeleteItem succeeded:", JSON.stringify(data, null, 2));
                resolve()
            }
        })
    }).catch((err) => {

    })
}

exports.updateItemttl = function(semaphoreKey, semaphoreHandle, ttl){
    return new Promise(function(resolve, reject){
        docClient.update({
            TableName: table,
            Key: {
                "semaphoreKey": semaphoreKey
            },
            UpdateExpression: "set #expiry = #expiry + :ttl",
            ConditionExpression: "#s = :s",
            ExpressionAttributeNames: {
                "#expiry": "expiry",
                "#s": "semaphoreHandle"
            },
            ExpressionAttributeValues: {
                ":ttl": ttl,
                ":s": semaphoreHandle,
            },
            ReturnValues: "ALL_NEW"
        }, function (err, data) {
            if (err) {
                console.error("Unable to update item. Error JSON:", JSON.stringify(err, null, 2));
                reject(err)
            } else {
                console.log("UpdateItem succeeded:", JSON.stringify(data, null, 2));
                resolve(data["Attributes"])
            }
        })
    })
}

