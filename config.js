var batmanTagKey = 'Batman';
var stackToKeepRegexes = [/^test$/i, /^master$/i, /^test-master$/i]
var branchKey = 'stage'
var branchKeyMatches = (key) => key.toLowerCase() === branchKey.toLowerCase()

module.exports = {
  batmanTagKey, 
  stackToKeepRegexes,
  branchKey,
  branchKeyMatches
};