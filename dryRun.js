'use strict';

var {cleanupStacks} = require('./src');

module.exports.test = (event, context, callback) => {
  cleanupStacks(true)
    .then(stacksForCleaning => {
      const response = {
        statusCode: 200,
        headers: {
          "content-type" : "application/json"
        },
        body: JSON.stringify(stacksForCleaning)
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
      callback(error, null);
    });
};
