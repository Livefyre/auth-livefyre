'use strict';

var authApi = require('./auth-api');
var CollectionAuthorization = require('./collection-authorization');

var permissions = module.exports = {};

permissions._authApi = authApi;

/**
 * Fetch a user's permissions for a Livefyre Collection
 * @param tokenOrUser {string|object} token or user you want permissions for
 * @param collection.network {string} Network of Collection
 * @param collection.siteId {string} Site ID of Collection
 * @param collection.articleId {string} Article ID of Collection
 * @throws Error if you didn't pass all required Collection info
 */
permissions.forCollection = function (tokenOrUser, collection, errback) {
    validateCollection(collection);
    var user;
    var opts = Object.create(collection);
    if (typeof tokenOrUser === 'string') {
        opts.token = tokenOrUser;
        user = new LivefyreUser();
    } else {
        opts.token = tokenOrUser.get('token');
        user = tokenOrUser;
    }

    var updateUser = this._authApi.updateUser.bind(this._authApi);
    this._authApi.authenticate(opts, function (err, userInfo) {
        if (err) {
            return errback(err);
        }
        // bad, duplicated from user-service
        if ( ! userInfo.profile) {
            err = new Error('fetch-user got empty auth response');
            return errback(err);
        }

        updateUser(user, userInfo);
        errback(null, user, userInfo);
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
