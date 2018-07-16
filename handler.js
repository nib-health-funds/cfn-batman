'use strict';

const AWS = require('aws-sdk');
const {cleanupStacks} = require('./src');
const dynamo = require('./src/dynamo.js');

module.exports.cleanupStacks = (event, context, callback) => {
  console.log('running some awesome logic');

  cleanupStacks()
    .then(stacksForCleaning => dynamo.writeRecords(stacksForCleaning.deleted))
    .then(allResponse => {
      console.log(allResponse[1]);
      callback(null, { message: 'Go Serverless v1.0! Your function executed successfully!', event });
    })
    .catch(error => {
      callback(error);
      console.error(error);
    });
};
