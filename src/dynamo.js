'use strict';

const AWS = require("aws-sdk");
const moment = require('moment');
const dynamo = new AWS.DynamoDB();
const tableName = "Batman";

function putItem(deleteDate, deltedStackName) {
  return new Promise((resolve, reject) => {
    const params = {
      TableName: tableName,
      Item: {
        "StackName": {S: deltedStackName},
        "Date": {S: deleteDate}
      }
    };

    console.log('putting item ', params);

    dynamo.putItem(params, (err, data) => {
      if (err) {
        console.log(err);
        return reject(err);
      }
      if (data) {
        console.log('created', data);
        return resolve(data);
      }
    })
  });
}

const writeRecords = function(deletedStackNames) {
  console.log('creating records...')
  const nowUtcString = moment().utc().format();
  const writeToDynamoPromises = deletedStackNames.map(stackName => putItem(nowUtcString, stackName));
  return Promise.all(writeToDynamoPromises);
}

module.exports = {writeRecords};
