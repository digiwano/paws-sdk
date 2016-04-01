## paws-sdk: Sane Promises for aws-sdk

This library provides clean promise-based APIs for aws-sdk in a seamless way. It
is a light wrapper around aws-sdk which adds '.then()' and '.catch()' methods to
an aws-request object. It does not alter the API of aws-sdk in any way otherwise.

### installation

```
npm install --save paws-sdk aws-sdk
```

`aws-sdk` is a peer dependency of this package so you must explicitly install it
alongside `paws-sdk`.

### usage

```javascript
const AWS = require('paws-sdk');

const dox = new AWS.DynamoDB.DocumentClient();
dox
  .put({
    TableName: 'someThings',
    Item: someDoc
  })
  .then(response => console.log(response.data))
  .catch(error => console.error("Received Error during doc put:", error))
  .then(() => dox.scan({
    TableName: 'someThings'
  }))
  .then(response => console.log("existing documents", response.data));
```

All components of the aws-sdk should be supported. If you find anything that
doesn't work, file a github issue or pull request.

### Promise implementation

paws-sdk assumes that native promises exist and can be found as the
globally-defined `Promise`. If you are attempting to use this lib in
a version of node which does not have native Promises, you must provide
your own version before doing `require('paws-sdk');`. for example:

```javascript
global.Promise = require('lie'); // lie provides a bare-bones promises/A+ implementation
var AWS = require('paws-sdk'); // because let's be honest, if you don't have Promise, you don't have const either.
// use AWS as normal
```

### Amazon, you cheeky bastards

Roughly 15 minutes after I published this module to npm, Amazon released version
2.3.0 of the AWS-SDK for javascript, which adds official support for promises
([release notes](http://aws.amazon.com/releasenotes/SDK/JavaScript/8589740860839559)).

That's a wonderful move on their part, and it's really nice that they have a
supported method of using a modern promise-based API now. However, I disagree
with their implementation for a few reasons:

1. The approach they've taken is to add an AWS.Request.prototype.promise method,
   which returns a promise. On the surface, this doesn't seem like a bad idea,
   and there's no huge downsides to it (and, in fact, one of the aws promise
   libraries I've used over the last couple years, `aws-sdk-promise`, adopts
   this approach as well), but it's entirely unnecessary -- the
   only thing you need to be a fully compliant promise is a .then() method,
   so why not just add .then() and .catch() to the request prototype instead?

2. Their promise resolves with the response.data object, rather than the response
   instance directly. True, often the .data is all you really care about, but
   if you DO need the other data on the request object, you'd have to do some
   wacky dance of caching the object, then getting a promise out of it, then
   during promise resolution when you get the .data only, refer back up to the
   request object you cached earlier. Ugh.

3. Lastly, there's a whole dance of passing in a Promise implementation. Again,
   this doesn't sound like a bad idea at first, but I'm uncomfortable with it
   because it can be changed at runtime and that could cause some confusion. In
   addition, with node v0.10 [very quickly approaching](https://github.com/nodejs/LTS#lts_schedule)
   its end-of-life for LTS support, and [not even being listed](https://nodejs.org/)
   on the node.js homepage anymore, there is no version of node.js which doesn't
   have native promises which you'd be wise to be using in production. Of course,
   as AWS's Lambda team [seems to have missed the memo](http://docs.aws.amazon.com/lambda/latest/dg/current-supported-versions.html),
   one can understand why they might want to support antiquated node versions
   (though I'd wager a majority of people using AWS lambda now are using babel
   to get around this severe limitation).

   But hey, maybe all I need to do is code up a hacky implementation of
   lambdas-on-modern-node, publish it, then wait 15 minutes for amazon's version. :)

Considering all of the above, I've decided to leave `paws-sdk` up, and use it
internally, despite the official promise support. Under the hood, they're using
pretty much the exact same logic/implementation as I am (aside from the three
points above), so you should be safe to use this project as well. 

### alternatives

There are a handful of other projects on npm which aim to provide something similar,
however most of them do one or more of the following, which I consider non-ideal:

1. wrapping AWS function calls: this is the naïve approach, which has proven in my testing to be error-prone
2. including aws-sdk as a direct dependency: peer dependencies are by far more reliable for this use case. including it as a direct dependency means that consumers of the library have no control over the AWS version used
3. exporting a different API: exporting something other than the native AWS object
4. creating a clunky API: e.g. by making you call .method(params).promise().then()
