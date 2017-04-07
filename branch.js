'use strict';

var AWS = require('aws-sdk');
var {deleteFromGitBranch} = require('./src');
var dynamo = require('./src/dynamo.js');

module.exports.delete = (event, context, callback) => {
  console.log('deleting a branch...');
  console.log(JSON.stringify(event));
  console.log(JSON.stringify(context));
  var body = JSON.parse(event.body);
  deleteFromGitBranch(body)
    .then(stacksForCleaning => dynamo.writeRecords(stacksForCleaning.deleted))
    .then(dynamo => {
      console.log("wrote something to dynamo");
      const response = {
        statusCode: 200,
        headers: {
          "content-type" : "application/json"
        },
        body: JSON.stringify(dynamo)
      };
      return callback(null, response);
    })
    .catch(error => {
      console.log('catching an error...');
      console.log(error);
      const response = {
        statusCode: 500,
        headers: {
          "content-type" : "application/json"
        },
        body: JSON.stringify(error)
      };
      callback(null, response);
    });
};
