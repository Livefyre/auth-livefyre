Livefyre.require([
  'http://livefyre-cdn-dev.s3.amazonaws.com/libs/livefyre-auth/v0.10.2/livefyre-auth.min.js'
], function(auth) {
  var del = {};
  del.login = function() {
    console.log("hello!");
  };
  del.forEachAuthentication = function(authenticate) {
    console.log("blah!");
    window.addEventListener('userAuthenticated', function() {
      console.log("holy moly!");
      authenticate({livefyre: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkb21haW4iOiJjbGllbnQtc29sdXRpb25zLmZ5cmUuY28iLCJleHBpcmVzIjoxNDU4ODYxNzY1LjE5NzU0MywidXNlcl9pZCI6IjUyOGJjNDkwMTA4MzU5MzQ5OTAwMWQxMyJ9.cb3wxXpqqGyK8x0s41GFOoHd_-QB7Tk5bYfIzlcnT8w"})
    });
  };
  del.logout = function(callback) {
    callback();
  };
  
  window.addEventListener('userLogOut', function() {
    auth.logout();
  });
  
  auth.delegate(del);
  
  auth.on('authenticate', function () {
    console.log('Called authenticate');
  });

  auth.on('authenticate.livefyre', function () {
    console.log('Called authenticate.livefyre');
  });

  auth.on('login', function (d) {
    console('logged in:', JSON.stringify(d));
  });

  Livefyre.auth = auth;

  loadWall();
});

fyre.conv.load({
  network: 'client-solutions.fyre.co',
  env: 'prod'
}, [{
  app: 'main',
  siteId: '375782',
  articleId: 'custom-1447718337022',
  el: 'livefyre-app-custom-1447718337022',

}], function(widget) {
  // Initialize or Auth
});

function loadWall() {

  Livefyre.require([
    'http://livefyre-cdn-dev.s3.amazonaws.com/libs/streamhub-wall/v3.10.0/streamhub-wall.min.js'
  ], function(MediaWall) {    
    var wall = window.wall = new MediaWall({
      el: document.getElementById("wall"),
      collection: {
        "network": "client-solutions.fyre.co",
        "siteId": "375782",
        "articleId": "custom-1447718337022"
      },
      postButton: MediaWall.postButtons.content
    });
  });

}
