const {
    docClient
} = require('../config/config.js')

const table = "lock_db_semaphore";

require('./helper_ddb').ensureTable({
    tableName: table,
    hashKey: 'semaphoreKey',
})

/**
 * Create Semaphore 
 * 
 * @param  semaphoreKey string
 * @param  seat integer
 */
function createSemaphore(semaphoreKey, seat) {
    return docClient.put({
        TableName: table,
        Item: {
            "semaphoreKey": semaphoreKey,
            "seat": seat,
            "version": 0,
            "occupied": 0,
            "handlers": {}
        },
        ConditionExpression: "attribute_not_exists(semaphoreKey)",
    }).promise()
};
/**
 * Query Semaphore status
 * @param semaphoreKey string
 */
function querySemaphore(semaphoreKey) {
    return docClient.get({
        TableName: table,
        Key: {
            "semaphoreKey": semaphoreKey
        },
        ConsistentRead: true
    }).promise()
}
/**
 * Delete Semaphore 
 * @param semaphoreKey string
 */
function deleteSemaphore(semaphoreKey) {
    return docClient.get({
        TableName: table,
        Key: {
            "semaphoreKey": semaphoreKey
        },
        ConsistentRead: true
    }).promise().then(({
        //如果不存在key會拋出TypeError，當作刪除成功
        Item: {
            handlers,
            version
        }
    }) => {
        //確認handler全部過期 or 沒有handler 表示可以刪除
        handlers['old_element'] = 0
        if (Date.now() / 1000 < Math.max(...Object.values(handlers))) {
            let error = new Error("someone in the seat");
            error.code = "ConditionalCheckFailedException"
            throw error;
        }
        // 刪除前確認有沒有人 新增handler or 延長 handler ttl
        return docClient.delete({
            TableName: table,
            Key: {
                "semaphoreKey": semaphoreKey,
            },
            ConditionExpression: "#v = :v",
            ExpressionAttributeNames: {
                "#v": "version"
            },
            ExpressionAttributeValues: {
                ":v": version
            }
        }).promise()
    })
}

/**
 * 
 * @param semaphoreKey string
 * @param semaphoreHandle string
 * @param ttl integer
 */
function updateItemttl(semaphoreKey, semaphoreHandle, ttl) {
    return docClient.update({
        TableName: table,
        Key: {
            "semaphoreKey": semaphoreKey
        },
        UpdateExpression: "set handlers.#id = handlers.#id + :ttl, #ver = #ver + :incr",
        ConditionExpression: "attribute_exists(handlers.#id)",
        ExpressionAttributeNames: {
            "#id": semaphoreHandle,
            "#ver": "version"
        },
        ExpressionAttributeValues: {
            ":ttl": ttl,
            ":incr": 1
        },
        ReturnValues: "UPDATED_NEW"
    }).promise()
}

/**
 * 
 * @param semaphoreKey string
 * @param semaphoreHandle string
 * @param expiry float 
 */
function acquireSeat(semaphoreKey, semaphoreHandle, expiry) {
    return docClient.get({
        TableName: table,
        Key: {
            "semaphoreKey": semaphoreKey
        },
        ConsistentRead: true
    }).promise().then(({
        //如果不存在key會拋出TypeError
        Item: {
            seat,
            occupied,
            handlers
        }
    }) => {
        
        if (seat != occupied) {
            return docClient.update({
                TableName: table,
                Key: {
                    "semaphoreKey": semaphoreKey
                },
                UpdateExpression: "SET #occupied = #occupied + :incr, handlers.#id = :element, #ver = #ver + :incr",
                ConditionExpression: "#seat > #occupied",
                ExpressionAttributeNames: {
                    "#occupied": "occupied",
                    "#seat": "seat",
                    "#id": semaphoreHandle,
                    "#ver": "version"
                },
                ExpressionAttributeValues: {
                    ":element": expiry,
                    ":incr": 1
                },
                ReturnValues: "ALL_NEW"
            }).promise()
        }

        // 檢查是否有handler過期
        let now = Date.now() / 1000
        let [old_id, old_time] = Object.entries(handlers).reduce((obj1, obj2) => {
            if(obj1[1] > obj2[1]){
                return obj2
            }
            return  obj1
        })
        
        if (now < old_time) {
            let error = new Error('no seat available')
            error.code = "NoSeatAvailable"
            throw error
        }

        return docClient.update({
            TableName: table,
            Key: {
                "semaphoreKey": semaphoreKey
            },
            UpdateExpression: "REMOVE handlers.#oid SET handlers.#id = :element, #ver = #ver + :incr",
            ConditionExpression: "handlers.#oid < :now",
            ExpressionAttributeNames: {
                "#id": semaphoreHandle,
                "#oid": old_id,
                "#ver": "version"
            },
            ExpressionAttributeValues: {
                ":element": expiry,
                ":incr": 1,
                ":now": now
            },
            ReturnValues: "ALL_NEW"
        }).promise()
    })
}

/**
 * 
 * @param semaphoreKey string
 * @param semaphoreHandle string
 */
function releasesSeat(semaphoreKey, semaphoreHandle) {
    return docClient.update({
        TableName: table,
        Key: {
            "semaphoreKey": semaphoreKey
        },
        UpdateExpression: "REMOVE handlers.#id SET #occupied = #occupied - :incr",
        ConditionExpression: "attribute_exists(handlers.#id)",
        ExpressionAttributeNames: {
            "#id": semaphoreHandle,
            "#occupied": "occupied"
        },
        ExpressionAttributeValues: {
            ":incr": 1
        },
        ReturnValues: "NONE"
    }).promise()
}

module.exports = {
    createSemaphore,
    querySemaphore,
    deleteSemaphore,
    acquireSeat,
    releasesSeat,
    updateItemttl
}