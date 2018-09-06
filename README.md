# Vip3-lock

## Installation
### Get ProjectGet Project

```
git clone https://github.com/104corp/vip3-lock.git
```

### Install dependencies

```
npm install
```
## Configuration 
### Environment

建立個人開發環境，建立.env並參照.env.example設定。

如果想使用local Dynamodb，請參考連結並且NODE_ENV設定為dev

* [Setting Up DynamoDB Local](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/DynamoDBLocal.html)

使用Web Service Dynamodb請參考連結，NODE_ENV設定為production且把Credentials填入.env

* [Setting Up DynamoDB (Web Service)](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/SettingUp.DynamoWebService.html)

