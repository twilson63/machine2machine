require('isomorphic-fetch')
const path = require('path')
const express = require('express')
const cors = require('cors')
const fs = require('fs')
const { sign } = require('@twilson63/ec-auth')

const publicKey = fs.readFileSync('./id_ecdsa.pub', 'utf-8')
const privateKey = fs.readFileSync('./id_ecdsa', 'utf-8')

const app = express()
app.use(cors())
/**
 * @swagger
 * /proxy:
 *   all:
 *     summary: proxy to forward all requests sent to the proxy endpoint, requires json endpoints
 */
app.all('/proxy', async (req, res) => {
  if (!req.query.target) { 
    return res.status(400).send({error: 'target query param is required'})
  }
  // build jwt payload
  const target = new URL(req.query.target)
  const issuer = 'https://mass-ecdsa-proxy-demo.staging.ckapps.io'
  const audience = target.origin
  const exp = Math.round(new Date() / 1000 + 7200) // 2 hours
  const iat = Math.round(new Date() / 1000)
  const token = sign(privateKey, {iss: issuer, aud: audience, exp, iat })
  // process proxy request
  // requests should be json
  const result = await fetch(target.href, {
    method: req.method,
    body: req.body,
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${token}`
    }
  }).then(r => r.json())
    .catch(err => ({error:'bad target request'}))
  // return result
  res.send(result)
})

/**
 * intro
 *
 */
app.get('/', (req, res) => {
  res.send(`
<!doctype html>
<html>
  <head>
    <meta charset="utf-8"><title>ecdsa proxy demo</title>
    <link rel="stylesheet" href="https://unpkg.com/bulma/css/bulma.css">
  </head>
  <body>
    <section class="section">
      <div class="container">
        <div class="content">
    <h1>ECDSA Proxy Demo</h1>
    <p>This is a proxy server that will forward a request to a target service, including a signed JWT.</p>
    <p>Any request with the path <code>/proxy?target=[url]</code> will be signed and passed to the url for processing</p>
    <p>The result will be returned to the caller.</p>
    
    <blockquote>the url should contain the full path of the request</blockquote> 

    <h2>Public Key</h2>

    <pre><code>
${publicKey}
    </code></pre>

    <hr />
    <p>You can also download the public key</p>

    <pre><code>
curl -O https://mass-ecdsa-proxy-demo.ckapps.io/id_ecdsa.pub
    </code></pre>
        </div>
      </div>
    </section>
  </body>
</html>
  `)

})

app.get('/id_ecdsa.pub', (req, res) => res.sendFile(path.resolve('./id_ecdsa.pub')))

if (!module.parent) {
  app.listen(process.env.PORT || 3000)
  console.log('proxy server is listening...')
}
