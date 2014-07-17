var auth = require('auth');
var authAdapters = require('livefyre-auth/auth-adapters');
var expect = require('chai').expect;
var sinon = require('sinon');
var MockUserFactory = require('livefyre-auth-tests/mocks/mock-user-factory');
var mockUserFactory = new MockUserFactory();

function getMockOldDelegate() {
    return {
        login: function() {},
        logout: function() {},
        viewProfile: function() {},
        editProfile: function() {},
        loginByCookie: function() {}
    };
}

function getMockBetaDelegate() {
    return {
        login: function() {},
        logout: function() {},
        viewProfile: function() {},
        editProfile: function() {},
        restoreSession: function() {},
        serverUrl: 'serve this'
    };
}

function stubFyreUser() {
    return {
        conv: {
            user: {
                on: function () {},
                off: function () {},
                get: function () {}
            },
            initializeGlobalServices: function () {},
            ready: {
                trigger: function () {},
                hasFired: function () {}
            }
        }
    };
}

function stubLivefyreUser() {
    return {
        user: mockUserFactory.createUser()
    };
}

describe('annotations/adapters/auth-delegates', function() {
    it('whether this is an old delegate', function() {
        // Stub window.fyre
        window.fyre = stubFyreUser();

        var oldDelegate = getMockOldDelegate();
        var isOld = authAdapters.isOld(oldDelegate);

        expect(isOld).to.be.true;

        var newDelegate = getMockOldDelegate();
        delete newDelegate.loginByCookie;
        isOld = authAdapters.isOld(newDelegate);

        expect(isOld).to.be.false;

        // Without fyre defined, should fail.
        window.fyre = undefined;

        isOld = authAdapters.isOld(oldDelegate);
        expect(isOld).to.be.false;
    });

    it('whether this is a beta delegate', function () {
        var betaDelegate = getMockBetaDelegate();
        window.Livefyre = stubLivefyreUser();

        var isOld = authAdapters.isOld(betaDelegate);

        expect(isOld).to.be.true;
        window.Livefyre = null;
    });

    describe('converts beta style delegate to new style', function() {
        var betaDelegate;
        beforeEach(function() {
            betaDelegate = getMockBetaDelegate();
            window.Livefyre = stubLivefyreUser();
        });

        afterEach(function() {
            betaDelegate = null;
            window.Livefyre= undefined;
        });

        it('invokes old delegate login method correcly', function() {
            var loginSpy = sinon.spy(betaDelegate, 'login');
            authAdapters.oldToNew(betaDelegate);

            auth.login();
            expect(loginSpy).to.be.calledOnce;
        });

        it('authenticates with the correct collection and auth endpoint', function() {
            var cb;
            window.Livefyre.user.once = function (ev, callback) {
                cb = callback;
            };
            authAdapters.oldToNew(betaDelegate, 123, 456);
            var remoteLoginSpy = sinon.spy(auth, 'authenticate');
            auth.login();
            cb({
                token:{
                    value: 'tokenator'
                }
            });

            expect(remoteLoginSpy).to.be.calledOnce;
            var spyData = remoteLoginSpy.getCall(0).args[0];
            expect(spyData.livefyre.token).to.equal('tokenator');
            expect(spyData.livefyre.articleId).to.equal(123);
            expect(spyData.livefyre.siteId).to.equal(456);
            expect(spyData.livefyre.serverUrl).to.equal(betaDelegate.serverUrl) ;

            remoteLoginSpy.restore();
        });

        it('invokes old delegate logout method correcly', function() {
            var logoutSpy = sinon.spy(betaDelegate, 'logout');
            authAdapters.oldToNew(betaDelegate);

            auth.logout();
            expect(logoutSpy).to.be.calledOnce;
        });

        it('invokes old delegate login callback correcly', function() {
            var onceSpy = sinon.spy(window.Livefyre.user, 'once');
            authAdapters.oldToNew(betaDelegate);

            auth.login();
            expect(onceSpy).to.be.calledOnce;
            expect(onceSpy.calledWith('login')).to.be.true;
        });

        it('invokes old delegate logout callback correcly', function() {
            var onceSpy = sinon.spy(window.Livefyre.user, 'once');
            authAdapters.oldToNew(betaDelegate);

            auth.logout();
            expect(onceSpy).to.be.calledOnce;
            expect(onceSpy.calledWith('logout')).to.be.true;
        });

        it('invokes old delegate viewProfile correctly', function() {
            var viewProfileSpy = sinon.spy(betaDelegate, 'viewProfile');
            authAdapters.oldToNew(betaDelegate);

            auth.viewProfile();
            expect(viewProfileSpy).to.be.calledOnce;
        });

        it('invokes old delegate editProfile correctly', function() {
            var editProfileSpy = sinon.spy(betaDelegate, 'editProfile');
            authAdapters.oldToNew(betaDelegate);

            auth.editProfile();
            expect(editProfileSpy).to.be.calledOnce;
        });
    });

    describe('delegates to beta delegates', function () {
        var betaDelegate = getMockBetaDelegate();
        window.Livefyre = stubLivefyreUser();

        var delegateStub = sinon.stub(auth, 'delegate');

        authAdapters.oldToNew(betaDelegate);
        expect(delegateStub).to.be.calledOnce;
        delegateStub.restore();
    });

    describe('converts old style delegate to new style', function() {
        var oldDelegate;
        beforeEach(function() {
            oldDelegate = getMockOldDelegate();
            window.fyre = stubFyreUser();
            window.Livefyre = stubLivefyreUser();
        });

        afterEach(function() {
            oldDelegate = null;
            window.fyre= undefined;
            window.Livefyre = undefined;
        });

        it('has the correct interface', function() {
            window.fyre = null;
            // no fyre.conv, no change
            expect(oldDelegate.login).to.be.a('function');
            expect(oldDelegate.logout).to.be.a('function');
            expect(oldDelegate.viewProfile).to.be.a('function');
            expect(oldDelegate.editProfile).to.be.a('function');
            expect(oldDelegate.loginByCookie).to.be.a('function');

            // Stub window.fyre
            window.fyre = stubFyreUser();

            var initSpy = sinon.spy(window.fyre.conv, 'initializeGlobalServices');
            var readySpy = sinon.spy(window.fyre.conv.ready, 'trigger');
            authAdapters.oldToNew(oldDelegate);
            expect(oldDelegate.login).to.be.a('function');
            expect(oldDelegate.logout).to.be.a('function');
            expect(oldDelegate.viewProfile).to.be.a('function');
            expect(oldDelegate.editProfile).to.be.a('function');

            expect(initSpy).to.be.called;
            expect(readySpy).to.be.called;
        });

        it('invokes old delegate login method correcly', function() {
            var loginSpy = sinon.spy(oldDelegate, 'login');
            authAdapters.oldToNew(oldDelegate);

            auth.login();
            expect(loginSpy).to.be.calledOnce;
            expect(loginSpy.getCall(0).args.length).to.equal(1);
            expect(loginSpy.getCall(0).args[0].success).to.be.a('function');
            expect(loginSpy.getCall(0).args[0].failure).to.be.a('function');
        });

        it('invokes old delegate logout method correcly', function() {
            var logoutSpy = sinon.spy(oldDelegate, 'logout');
            authAdapters.oldToNew(oldDelegate);

            auth.logout();
            expect(logoutSpy).to.be.calledOnce;
        });

        it('invokes old delegate viewProfile correctly', function() {
            var viewProfileSpy = sinon.spy(oldDelegate, 'viewProfile');
            authAdapters.oldToNew(oldDelegate);

            auth.viewProfile(123);
            expect(viewProfileSpy).to.be.calledOnce;
            expect(viewProfileSpy.getCall(0).args.length).to.equal(2);
            expect(viewProfileSpy.getCall(0).args[0].success).to.be.a('function');
            expect(viewProfileSpy.getCall(0).args[0].failure).to.be.a('function');
            expect(viewProfileSpy.getCall(0).args[1]).to.equal(123);
        });

        it('invokes old delegate editProfile correctly', function() {
            var editProfileSpy = sinon.spy(oldDelegate, 'editProfile');
            authAdapters.oldToNew(oldDelegate);

            auth.editProfile(123);
            expect(editProfileSpy).to.be.calledOnce;
            expect(editProfileSpy.getCall(0).args.length).to.equal(2);
            expect(editProfileSpy.getCall(0).args[0].success).to.be.a('function');
            expect(editProfileSpy.getCall(0).args[0].failure).to.be.a('function');
            expect(editProfileSpy.getCall(0).args[1]).to.equal(123);
        });

        it('invokes old delegate loginByCookie correctly', function() {
            var loginByCookieSpy = sinon.spy(oldDelegate, 'loginByCookie');
            authAdapters.oldToNew(oldDelegate);

            expect(loginByCookieSpy).to.be.calledOnce;
            expect(loginByCookieSpy.getCall(0).args.length).to.equal(0);
        });

        it('binds to old delegate user token changes', function() {
            var fyreOnSpy = sinon.spy(window.fyre.conv.user, 'on');
            var fyreOffSpy = sinon.spy(window.fyre.conv.user, 'off');
            authAdapters.oldToNew(oldDelegate);

            expect(fyreOnSpy).to.be.calledOnce;
            expect(fyreOnSpy.getCall(0).args[0]).to.equal('change:token');
            fyreOnSpy.restore();
            fyreOffSpy.restore();
        });

        it('handles old delegate user token changes', function() {
            var cb;
            window.fyre.conv.user.on = function (ev, callback) {
                cb = callback;
            };
            authAdapters.oldToNew(oldDelegate, 123, 456, 'test.fyre.co');
            var remoteLoginSpy = sinon.spy(auth, 'authenticate');
            cb({}, 'tokenator');

            expect(remoteLoginSpy).to.be.calledOnce;
            var spyData = remoteLoginSpy.getCall(0).args[0];
            expect(spyData.livefyre.token).to.equal('tokenator');

            var logoutSpy = sinon.spy(auth, 'logout');
            cb(null);

            expect(logoutSpy).to.be.calledOnce;
            remoteLoginSpy.restore();
            logoutSpy.restore();
        });

        it('authenticates with the correct collection and auth endpoint', function() {
            var cb;
            window.fyre.conv.user.on = function (ev, callback) {
                cb = callback;
            };
            authAdapters.oldToNew(oldDelegate, 123, 456, 'test.fyre.co');
            var remoteLoginSpy = sinon.spy(auth, 'authenticate');
            cb({}, 'tokenator');

            expect(remoteLoginSpy).to.be.calledOnce;
            var spyData = remoteLoginSpy.getCall(0).args[0];
            expect(spyData.livefyre.token).to.equal('tokenator');
            expect(spyData.livefyre.articleId).to.equal(123);
            expect(spyData.livefyre.siteId).to.equal(456);
            expect(spyData.livefyre.serverUrl.indexOf('admin.test.fyre.co') > -1).to.be.true;

            remoteLoginSpy.restore();
        });

        it('authenticates with the correct collection and auth endpoint, with env', function() {
            var cb;
            window.fyre.conv.user.on = function (ev, callback) {
                cb = callback;
            };
            authAdapters.oldToNew(oldDelegate, 123, 456, 'test.fyre.co', 'qa.fyre.co');
            var remoteLoginSpy = sinon.spy(auth, 'authenticate');
            cb({}, 'tokenator');

            expect(remoteLoginSpy).to.be.calledOnce;
            var spyData = remoteLoginSpy.getCall(0).args[0];
            expect(spyData.livefyre.token).to.equal('tokenator');
            expect(spyData.livefyre.articleId).to.equal(123);
            expect(spyData.livefyre.siteId).to.equal(456);
            expect(spyData.livefyre.serverUrl.indexOf('admin.qa.fyre.co') > -1).to.be.true;

            remoteLoginSpy.restore();
        });
    });
});
