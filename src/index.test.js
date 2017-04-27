var assert = require('assert');
var moment = require('moment');
var proxyquire = require('proxyquire');
var sinon = require('sinon');

var masterStackName = 'Master Tagged Stack';
process.env.BRANCH_KEY = 'Slice';

function assertDeletedStacksResponse(deletableStackNames) {
  // assert our master stack isn't listed in the return set
  var deletedStacks = deletableStackNames.deleted;
  assert.equal(deletedStacks.indexOf(masterStackName), -1);
  assert.equal(deletedStacks.indexOf('Non Master New Stack'), -1);
  assert.equal(deletedStacks.indexOf('UnTagged Stack'), -1);
  assert.equal(deletedStacks.indexOf('Do not delete me'), -1);
  assert.equal(deletedStacks.indexOf('Tagged Batman Not Deleted'), -1);
  assert.equal(deletedStacks.indexOf('elastic-beanstalk-master'), -1);
  assert(deletableStackNames.mercyShown.indexOf('Tagged Batman Not Deleted') > -1);
  assert(deletedStacks.indexOf('Delete Me') > -1);
  assert(deletedStacks.indexOf('Try deleting failed again') > -1);
  assert.equal(deletedStacks.length, 3);
}


describe('Cleanup', function() {
  it('should remove appropriate stacks', function(done) {
    deleteStacksStub.reset();
    var cleanup = proxyquire("./index.js", mocks);
    cleanup.cleanupStacks().then(deletableStackNames  => {
      console.log('Deleted: ', deletableStackNames.deleted);
      console.log('Shown Mercy: ', deletableStackNames.mercyShown);
      assertDeletedStacksResponse(deletableStackNames);
      assert(deleteStacksStub.called);
      assert(deleteStacksStub.calledWith(sinon.match({ StackName: 'Delete Me'}, { StackName: 'Try deleting failed again'}, { StackName: 'elastic-beanstalk-another-branch'})));
      done();
    }).catch(err => {
      console.log('errors');
      console.log(err);
      done(err);
    });
  });

  it('shouldnt invoke deleteStacks when dry run true', function(done) {
    deleteStacksStub.reset();
    var cleanup = proxyquire("./index.js", mocks);
    cleanup.cleanupStacks(true).then(deletableStackNames  => {
      console.log('Deleted: ', deletableStackNames.deleted);
      console.log('Shown Mercy: ', deletableStackNames.mercyShown);
      assertDeletedStacksResponse(deletableStackNames);
      assert.equal(deleteStacksStub.called, false);
      done();
    }).catch(err => {
      console.log('errors');
      console.log(err);
      done(err);
    });
  })
});

describe('Branch delete', function() {
  it('should find the stack and delete it', function(done) {
    deleteStacksStub.reset();
    var cleanup = proxyquire("./index.js", mocks);
    var gitDeleteBranchObject = {
      ref: 'branch-name',
      repository: { 
        name: 'repo-name'
      }
    };
    cleanup.deleteFromGitBranch(gitDeleteBranchObject).then(deletedBranchStatus  => {
      // mock aws passing back a list of stacks
      var deletedStacks = deletedBranchStatus.deleted;
      console.log('Deleted: ', deletedBranchStatus.deleted);
      console.log('Shown Mercy: ', deletedBranchStatus.mercyShown);

      // assert our master stack isn't listed in the return set
      assert.equal(deletedStacks.length, 1);
      assert.equal(deletedBranchStatus.mercyShown.length, 0);
      assert(deletedStacks.indexOf('branch-name-repo-name') > -1);

      assert(deleteStacksStub.called);
      assert(deleteStacksStub.calledWith(sinon.match({ StackName: 'branch-name-repo-name'})));
      done();
    }).catch(err => {
      console.log('errors');
      console.log(err);
      done(err);
    });
  });
});

var promisableDeleteStack = {
  promise: function() {
    return Promise.resolve({ ResponseMetadata: { RequestId: '3797470f-bb69-11e6-90e4-19b39eb619f7'}});
  }
};

var deleteStacksStub = sinon.stub().returns(promisableDeleteStack);
var mocks = {
  "aws-sdk":{
    CloudFormation: function(){
      this.deleteStack = deleteStacksStub;
      this.describeStacks = function(params, callback){
        console.log("IN THE MOCK");
        callback(null, {NextToken:null, Stacks:[{
          StackName: 'Master Tagged Stack',
          StackStatus: 'CREATE_COMPLETE',
          Tags: [{
            Key: 'Slice',
            Value: 'Master'
          }],
          Outputs: [],
          LastUpdatedTime: moment().add(-8, 'days')
        },{
          StackName: 'UnTagged Stack',
          StackStatus: 'CREATE_COMPLETE',
          Tags: [],
          Outputs: [],
          LastUpdatedTime: moment().add(-8, 'days')
        },{
          StackName: 'Non Master New Stack',
          StackStatus: 'CREATE_COMPLETE',
          Tags: [{
            Key: 'Slice',
            Value: 'non master'
          }],
          Outputs: [],
          LastUpdatedTime: moment().add(-6, 'days')
        },{
          StackName: 'Delete Me',
          StackStatus: 'CREATE_COMPLETE',
          Tags: [{
            Key: 'Slice',
            Value: 'non master'
          }],
          Outputs: [],
          LastUpdatedTime: moment().add(-8, 'days')
        },{
          StackName: 'Try deleting failed again',
          StackStatus: 'DELETE_FAILED',
          Tags: [{
            Key: 'Slice',
            Value: 'non master'
          }],
          Outputs: [],
          LastUpdatedTime: moment().add(-8, 'days')
        },{
          StackName: 'Do not delete me',
          StackStatus: 'UPDATE_IN_PROGRESS',
          Tags: [{
            Key: 'Slice',
            Value: 'non master'
          }],
          Outputs: [],
          LastUpdatedTime: moment().add(-8, 'days')
        },{
          StackName: 'Tagged Batman Not Deleted',
          StackStatus: 'CREATE_COMPLETE',
          Tags: [{
            Key: 'Slice',
            Value: 'non master'
          },{
            Key: 'Batman',
            Value: 'doesnt matter'
          }],
          Outputs: [],
          LastUpdatedTime: moment().add(-8, 'days')
        },{
          StackName: 'branch-name-repo-name',
          StackStatus: 'CREATE_COMPLETE',
          Tags: [{
            Key: 'Slice',
            Value: 'non master'
          },{
            Key: 'Batman',
            Value: 'doesnt matter'
          }],
          Outputs: [],
          LastUpdatedTime: moment().add(-2, 'days')
        },{
          StackName: 'elastic-beanstalk-master',
          StackStatus: 'CREATE_COMPLETE',
          Tags: [],
          Outputs: [
            {Key: 'ServiceRole', Description: 'Beanstalk Service Role'}
          ],
          LastUpdatedTime: moment().add(-8, 'days')
        },{
          StackName: 'elastic-beanstalk-another-branch',
          StackStatus: 'CREATE_COMPLETE',
          Tags: [],
          LastUpdatedTime: moment().add(-8, 'days'),
          Outputs: [
            {Key: 'ServiceRole', Description: 'Beanstalk Service Role'}
          ]
        }]});
      };
    }
  }};
