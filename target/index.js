const express = require('express')
const app = express()
const fs = require('fs')
const { verify } = require('@twilson63/ec-auth')
const publicKey = fs.readFileSync('./id_ecdsa.pub', 'utf-8')

/**
 * @swagger
 * /:
 *   all:
 *     summary: echo server, validates jwt and then returns payload and body
 *
 */

app.all('/', express.json(),  async (req, res) => {
  // check if authorization header is supplied
  if (!req.headers.authorization) {
    return res.status(401).send({error: 'not_authorized'})
  }
  // get jwt from header
  const jwt = req.headers.authorization.split(' ')[1]
  
  // verify jwt with publicKey and attributes
  const payload = await verify(jwt, publicKey, {
    algorithms: ['ES512'],
    issuer: 'https://mass-ecdsa-proxy-demo.staging.ckapps.io',
    audience: 'http://localhost:3030'
  })
    .catch(err => {
      res.status(401)
      return { error: 'not_authorized'}
    })

  // send echo response
  res.send({ payload, body: req.body || {}})
})

app.listen(3030)
