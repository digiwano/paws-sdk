"use strict";

var AWS;

var _badDeps = "paws-sdk requires aws-sdk to be installed as a peer dependency!";
var _badProm = ("" +
  "paws-sdk only works if there's already a Promise object in the global " +
  "scope. If you are able, upgrade to a version of node that has a native " +
  "promise implementation. If this isn't feasible, you can use this dirty hack: " +
  "`global.Promise = YOUR_PROMISE_IMPLEMENTATION;` before requiring paws-sdk"
);

try {
  AWS = require('aws-sdk');
} catch (e) {
  throw new Error(_badDeps);
}

if (typeof Promise !== 'undefined') {
  AWS.Request.prototype.then = function(resolve, reject) {
    return new Promise((innerResolve, innerReject) => {
      this.on('complete', function(response) {
        if (response.error) {
          innerReject(response.error);
        } else {
          innerResolve(response);
        }
      });
      this.runTo();
    }).then(resolve, reject);
  };

  AWS.Request.prototype.catch = function(reject) {
    return this.then(null, reject);
  };
} else {
  AWS.Request.prototype.then = AWS.Request.prototype.catch = function() {
    throw new Error(_badProm);
  };
}

module.exports = AWS;
