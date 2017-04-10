[![Build Status](https://travis-ci.org/nib-health-funds/batman.svg?branch=master)](https://travis-ci.org/nib-health-funds/batman)

![batman](https://mi-od-live-s.legocdn.com/r/www/r/catalogs/-/media/catalogs/characters/dc/mugshots/mugshot%202016/76055_1to1_mf_mugshot_batman_01.png?l.r2=1858676167)

Batman scours your AWS stack for villianous stacks and using genius intellect, physical prowess, martial arts abilities, detective skills, science and technology, vast wealth, intimidation, and indomitable will keeps the cloudy street safe and clean.
# How do I let Batman know I'm doing good? 
If you want to keep a stack safe from being killed by Batman add a `Batman` tag to your cloudformation stack, no need to have any content. 

Batman inspect the tags on your cloudformation stacks to determine what to shut down, specifically looking for the tag
Key: Slice
Value: !master

Batman can also receive a bat signal (commonly known as a Github webhook) to delete stacks. Suggested usage is to receive a webhook when a branch is deleted so Batman can cleanup.


## Getting Started

Edit [serverless.yml](serverless.yml) where you can adjust
* scheduled run time,
* if your project will accept webhooks
* AWS region,
* anything else which takes your fancy.


## Deployment

Refer to the [serverless framework](!https://serverless.com/) for detailed instructions, but should be as simple as

* Install dependencies

```
npm i
```

* Authenticate with AWS via your favourite CLI

* then deploy

```
npm deploy
```

## Built With

* [serverless framework](!https://serverless.com/)


## Authors
* [Shea Kelly](https://github.com/sheakelly)
* [Klee Thomas](https://github.com/kleeut)
* [Will Falconer](https://github.com/willfalconer)
* [Laurie Jones](https://github.com/lauriejones)
* Mark Kemper
* Kurt Gardiner
* [Sam Jeffress](https://github.com/samjeffress)
* [Matthew Turner](https://github.com/ramesius)

