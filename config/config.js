require('dotenv').config()
const AWS = require("aws-sdk")

const config = {
    'dev': {
        endpoint: process.env.DEV_ENDPOINT,
        region: process.env.REGION
    },
    'production': {
        endpoint: process.env.ENDPOINT,
        region: process.env.REGION,
        accessKeyId: process.env.ACCESS_KEY_ID,
        accessKey: process.env.ACCESS_KEY
    }
}

const dynamodb = new AWS.DynamoDB(config[process.env.NODE_ENV])
const docClient = new AWS.DynamoDB.DocumentClient(config[process.env.NODE_ENV])

module.exports = {
    docClient,
    dynamodb
}