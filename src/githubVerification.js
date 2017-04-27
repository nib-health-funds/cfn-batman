const crypto = require('crypto');

module.exports.isVerifiedRequest = (event) => {
  const githubSecret = process.env.GITHUB_SECRET;
  const githubSignature = event.headers['X-Hub-Signature'];
  if (!githubSignature)
    return true;

  if (!githubSecret)
    return false;

  const bodyString = JSON.stringify(event.body);
  const calculatedSignature = 'sha1=' + crypto.createHmac('sha1', githubSecret).update(bodyString).digest('hex')

  return calculatedSignature === githubSignature;
}
