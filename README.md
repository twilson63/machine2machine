# Machine2Machine Demo

This is a demo repo for the Machine2Machine presentation. The demo creates a proxy server and an echo target server.

The proxy server takes a target request on the `/proxy` endpoint and creates and signs a jwt, then forwards the request to the target. The target verifies the jwt and responds with an object that contains the payload and body of the request if it exists.

This demo shows a developer how they can leverage this machine2machine JWT exchange and implement their targets by keeping their target service secure.

## Run the demo

Create two terminal windows, 

Window 1

```sh
cd target
npm install
npm start
```

Window 2

```sh
cd proxy
npm install
npm start
```

Open a tool like https://jsonic.dev or curl and submit a request to the proxy endpoint 

```
curl localhost:3000/proxy?target=http://localhost:3000/
```

This request should sign the request with jwt and send the request to the target service which will verify the request.

Make sure the target service is secure.

```
curl localhost:3030
```

This should return an access denied.

## Tutorial

[Click Here](tutorial.md)

## Challenge

Build a secure target service of your own, and see if you can leverage this demo proxy on 

https://mass-ecdsa-proxy-demo.staging.ckapps.io 

to secure your target endpoint.

## Summary

You should now have a better understanding of how JWTs work and how you can go about securing your services.

> DISCLAIMER: This code is for demo purposes.
