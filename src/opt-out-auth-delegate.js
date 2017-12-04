/**
 * Delegate methods that need to be overridden.
 * @const Array.<string>
 */
var DELEGATE_METHODS = [
    'editProfile',
    'login',
    'logout',
    'viewProfile',
    'restoreSession'
];

/**
 * GDPR Opt Out auth delegate. Used as default delegate if opt out is enabled.
 */
module.exports = function () {
    DELEGATE_METHODS.forEach(function (method) {
        this[method] = function () {
            console.warn('Opt out has been enabled, ' + method + ' will not work');
        };
    }.bind(this));
};
