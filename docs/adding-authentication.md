# AppKit Auth

Note: These documents are for Beta distribution only, and should not be considered finalized product. Please consult your Livefyre Technical Account Manager before implementing any functionality based on this documentation.

This section demonstrates how to add authentication to Livefyre Apps using Livefyre.require and Appkit Auth. The focus of this section is on the client side Javascript code. For documentation detailing user tokens generated server side one may refer to the [User Auth Token](/developers/getting-started/tokens/auth/) section. For documentation detailing syncing user profiles one may refer to the [Ping for Pull](TODO(jj): Ping for Pull URL) section. 

## The Auth Package

Livefyre Apps use the global `auth` package to associate users with App actions. The `auth` package is available via [Livefyre.require](/beta-docs/livefyre-require/). If you haven't done so already, add Livefyre.js to the `<head>` element of your webpage or website template.

```
<script src="https://cdn.livefyre.com/Livefyre.js"></script>
```

The integration code to require auth looks like this:

```
Livefyre.require(['auth'], function (auth) {
  // Do authy things...
});
```

## The Auth Delegate

The `auth` package doesn't do anything until it has been provided with a delegate. The Auth Delegate is the object that implements authentication actions and events. This allows for a flexible and customizable integration with a page's existing authentication system.

An auth delegate should implement the following methods:

`.login(errback)` The delegate is responsible for logging in a valid user and invoking the errback function with either an `Error` object if there was an error, or the user's livefyre credentials. Here is a simple login function that automatically notifies `auth` of a Livefyre user with the User Token, 'token':

```
authDelegate.login = function (errback) {
  errback(null, {
      livefyre: 'token'
  });
}
```

`.logout(errback)` The delegate is responsible for logging out a valid user and invoking the errback function with either an `Error` object if there was an error, or null to notify `auth` that the logout was succesfull.

```
authDelegate.logout = function (errback) {
  errback(null);
}
```

`.viewProfile(user)` The delegate is responsible for taking action to view a user's profile.

```
authDelegate.viewProfile = function (user) {
  window.open(user.profileUrl);
}
```

`.editProfile(user)` The delegate is responsible for taking action to edit a user's profile.

```
authDelegate.editProfile = function (user) {
  window.open(user.editProfileUrl);
}
```

By implementing all of the methods listed above `auth` can be configured with a custom auth delegate. Once a delegate has been constructed, it can be provided to `auth` using the `.delegate` method.

```
var authDelegate = {
    login: ...
}

auth.delegate(authDelegate);
```

## Authentication

For Livefyre, authentication is coordinated by way of User Tokens. On page load, the user may already have authentication credentials without needing to log in again. In this case the integration code should call `.authenticate`.

Note: After a successful login `auth` will create a session for the user, and it will try to load a user's session upon page refresh and reload. This means that it is not necessary to manage a user's session independantly of `auth` unless there is a reason to do so.

```
auth.authenticate({
  livefyre: 'token'
});
```

Additionally, the integration code may log in users without explicitly invoking the auth delegate. In this case it is advisable to implement the `.forEachAuthentication` method on the delegate object. This method provides an inversion of control for authentication events.

```
delegate.forEachAuthentication = function (authenticate) {
  window.addEventListener('userAuthenticated', function(data) {
    authenticate({livefyre: data.token});
  });
}
```

## Auth Delegate Packages

It may not be necessary to code an auth delegate from scratch. While the site integration may warrant a custom delegate, Livefyre.require makes available a few auth delegates for general use.

### Livefyre.com

A Livefyre.com auth delegate can be instantiated using the `auth.createDelegate` method. Supply the Livefyre server URL that will be used for authentication. This will configure auth to be controlled by Livefyre.com accounts and profiles. (Note: Livefyre Enterprise customers will rarely use this method.)

```
var livefyreAuthDelegate = auth.createDelegate('http://livefyre.com');
auth.delegate(livefyreAuthDelegate);

// This will launch a Livefyre.com login window
auth.login();
```

### Livefyre Enterprise Profiles

If you purchased Livefyre Enterprise Profiles (formerly known as Livefyre Custom Profiles, LFCP) then you can make use of the LFEP Auth Delegate. 

```
Livefyre.require(['auth', 'lfep-auth-delegate#0'], function (auth, LFEPDelegate) {
  var authDelegate = new LFEPAuthDelegate({
      engageOpts: {
          app: '{Your Janrain Engage App Name}'
      }
  });
  auth.delegate(authDelegate);
});
```

Follow [these steps](TODO(JJ): URL) for a complete integration guide.


### Janrain Capture with Backplane

If you are using Backplane on your site then you can make use of a helper for `auth` integrations.

The auth delegate will vary for each integration.

```
Livefyre.require(['auth', 'backplane-auth-handler#0'], function(auth, backplaneHandler) {
  backplaneHandler(auth, 'Livefyre server Url (if applicable)', 'articleId', 'siteId');
  auth.delegate(new Delegate());
});
```

Follow [these steps](TODO(JJ): URL) for a complete integration guide.
