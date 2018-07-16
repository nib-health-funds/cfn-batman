'use strict';

const AWS = require('aws-sdk');
const _ = require('lodash');
const moment = require('moment');

const cloudformation = new AWS.CloudFormation();

const batmanTagKey = 'Batman';

const cleanupStacks = async dryRun => {
  console.log("In Clean UP Stacks");

  const allStacks = await listAllStacks(null, [])
  console.log("allStacks", allStacks.length);
  const nonMasterStacks = findNonMasterStacks(allStacks);
  const oldNonMasterStacks = getOldStacks(nonMasterStacks);
  const withStatuses = filterStacksByStatus(oldNonMasterStacks);
  const filteredStacks = ignoreStacksWithBatmanTag(withStatuses);
  const batmanTaggedStacks = getBatmanStacks(withStatuses);
  console.log('filteredStacks', filteredStacks);

  const deletedStacks = await deleteStacks(filteredStacks, dryRun);
  console.log('deletedStacks', deletedStacks);
  const stackNames = deletedStacks.map(stack => stack.StackName).sort();
  console.log('Stack names: ', stackNames);
  return {
    deleted: stackNames, 
    mercyShown: batmanTaggedStacks.map(stack => stack.StackName).sort()
  }
}

const deleteFromGitBranch = async (branchDeleteInformation) => {
  console.log(branchDeleteInformation);
  const allStacks = await listAllStacks(null, [])
  const nonMasterStacks = findNonMasterStacks(allStacks);
  const foundStack = stacksWithRepoAndBranchName(nonMasterStacks, branchDeleteInformation.repository.name, branchDeleteInformation.ref);

  console.log('found stack', foundStack);
  const deletedStacks = await deleteStacks(foundStack);
  console.log('deletedStacks', deletedStacks);
  const stackNames = deletedStacks.map(stack => stack.StackName).sort();
  console.log('Stack names: ', stackNames);
  return {
    deleted: stackNames, 
    mercyShown: []
  }
}

const deleteStacks = async (stacks, dryRun) => {
  if (dryRun)
    return stacks;

  const deleteAllTheThings = stacks.map(stack => {
    return cloudformation.deleteStack({StackName: stack.StackName}).promise();
  });

  return Promise.all(deleteAllTheThings)
  .then(deleteComplete => {
    console.log('delete complete');
    console.log(deleteComplete);
    return stacks; 
  });
}

const listAllStacks = (token, stackArray) => {
  console.log('getting stacks.....');
  const params = { NextToken: token };
  const data = await cloudformation.describeStacks(params).promise()
  const stacks = stackArray.concat(data.Stacks);
  if(!data.NextToken)
    return stacks;
  return listAllStacks(data.NextToken, stacks);
}

function filterStacksByStatus(stacksArray) {
  return _.filter(stacksArray, stack => {
    const statuses = ["CREATE_COMPLETE", "UPDATE_COMPLETE", "DELETE_FAILED"];
    return statuses.indexOf(stack.StackStatus) >= 0;
  });
}

function findNonMasterStacks(stacksArray) {
  const nonMasterStacks = _.filter(stacksArray, stack => {
    const branchTag = _.filter(stack.Tags, (tag) => {return tag.Key.toLowerCase() == process.env.BRANCH_KEY.toLowerCase()});
    if(branchTag.length == 0) {
      // check if there are any tags at all - this might be an Elastic Beanstalk app!
      if (stack.Tags.length === 0) {
        return isStackNonMasterElasticBeanstalk(stack);
      }
      return false;
    }
    return branchTag[0].Value.toLowerCase() != 'master';
  });
  return nonMasterStacks;
}

function isStackNonMasterElasticBeanstalk(stack) {
  if (stack.StackName.toLowerCase().indexOf('master') > -1) {
    return false;
  }
  const containsBeanstalkOutput = _.filter(stack.Outputs, ['Description', 'Beanstalk Service Role'])
  return containsBeanstalkOutput.length > 0;
}

function getOldStacks(stacksArray) {
  return _.filter(stacksArray, stack => {
    const mostRecentChange = stack.LastUpdatedTime ? stack.LastUpdatedTime : stack.CreationTime;
    const daysOld = moment(new Date()).diff(mostRecentChange, 'days', false);
    return daysOld > 7;
  });
}

function ignoreStacksWithBatmanTag(stacksArray) {
  console.log(stacksArray)
  const stacksWithoutBatmanTag = _.filter(stacksArray, stack => {
    return batmanTagFilter(stack.Tags).length === 0;
  });
  console.log(stacksWithoutBatmanTag);
  return stacksWithoutBatmanTag
}

const getBatmanStacks = stacksArray => {
  const stacksWithoutBatmanTag = _.filter(stacksArray, stack => {
    return batmanTagFilter(stack.Tags).length > 0;
  });
  return stacksWithoutBatmanTag
}

function batmanTagFilter(stackTags) {
  return _.filter(stackTags, (tag) => {return tag.Key.toLowerCase() == batmanTagKey.toLowerCase()});
}

function stacksWithRepoAndBranchName(stacksArray, repositoryName, branchName) {
  const stacksWithRepoAndBranchName = _.filter(stacksArray, stack => {
    const stackNameLower = stack.StackName.toLowerCase();
    const repositoryNameLower = repositoryName.toLowerCase();
    const branchNameLower = branchName.toLowerCase();

    return stackNameLower.indexOf(repositoryNameLower) > -1 && stackNameLower.indexOf(branchNameLower) > -1;
  });
  return stacksWithRepoAndBranchName
}

module.exports = {cleanupStacks, deleteFromGitBranch};
