(JJ): Only step three of this page: http://docs.livefyre.com/beta-docs/appkit-auth-page-changes/janrain-capture-2/ needs to be altered.

# Step 3

Livefyre.require provides a handler that enables `auth` to listen to the Janrain Backplane bus.

```
Livefyre.require(['auth', 'backplane-auth-handler#0'], function(auth, backplaneHandler) {
  backplaneHandler(auth, 'Livefyre server Url (if applicable)', 'articleId', 'siteId');
});
```

Note: The Backplane object must be instantiated before invoking the handler mixon on the `auth` instance. To make sure the Backplane object is available, call the Livefyre instantiation code from a OnReady callback. Please consult your Janrain contact to determine when other applications may use the Backplane object
