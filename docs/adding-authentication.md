# AppKit Auth

Note: These documents are for Beta distribution only, and should not be considered finalized product. Please consult your Livefyre Technical Account Manager before implementing any functionality based on this documentation.



AppKit Auth provides a centralized authentication for all Livefyre Apps across your site. Add Livefyre.require to enable auth to your site's template, and allow it to cascade to all pages on the site, or add it once to each page. Once your users have signed in using your chosen  method, AppKit Auth will automatically broadcast authentication to all Apps on a page.


This section describes adding authentication to Livefyre Apps using Livefyre.require and Appkit Auth. The focus of this section is on the client side Javascript code. For more information on user tokens generated server side, please see Getting Started > [User Auth Token](/developers/getting-started/tokens/auth/) section. For information on syncing user profiles, please see Remote Profiles > [Ping for Pull](/developers/user-auth/remote-profiles/). 

## The Auth Package

Livefyre Apps use the global `auth` package to associate users with App actions. The `auth` package is available via [Livefyre.require](/beta-docs/livefyre-require/). 

To enable authentication on your page, first add Livefyre.js to the `<head>` element of your webpage, or to your website template.

```html
<script src="https://cdn.livefyre.com/Livefyre.js"></script>
```

Using Livefyre.require to enable auth is similar to using require to call other packages. The integration code to require auth looks like this:

```javascript
Livefyre.require(['auth'], function (auth) {
  // Do authy things...
});
```

## The Auth Delegate

The `auth` package doesn't do anything until it has been provided with a delegate. The auth delegate object implements authentication actions and events. This allows for a flexible and customizable integration with a page's existing authentication system.

An auth delegate should implement the following methods:

`.login(errback)` The delegate is responsible for logging in a valid user and invoking the errback function with either an `Error` object if there was an error, or the user's Livefyre credentials. 
This example automatically notifies `auth` of a Livefyre user with the User Token, 'token':

```javascript
authDelegate.login = function (errback) {
  errback(null, {
      livefyre: 'token'
  });
}
```

`.logout(errback)` The delegate is responsible for logging out a valid user and invoking the errback function with either an `Error` object if there was an error, or null to notify `auth` that the logout was succesfull.

For example:

```javascript
authDelegate.logout = function (errback) {
  errback(null);
}
```

`.viewProfile(user)` The delegate is responsible for taking action to view a user's profile.

```javascript
authDelegate.viewProfile = function (user) {
  window.open(user.profileUrl);
}
```

`.editProfile(user)` The delegate is responsible for taking action to edit a user's profile.

```javascript
authDelegate.editProfile = function (user) {
  window.open(user.editProfileUrl);
}
```

By implementing all of the methods listed above, `auth` can be configured with a custom auth delegate. Once a delegate has been constructed, it can be provided to `auth` using the `.delegate` method.

```javascript
var authDelegate = {
    login: ...
}

auth.delegate(authDelegate);
```

## Authentication

In most cases, once a user logs into your site, auth will authenticate them for all apps on the site. In some cases, such as during integration or testing, or if your site uses an unusual login flow, and the auth delegate is not invoked in such a way as to notify auth, use auth.authenticate and pass in a user token to authenticate users on the page.

Livefyre relies on user tokens to coordinate authentication. If an authenticated user token exists, you may use this token to authenticate the user for the page, without requiring that they log in.


Note: After a successful login, `auth` will create a session for the user, and it will try to load a user's session upon page refresh and reload. This means that it is not necessary to manage a user's session independently of `auth` unless there is a reason to do so.

For example:

```javascript
auth.authenticate({
  livefyre: 'token'
});
```


Some integrations may choose to use a different authentication method, and not use the auth delegate. In these cases, Livefyre recommends that you implement the `.forEachAuthentication` method on the delegate object. This method provides an inversion of control for authentication events.

```javascript
delegate.forEachAuthentication = function (authenticate) {
  window.addEventListener('userAuthenticated', function(data) {
    authenticate({livefyre: data.token});
  });
}
```

## Auth Delegate Packages

It may not be necessary to code an auth delegate from scratch. While the site integration may warrant a custom delegate, Livefyre.require makes available a few auth delegates for general use.

### Livefyre Enterprise Profiles

If you are a Livefyre Enterprise Profiles customer, use the LFEP Auth Delegate. 

```javascript
Livefyre.require(['auth', 'lfep-auth-delegate#0'], function (auth, LFEPDelegate) {
  var authDelegate = new LFEPAuthDelegate({
      engageOpts: {
          app: '{Your Janrain Engage App Name}'
      }
  });
  auth.delegate(authDelegate);
});
```

For more information, see Enterprise Profiles > [Creating the authDelegate] (/developers/user-auth/enterprise-profiles/#step-2-creating-the-authdelegate)


### Janrain Capture with Backplane

If you are using Backplane on your site, use a helper for `auth` integrations.

The auth delegate will vary for each integration.

```javascript
Livefyre.require(['auth', 'backplane-auth-handler#0'], function(auth, backplaneHandler) {
  backplaneHandler(auth, 'Livefyre server Url (if applicable)', 'articleId', 'siteId');
  auth.delegate(new Delegate());
});
```

For more information, see Janrain Capture > [Building the authDelegate Object] (/developers/user-auth/janrain-capture-backplane/#step-3-building-the-authdelegate-object)
