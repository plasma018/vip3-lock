const AWS = require("aws-sdk");
const isDev = process.env.NODE_ENV !== 'production';
const config = {
    aws_local_config: {
        region: 'local',
        endpoint: 'http://localhost:8000'
    },
    aws_remote_config: {
        region: "us-west-2",
        accessKeyId: "AKIAJZYHLQK5MGEC5FHQ",
        accessKey: "EGqJ1mO+meyGMBTVieNbeGIqsqcJxCpeGjnd7qjg"
    }
};

if (isDev) {
    AWS.config.update(config.aws_local_config);
} else {
    AWS.config.update(config.aws_remote_config);
}

const docClient = new AWS.DynamoDB.DocumentClient();
const dynamodb = new AWS.DynamoDB();

module.exports.docClient = docClient
module.exports.dynamodb = dynamodb