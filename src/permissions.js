'use strict';

var authApi = require('./auth-api');
var CollectionAuthorization = require('./collection-authorization');

var permissions = module.exports = {};

permissions._authApi = authApi;

/**
 * Fetch a user's permissions for a Livefyre Collection
 * @param tokenOrUser.user {object} user you want permissions for
 * @param tokenOrUser.token {object} If you don't haz the user, supply a token
 * @param collection.network {string} Network of Collection
 * @param collection.siteId {string} Site ID of Collection
 * @param collection.articleId {string} Article ID of Collection
 * @throws Error if you didn't pass all required Collection info
 */
permissions.forCollection = function (tokenOrUser, collection, errback) {
    validateCollection(collection);

    var opts = Object.create(collection);
    opts.token = opts.token || opts.user.get('token');

    var user = opts.user || new LivefyreUser();

    var updateUser = this._authApi.updateUser.bind(this._authApi);
    this._authApi.authenticate(opts, function (err, resp) {
        if (err) {
            return errback(err);
        }
        // bad, duplicated from user-service
        if ( ! userInfo.profile) {
            err = new Error('fetch-user got empty auth response');
            return errback(err);
        }

        updateUser(user, resp);
        errback(null, user, resp);
    });
};

function validateCollection(collection) {
    var collectionOpts = ['siteId', 'articleId', 'network'];
    for (var i=0, numOpts=collectionOpts.length; i<numOpts; i++) {
        var optName = collectionOpts[i];
        if ( ! collection[optName]) {
            throw collectionOptError(optName, collection);
        }
    }
}

function collectionOptError(optName, collection) {
    var err = new Error("Missing Collection option "+optName);
    err.collection = collection;
    err.missingOption = optName;
    return err;
}
