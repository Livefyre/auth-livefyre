# Enterprise Profiles (LFEP)

Learn to use Livefyre's all-in-one user management system

---

If you purchased Livefyre Enterprise Profiles, use these steps to use it on your webpages using AppKit Auth so that Livefyre Apps can easily take advantage of your auth integration.

If you are using another Identity Management System, whether from another provider or a homegrown solution, checkout the [User Authentication](http://docs.livefyre.com/developers/user-auth/) index. If you think Livefyre Enterprise Profiles may be a good fit for your community, contact your Livefyre Account Manager.

---

## Step 0: Add Livefyre.js

If you have never done so, add Livefyre.js to the `<head>` element of your webpage or website template. Livefyre.js is a small base library that other Livefyre components make use of. Most importantly, it provides a global `window.Livefyre` variable to your pages, and `Livefyre.require`, which can be used to load other Livefyre packages on demand.

```html
<script src="https://cdn.livefyre.com/Livefyre.js"></script>
```

## Step 1: Add customprofile.js

Add the Livefyre Enterprise Profiles JavaScript library, which is a  file specific to your installation that ends with `customprofile.js`. Add it to the `<head>` element of your HTML document, for example:

```html
<script src="https://client-solutions.ep.livefyre.com/media/Y2xpZW50LXNvbHV0aW9ucy5lcC5saXZlZnlyZS5jb20=/javascripts/customprofiles.js"></script>
```

**Note**: Contact your Livefyre Technical Account Manager to acquire your specific `customprofile.js` URL.

## Step 2: Register an LFEP Auth Delegate with AppKit Auth

AppKit Auth is Livefyre's Framework for making sure that all the social components on your page can discover a single auth integration. AppKit Auth needs to be provided an 'auth delegate object' that knows how to perform authentication actions like login, logout, and more.

In order to tell AppKit Auth to delegate these actions to LFEP, add the following to your webpage after Livefyre.js:

```
Livefyre.require(['auth', 'lfep-auth-delegate#0'],
function (auth, LFEPAuthDelegate) {
    // create an LFEP Auth Delegate
    var authDelegate = new LFEPAuthDelegate({
        engageOpts: {
            app: '{Your Janrain Engage App Name}'
        }
    });
    // Delegate AppKit Auth actions to LFEP
    auth.delegate(authDelegate);
});
```

**Note**: LFEP creates a Janrain Engage App on your behalf that allows visitors on your site to use social authentication to sign in and interact with content. `{Your Janrain Engage App Name}` will be provided to you by your Livefyre Technical Account Manager.

## Step 3: Add Social Networks

In order to take advantage of social login from providers like Twitter, Facebook, and more, you must add your social network app keys through the Janrain Dashboard. Once this configuration is complete, you can add them to your sign-in form.

![Janrain Dashboard Screenshot](https://livefyre-devhub.s3.amazonaws.com/media/filer_public_thumbnails/filer_public/ab/28/ab28a146-13dc-479a-a8b6-5aceeb980767/janraindashboard.png__350x314_q85_subsampling-2.jpg?Signature=cw6g%2Fm%2FimM7dvdqBgT7%2FJ7WlKqk%3D&Expires=1470476469&AWSAccessKeyId=AKIAJMT5HHUE4C2VVNAA)

1. Go to the Providers area in the [Janrain Engage Dashboard](https://dashboard.janrain.com).
2. Click on the gear button for each social network to enter the app credentials for that provider. The gray gears will turn gree once the corresponding social network has been sufficiently configured.
3. When you've completed configuring a social network, go to "Widgets & SDKs" -> "Sign-ins", then add your configured providers to the modal.
