# Secure Target Service Tutorial

In this tutorial, you will create a target express service that serves random quotes.

This service will need to be sure so that it can only be accessed via the ecdsa proxy.

## Requirements

* NodeJS 
* yarn

## Step 1

Create a new express target service project

```sh
mkdir rando
cd rando
yarn init -y
yarn add express @twilson63/ec-auth
yarn add random-quotes
# get public key from proxy
curl -O https://mass-ecdsa-proxy-demo.staging.ckapps.io/id_ecdsa.pub
```

> If curl does not work for you, you can open a browser to https://mass-ecdsa-proxy-demo.ckapps.io and copy the key from the home page and save it to a file called `id_ecdsa.pub`

## Step 2

create your `index.js` file

```js
const express = require('express')
const app = express()
const randomQuotes = require('random-quotes')



app.get('/', (req, res) => {
  res.send(randomQuotes())
})

app.listen(3030)
```

## Step 3

create a new file called `jwt-verify.js`

This file will house our jwt middleware that we will use to protect our service.

```js
const { verify } = require('@twilson63/ec-auth')
const fs = require('fs')
const publicKey = fs.readFileSync('./id_ecdsa.pub', 'utf-8')

module.exports = ({iss, aud}) => (req, res, next) => {
  if (!req.headers.authorization) {
    return res.status(401).send({error: 'not_authorized'})
  }
  const [type, jwt] = req.headers.authorization.split(' ')
  if (type !== 'Bearer') {
    return res.status(401).send({error: 'not_authorized'})
  }
  verify(jwt, publicKey, { iss, aud, algorithms: ['ES512'] })
    .then(token => {
      req.token = token
      next()
    })
    .catch(err => {
      res.status(401).send({error: 'not_authorized'})
    })
}
```

## Step 4

Now lets add our middleware to our service: `index.js`


```js
...
const verify = require('./jwt-verify')

...

app.use(verify({
  iss: 'https://mass-ecdsa-proxy-demo.staging.ckapps.io',
  aud: 'http:/localhost:3030'
}))

...
```


## Step 5

Lets run the application and see if we can confirm success.

Use https://jsonic.dev or curl to submit a request to the proxy service:

```sh
curl https://mass-ecdsa-proxy-demo.ckapps.io/proxy?target=http://localhost:3030/
```

I should get a random quote

## Step 6

Validate your service is secure by making calls to the service directly via curl, it should return not_authorized.

```sh
curl http://localhost:3030
```

## Summary

You have successfully build a secure random quote service, and a jwt-verify middleware. This tutorial should have provided some additional insight into securing services with JWT. 

> NOTE: The code provided is for demonstration purposes.
