'use strict';

var AWS = require("aws-sdk");
var moment = require('moment');
var dynamo = new AWS.DynamoDB();
var tableName = "Batman";

function putItem(deleteDate, deltedStackName) {
  return new Promise((resolve, reject) => {
    var params = {
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

var writeRecords = function(deletedStackNames) {
  console.log('creating records...')
  var nowUtcString = moment().utc().format();
  var writeToDynamoPromises = deletedStackNames.map(stackName => putItem(nowUtcString, stackName));
  return Promise.all(writeToDynamoPromises);
}

module.exports = {writeRecords};
