/**
 * @fileoverview More than just stub! Here we check if Livefyre auth is on the page. If it is, we use it.
 * If it isn't, then we fetch Livefyre.js and in set up a proxy/queue to the incoming Livefyre auth.
 */

var auth = {};
var authInterface = require('auth/contrib/auth-interface');
var getScript = require('../util/get-script');
var hazAuth = false;
var pendingCalls = [];

/**
 * Has auth arrived? We check that Livefyre.js is on the page, since it haz auth.
 */
function authHasArrived() {
    return typeof Livefyre !== 'undefined' && Livefyre['_lfjs'] === true;
}

/**
 * Flush the pending calls now that auth has arrived
 */
function flushPendingCalls() {
    var methodCall;
    for (var i = 0; i < pendingCalls.length; i++) {
        methodCall = pendingCalls[i];
        auth[methodCall[0]].apply(auth, methodCall[1]);
    }
    pendingCalls = [];
}

/**
 * Proxy a call to Livefyre auth
 * @param {string} methodName
 */
function proxyCall(methodName) {
    var args = Array.prototype.slice.call(arguments, 1);
    if (hazAuth) {
        return auth[methodName].apply(auth, args);
    }
    pendingCalls.push([methodName, args]);
}

/**
 * Load Scout to Load LivefyreJS + Auth
 */
function getLivefyreJS() {
    getScript.req('//cdn.livefyre.com/Livefyre.js', function () {
        Livefyre.on('initialized', handleAuthHasArrived);
    });
}

/**
 * Yay auth is here!
 */
function handleAuthHasArrived() {
    Livefyre.require(['auth'], function (authModule) {
        auth = authModule;
        hazAuth = true;
        flushPendingCalls();
    });
}

/**
 * Proxy all public auth methods so that they can be invoked before auth is actually on the page.
 */
var methodName;
for (var i = authInterface.length - 1; i >= 0; i--) {
    methodName = authInterface[i];
    auth[methodName] = proxyCall.bind(auth, methodName);
}

/**
 * If we don't have auth, fetch Livefyre.js
 */
if (authHasArrived()) {
    handleAuthHasArrived();
} else {
    getLivefyreJS();
}

module.exports = auth;
