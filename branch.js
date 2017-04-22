'use strict';

const AWS = require('aws-sdk');
const {deleteFromGitBranch} = require('./src');
const dynamo = require('./src/dynamo.js');
const {isVerifiedRequest} = require('./src/githubVerification');

module.exports.delete = (event, context, callback) => {
  console.log('deleting a branch...');
  console.log(JSON.stringify(event));
  console.log(JSON.stringify(context));
  const body = JSON.parse(event.body);

  if (!isVerifiedRequest(event))
    return callback({error: 'X-Hub-Signature does not match calculated signature'}, null);

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
