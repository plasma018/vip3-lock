const {
    dynamodb
} = require('../config/config.js')

function createTable(payload) {
    let options = Object.assign({
        rcu: 10,
        wcu: 10
    }, payload)

    let params = {
        TableName: payload.tableName,
        KeySchema: [{
                AttributeName: payload.hashKey,
                KeyType: 'HASH'
            }, //Partition key
        ],
        AttributeDefinitions: [{
            AttributeName: options.hashKey,
            AttributeType: 'S'
        }, ],
        ProvisionedThroughput: {
            ReadCapacityUnits: options.rcu,
            WriteCapacityUnits: options.wcu
        }
    }

    return dynamodb.createTable(params)
        .promise()
}

function isDbCreated(payload) {
    return dynamodb.describeTable({
            TableName: payload.tableName
        })
        .promise()
        .then(() => true)
        .catch(err => {
            if (err.code === 'ResourceNotFoundException') {
                return false
            }

            throw err
        })
}

/**
 * Ensure DynamoDB table exists
 * 
 * @param  payload object
 * @param  payload.tableName string
 */
function ensureTable(payload) {
    return isDbCreated(payload)
        .then(isCreated => isCreated ?
            payload :
            createTable(payload).then(() => payload)
        )
}


module.exports = {
    ensureTable
}