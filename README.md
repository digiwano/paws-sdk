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
dox.put({
  TableName: 'someThings',
  Item: someDoc
})
.then(response => console.log(response.data))
.catch(error => console.error("Received Error during doc put:", error));
```

All components of the aws-sdk should be supported. If you find anything that
doesn't work, file a github issue or pull request.

### alternatives

There are a handful of other projects on npm which aim to provide something similar,
however most of them do one or more of the following, which I consider non-ideal:

1. wrapping AWS function calls: this is the naïve approach, which has proven in my testing to be error-prone
2. including aws-sdk as a direct dependency: peer dependencies are by far more reliable for this use case. including it as a direct dependency means that consumers of the library have no control over the AWS version used
3. exporting a different API: exporting something other than the native AWS object
4. creating a clunky API: e.g. by making you call .method(params).promise().then()