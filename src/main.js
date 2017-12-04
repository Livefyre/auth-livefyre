'use strict';

var auth = require('auth');
var optOutAuthDelegate = require('./opt-out-auth-delegate');
var plugin = require('./auth-plugin');
var session = require('./session');

/*
livefyre-auth
*/
plugin(auth);
module.exports = exports = auth;

// Create a Livefyre.com auth delegate
exports.createDelegate = require('./livefyre-auth-delegate');

// Model of Livefyre UserProfile and resources from auth endpoints
exports.User = require('./user');

// fetch livefyre users from auth apis
exports.userService = require('./user-service');

// use the auth api
exports.api = require('./auth-api');

// plugin to another `auth`
exports.authPlugin = plugin;

// Override the delegate function by forcing the opt out delegate to be used
// instead of the delegate that was actually passed in.
exports.optOut = function () {
  var delegate = auth.delegate;
  auth.delegate = function () {
    delegate(new optOutAuthDelegate());
  };

  session.clear();
};
