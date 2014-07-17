
/**
 * @fileoverview Auth delegate adapters for old to new delegates.
 */
var auth = require('auth');
var bind = require('mout/function/bind');

/**
 * @typedef {Object} OldAuthDelegate
 * @property {function()} login
 * @property {function()} logout
 * @property {function()} viewProfile
 * @property {function()} editProfile
 * @property {function()} loginByCookie
 */

/**
 * @typedef {Object} AuthDelegate
 * @property {function()} login
 * @property {function()} logout
 * @property {function()} viewProfile
 * @property {function()} editProfile
 * @property {fucntion()} destroy
 */

/**
 * @typedef {Object} BetaAuthDelegate
 * @property {function()} login
 * @property {function()} logout
 * @property {function()} viewProfile
 * @property {function()} editProfile
 * @property {fucntion()} restoreSession
 */

/**
 *
 * @param {AuthDelegate|OldAuthDelegate} delegate
 * @return {boolean}
 */
function isFyreOld(delegate) {
    var isDelegateOld = typeof delegate.loginByCookie === 'function';
    var doesFyreExist = window.fyre && typeof window.fyre.conv === 'object';
    return !!isDelegateOld && !!doesFyreExist;
}

/**
 * The livefyre delegate from Sidenotes beta days
 * see https://github.com/Livefyre/auth-delegates
 * @param {AuthDelegate|BetaAuthDelegate} delegate
 * @return {boolean}
 */
function isBetaDelegate(delegate) {
    var hasRestoreSession = typeof delegate.restoreSession === 'function';
    var hasLivefyreUser = window.Livefyre && typeof window.Livefyre.user === 'object';
    return hasRestoreSession && hasLivefyreUser;
}

/**
 *
 * @param {AuthDelegate|OldAuthDelegate|BetaAuthDelegate} delegate
 * @return {boolean}
 */
function isOld(delegate) {
    return isFyreOld(delegate) || isBetaDelegate(delegate);
}

function adaptBetaDelegate(delegate, articleId, siteId) {
    var newDelegate = {};
    var Livefyre = window.Livefyre;

    newDelegate.login = (function () {
        var originalFn = delegate.login;
        return function (authenticate) {
            originalFn.call(delegate);
            Livefyre.user.once('login', function (userInfo) {
                auth.authenticate({
                    livefyre: {
                        token: userInfo.token.value,
                        articleId: articleId,
                        siteId: siteId,
                        serverUrl: delegate.serverUrl
                    }
                });
            });
        };
    })();

    newDelegate.logout = (function () {
        var originalFn = delegate.logout;
        return function (done) {
            originalFn.call(delegate);
            Livefyre.user.once('logout', function () {
                done();
            });
        };
    })();

    newDelegate.viewProfile = bind(delegate.viewProfile, delegate);

    newDelegate.editProfile = bind(delegate.editProfile, delegate);

    return auth.delegate(newDelegate);
}

function adaptOldDelegate(delegate, articleId, siteId, networkId, environment) {
    var fyre = window.fyre;

    function handleChangeToken(token) {
        if (!token) {
            return auth.logout();
        }
        auth.authenticate({
            livefyre: {
                token: token,
                articleId: articleId,
                siteId: siteId,
                serverUrl: document.location.protocol + '//admin.' + (environment || networkId)
            }
        });
    }

    fyre.conv.user.on('change:token', function (user, token) {
        handleChangeToken(token);
    });
    fyre.conv.initializeGlobalServices({
        articleId: articleId,
        siteId: siteId,
        networkId: networkId,
        authDelegate: delegate
    });

    if (!fyre.conv.ready.hasFired()) {
        fyre.conv.ready.trigger();
    }

    if (fyre.conv.user.id) {
        if (!auth.get('livefyre')) {
            handleChangeToken(fyre.conv.user.get('token'));
        }
    }

    var handler = {
        success: function () {},
        failure: function () {}
    };
    var slice = Array.prototype.slice;

    var newDelegate = {};

    newDelegate.login = (function () {
        var originalFn = delegate.login;
        return function (authenticate) {
            originalFn.call(delegate, {
                success: function () {
                    handleChangeToken(fyre.conv.user.get('token'));
                },
                failure: function () {}
            });
        };
    })();

    newDelegate.logout = (function () {
        var originalFn = delegate.logout;
        return function (done) {
            originalFn.call(delegate);
            done();
        };
    })();

    newDelegate.viewProfile = (function () {
        var originalFn = delegate.viewProfile;
        return function () {
            var args = slice.call(arguments);
            args.unshift(handler);
            originalFn.apply(delegate, args);
        };
    })();

    newDelegate.editProfile = (function () {
        var originalFn = delegate.editProfile;
        return function () {
            var args = slice.call(arguments);
            args.unshift(handler);
            originalFn.apply(delegate, args);
        };
    })();

    auth.delegate(newDelegate);

    // Restore the session
    delegate.loginByCookie();
}

/**
 * Fill in interface for old delegate to new delegate.
 * @param {OldAuthDelegate} delegate
 * @param {string} articleId
 * @param {string} siteId
 * @param {string} networkId
 */
function oldToNew(delegate, articleId, siteId, networkId, environment) {
    if (isBetaDelegate(delegate)) {
        return adaptBetaDelegate(delegate, articleId, siteId);
    }
    return adaptOldDelegate(delegate, articleId, siteId, networkId, environment);
}

module.exports = {
    oldToNew: oldToNew,
    isOld: isOld
};
