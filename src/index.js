'use strict';

var AWS = require('aws-sdk');
var _ = require('lodash');
var moment = require('moment');

var cloudformation = new AWS.CloudFormation();

var batmanTag = {Key: 'Batman'};

function cleanupStacks(dryRun) {
  console.log("In Clean UP Stacks");

  var batmanTaggedStacks = [];

  return listAllStacksWrapper()
    .then(allStacks => {
      console.log("allStacks", allStacks.length);
      var nonMasterStacks = findNonMasterStacks(allStacks);
      var oldNonMasterStacks = getOldStacks(nonMasterStacks);
      var withStatuses = filterStacksByStatus(oldNonMasterStacks);
      var notBatmanTag = ignoreStacksWithBatmanTag(withStatuses);
      batmanTaggedStacks = getBatmanStacks(withStatuses);
      return notBatmanTag;
    })
    .then(filteredStacks => {
      console.log('filteredStacks', filteredStacks);
      console.log(filteredStacks);
      return deleteStacks(filteredStacks, dryRun);
    })
    .then(deletedStacks => {
      console.log('deletedStacks', deletedStacks);
      var stackNames = deletedStacks.map(stack => stack.StackName).sort();
      console.log('Stack names: ', stackNames);
      return {
        deleted: stackNames, 
        mercyShown: batmanTaggedStacks.map(stack => stack.StackName).sort()
      }
    });
}

function deleteFromGitBranch(branchDeleteInformation) {
  console.log(branchDeleteInformation);
  return listAllStacksWrapper()
    .then(allStacks => {
      var nonMasterStacks = findNonMasterStacks(allStacks);
      var foundStack = stacksWithRepoAndBranchName(nonMasterStacks, branchDeleteInformation.repository.name, branchDeleteInformation.ref);
      return foundStack;
    })
    .then(filteredStacks => {
      console.log('found stack', filteredStacks);
      return deleteStacks(filteredStacks);
    })
    .then(deletedStacks => {
      console.log('deletedStacks', deletedStacks);
      var stackNames = deletedStacks.map(stack => stack.StackName).sort();
      console.log('Stack names: ', stackNames);
      return {
        deleted: stackNames, 
        mercyShown: []
      }
    });
}

function deleteStacks(stacks, dryRun) {
  if (dryRun)
    return Promise.resolve(stacks);

  var deleteAllTheThings = stacks.map(stack => {
    return cloudformation.deleteStack({StackName: stack.StackName}).promise();
  });

  return Promise.all(deleteAllTheThings)
  .then(deleteComplete => {
    console.log('delete complete');
    console.log(deleteComplete);
    return stacks; 
  });
}

function listAllStacksWrapper() {
  return new Promise((resolve, reject) => {
    return listAllStacks(null, [], resolve, reject);
  });
}

function listAllStacks(token, stackArray, resolve, reject) {
  console.log('getting stacks.....');
  var params = {NextToken: token};
  cloudformation.describeStacks(params, (err, data) => {
    if(err) {
      console.error("ERROR: ", err);
      return reject(err);
    }
    var stacks = stackArray.concat(data.Stacks);
    if(!data.NextToken)
      return resolve(stacks);
    return listAllStacks(data.NextToken, stacks, resolve, reject);
  });
}

function filterStacksByStatus(stacksArray) {
  return _.filter(stacksArray, stack => {
    var statuses = ["CREATE_COMPLETE", "UPDATE_COMPLETE", "DELETE_FAILED"];
    return statuses.indexOf(stack.StackStatus) >= 0;
  });
}

function findNonMasterStacks(stacksArray) {
  var nonMasterStacks = _.filter(stacksArray, stack => {
    var sliceTags = _.filter(stack.Tags, {Key: 'Slice'});
    if(sliceTags.length == 0) {
      // check if there are any tags at all - this might be an Elastic Beanstalk app!
      if (stack.Tags.length === 0) {
        return isStackNonMasterElasticBeanstalk(stack);
      }
      return false;
    }
    return sliceTags[0].Value.toLowerCase() != 'master';
  });
  return nonMasterStacks;
}

function isStackNonMasterElasticBeanstalk(stack) {
  if (stack.StackName.toLowerCase().indexOf('master') > -1) {
    return false;
  }
  var containsBeanstalkOutput = _.filter(stack.Outputs, ['Description', 'Beanstalk Service Role'])
  return containsBeanstalkOutput.length > 0;
}

function getOldStacks(stacksArray) {
  return _.filter(stacksArray, stack => {
    var mostRecentChange = stack.LastUpdatedTime ? stack.LastUpdatedTime : stack.CreationTime;
    var daysOld = moment(new Date()).diff(mostRecentChange, 'days', false);
    return daysOld > 7;
  });
}

function ignoreStacksWithBatmanTag(stacksArray) {
  console.log(stacksArray)
  var stacksWithoutBatmanTag = _.filter(stacksArray, stack => {
    var batmanTags = _.filter(stack.Tags, batmanTag);
    return batmanTags.length === 0;
  });
  console.log(stacksWithoutBatmanTag);
  return stacksWithoutBatmanTag
}

function getBatmanStacks(stacksArray) {
  var stacksWithoutBatmanTag = _.filter(stacksArray, stack => {
    var batmanTags = _.filter(stack.Tags, batmanTag);
    return batmanTags.length > 0;
  });
  return stacksWithoutBatmanTag
}

function stacksWithRepoAndBranchName(stacksArray, repositoryName, branchName) {
  var stacksWithRepoAndBranchName = _.filter(stacksArray, stack => {
    var stackNameLower = stack.StackName.toLowerCase();
    var repositoryNameLower = repositoryName.toLowerCase();
    var branchNameLower = branchName.toLowerCase();

    return stackNameLower.indexOf(repositoryNameLower) > -1 && stackNameLower.indexOf(branchNameLower) > -1;
  });
  return stacksWithRepoAndBranchName
}

module.exports = {cleanupStacks, deleteFromGitBranch};
