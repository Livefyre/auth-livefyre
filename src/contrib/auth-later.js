/**
 * @fileoverview More than just stub! Here we check if Livefyre auth is on the page. If it is, we use it.
 * If it isn't, then we fetch Livefyre.js and in set up a proxy/queue to the incoming Livefyre auth.
 */

var getScript = require('../util/get-script');
var auth;
var hazAuth;
var pendingCalls;

/**
 * Has auth arrived?
 */
function authHasArrived() {
    return typeof Livefyre !== 'undefined' && typeof Livefyre['auth'] === 'object';
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
    pendingCalls = null;
}

/**
 * Proxy a call to Livefyre auth
 * @param {string} methodName
 * @param {Array} args
 * @param {Boolean} queue
 */
function proxyCall(methodName, args, queue) {
    if (hazAuth) {
        return auth[methodName].apply(auth, args);
    }
    queue && pendingCalls.push([methodName, args]);
}

/**
 * Load Scout to Load LivefyreJS + Auth
 */
function getLivefyreJS() {
    getScript.req('//cdn.livefyre.com/Livefyre.js', function () {
        Livefyre.on('LivefyreJS.initialized', handleAuthHasArrived);
    });
}

/**
 * Yay auth is here!
 */
function handleAuthHasArrived() {
    hazAuth = true;
    auth = Livefyre['auth'];
    flushPendingCalls();
}

if (hazAuth = authHasArrived()) {
    auth = Livefyre['auth'];
} else {
    pendingCalls = [];
    getLivefyreJS();

    // Silly proxy of auth. Some methods are queued b/c we can fulfill them later
    auth = {
        authenticate: function () { return proxyCall('authenticate', arguments, true) },
        delegate: function () { return proxyCall('delegate', arguments, true)},
        editProfile: function () { return proxyCall('editProfile', arguments, true)},
        get: function () { return proxyCall('get', arguments) },
        hasDelegate: function () { return proxyCall('hasDelegate', arguments) },
        isAuthenticated: function () { return proxyCall('isAuthenticated', arguments) },
        login: function () { return proxyCall('login', arguments, true) },
        logout: function () { return proxyCall('logout', arguments, true) },
        on: function () { return proxyCall('on', arguments, true) },
        removeListener: function () { return proxyCall('removeListener', arguments, true) },
        viewProfile: function () { return proxyCall('viewProfile', arguments, true) }
    }
}

module.exports = auth;
