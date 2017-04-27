const assert = require('assert');
const {isVerifiedRequest} = require('./githubVerification');

describe('Github webhook verification', () => {
  it('should return true if no header present', () => {
    const event = {
      headers: {'someotherheader': 'somevalue'},
      body: 'things that are of no consequence at the moment'
    }
    const result = isVerifiedRequest(event);
    assert(result);
  });

  it('should return false if header present, but no key provided', () => {
    process.env.GITHUB_SECRET = '';
    const event = {
      headers: {
        'someotherheader': 'somevalue',
        'X-Hub-Signature': 'githubProvidedSignature'
      },
      body: 'things that are of no consequence at the moment'
    }
    const result = isVerifiedRequest(event);
    assert.equal(result, false);
  });

  it('should return false if header present, but calculated value does not match', () => {
    process.env.GITHUB_SECRET = 'secret';
    const event = {
      headers: {
        'someotherheader': 'somevalue',
        'X-Hub-Signature': validSignature
      },
      body: body
    }
    const result = isVerifiedRequest(event);
    assert.equal(result, false);
  });

  it('should return true if computed secret matches header', () => {
    process.env.GITHUB_SECRET = 'cats';
    const event = {
      headers: {
        'someotherheader': 'somevalue',
        'X-Hub-Signature': validSignature
      },
      body: body
    }
    const result = isVerifiedRequest(event);
    assert(result);
  });
});

const validSignature = 'sha1=e94b2afa239797e220d9697c7a63ddd78aae5895';

const body = {
  "zen": "It's not fully shipped until it's fast.",
  "hook_id": 13375988,
  "hook": {
    "type": "Repository",
    "id": 13375988,
    "name": "web",
    "active": true,
    "events": [
      "push"
    ],
    "config": {
      "content_type": "json",
      "insecure_ssl": "0",
      "secret": "********",
      "url": "https://cats.com/webhooks"
    },
    "updated_at": "2017-04-22T11:37:58Z",
    "created_at": "2017-04-22T11:37:58Z",
    "url": "https://api.github.com/repos/samjeffress/bakery/hooks/13375988",
    "test_url": "https://api.github.com/repos/samjeffress/bakery/hooks/13375988/test",
    "ping_url": "https://api.github.com/repos/samjeffress/bakery/hooks/13375988/pings",
    "last_response": {
      "code": null,
      "status": "unused",
      "message": null
    }
  },
  "repository": {
    "id": 85813602,
    "name": "bakery",
    "full_name": "samjeffress/bakery",
    "owner": {
      "login": "samjeffress",
      "id": 1442081,
      "avatar_url": "https://avatars2.githubusercontent.com/u/1442081?v=3",
      "gravatar_id": "",
      "url": "https://api.github.com/users/samjeffress",
      "html_url": "https://github.com/samjeffress",
      "followers_url": "https://api.github.com/users/samjeffress/followers",
      "following_url": "https://api.github.com/users/samjeffress/following{/other_user}",
      "gists_url": "https://api.github.com/users/samjeffress/gists{/gist_id}",
      "starred_url": "https://api.github.com/users/samjeffress/starred{/owner}{/repo}",
      "subscriptions_url": "https://api.github.com/users/samjeffress/subscriptions",
      "organizations_url": "https://api.github.com/users/samjeffress/orgs",
      "repos_url": "https://api.github.com/users/samjeffress/repos",
      "events_url": "https://api.github.com/users/samjeffress/events{/privacy}",
      "received_events_url": "https://api.github.com/users/samjeffress/received_events",
      "type": "User",
      "site_admin": false
    },
    "private": false,
    "html_url": "https://github.com/samjeffress/bakery",
    "description": "cook up some status cake alerts",
    "fork": false,
    "url": "https://api.github.com/repos/samjeffress/bakery",
    "forks_url": "https://api.github.com/repos/samjeffress/bakery/forks",
    "keys_url": "https://api.github.com/repos/samjeffress/bakery/keys{/key_id}",
    "collaborators_url": "https://api.github.com/repos/samjeffress/bakery/collaborators{/collaborator}",
    "teams_url": "https://api.github.com/repos/samjeffress/bakery/teams",
    "hooks_url": "https://api.github.com/repos/samjeffress/bakery/hooks",
    "issue_events_url": "https://api.github.com/repos/samjeffress/bakery/issues/events{/number}",
    "events_url": "https://api.github.com/repos/samjeffress/bakery/events",
    "assignees_url": "https://api.github.com/repos/samjeffress/bakery/assignees{/user}",
    "branches_url": "https://api.github.com/repos/samjeffress/bakery/branches{/branch}",
    "tags_url": "https://api.github.com/repos/samjeffress/bakery/tags",
    "blobs_url": "https://api.github.com/repos/samjeffress/bakery/git/blobs{/sha}",
    "git_tags_url": "https://api.github.com/repos/samjeffress/bakery/git/tags{/sha}",
    "git_refs_url": "https://api.github.com/repos/samjeffress/bakery/git/refs{/sha}",
    "trees_url": "https://api.github.com/repos/samjeffress/bakery/git/trees{/sha}",
    "statuses_url": "https://api.github.com/repos/samjeffress/bakery/statuses/{sha}",
    "languages_url": "https://api.github.com/repos/samjeffress/bakery/languages",
    "stargazers_url": "https://api.github.com/repos/samjeffress/bakery/stargazers",
    "contributors_url": "https://api.github.com/repos/samjeffress/bakery/contributors",
    "subscribers_url": "https://api.github.com/repos/samjeffress/bakery/subscribers",
    "subscription_url": "https://api.github.com/repos/samjeffress/bakery/subscription",
    "commits_url": "https://api.github.com/repos/samjeffress/bakery/commits{/sha}",
    "git_commits_url": "https://api.github.com/repos/samjeffress/bakery/git/commits{/sha}",
    "comments_url": "https://api.github.com/repos/samjeffress/bakery/comments{/number}",
    "issue_comment_url": "https://api.github.com/repos/samjeffress/bakery/issues/comments{/number}",
    "contents_url": "https://api.github.com/repos/samjeffress/bakery/contents/{+path}",
    "compare_url": "https://api.github.com/repos/samjeffress/bakery/compare/{base}...{head}",
    "merges_url": "https://api.github.com/repos/samjeffress/bakery/merges",
    "archive_url": "https://api.github.com/repos/samjeffress/bakery/{archive_format}{/ref}",
    "downloads_url": "https://api.github.com/repos/samjeffress/bakery/downloads",
    "issues_url": "https://api.github.com/repos/samjeffress/bakery/issues{/number}",
    "pulls_url": "https://api.github.com/repos/samjeffress/bakery/pulls{/number}",
    "milestones_url": "https://api.github.com/repos/samjeffress/bakery/milestones{/number}",
    "notifications_url": "https://api.github.com/repos/samjeffress/bakery/notifications{?since,all,participating}",
    "labels_url": "https://api.github.com/repos/samjeffress/bakery/labels{/name}",
    "releases_url": "https://api.github.com/repos/samjeffress/bakery/releases{/id}",
    "deployments_url": "https://api.github.com/repos/samjeffress/bakery/deployments",
    "created_at": "2017-03-22T10:15:18Z",
    "updated_at": "2017-03-31T05:57:15Z",
    "pushed_at": "2017-04-04T06:09:05Z",
    "git_url": "git://github.com/samjeffress/bakery.git",
    "ssh_url": "git@github.com:samjeffress/bakery.git",
    "clone_url": "https://github.com/samjeffress/bakery.git",
    "svn_url": "https://github.com/samjeffress/bakery",
    "homepage": null,
    "size": 24,
    "stargazers_count": 0,
    "watchers_count": 0,
    "language": "JavaScript",
    "has_issues": true,
    "has_projects": true,
    "has_downloads": true,
    "has_wiki": true,
    "has_pages": false,
    "forks_count": 0,
    "mirror_url": null,
    "open_issues_count": 0,
    "forks": 0,
    "open_issues": 0,
    "watchers": 0,
    "default_branch": "master"
  },
  "sender": {
    "login": "samjeffress",
    "id": 1442081,
    "avatar_url": "https://avatars2.githubusercontent.com/u/1442081?v=3",
    "gravatar_id": "",
    "url": "https://api.github.com/users/samjeffress",
    "html_url": "https://github.com/samjeffress",
    "followers_url": "https://api.github.com/users/samjeffress/followers",
    "following_url": "https://api.github.com/users/samjeffress/following{/other_user}",
    "gists_url": "https://api.github.com/users/samjeffress/gists{/gist_id}",
    "starred_url": "https://api.github.com/users/samjeffress/starred{/owner}{/repo}",
    "subscriptions_url": "https://api.github.com/users/samjeffress/subscriptions",
    "organizations_url": "https://api.github.com/users/samjeffress/orgs",
    "repos_url": "https://api.github.com/users/samjeffress/repos",
    "events_url": "https://api.github.com/users/samjeffress/events{/privacy}",
    "received_events_url": "https://api.github.com/users/samjeffress/received_events",
    "type": "User",
    "site_admin": false
  }
}
