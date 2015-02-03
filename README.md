# passport-shopify

[Shopify]() authentication strategy using OAuth 2.0 for [Passport](http://passportjs.org/) and Node.js.

## Install

    $ npm install passport-shopify

## Usage

The Shopify authentication strategy authenticates Shopify account holders, usually shop owners, using OAuth 2.0 tokens.The resulting access token can be used to access the [Shopify REST API](http://docs.shopify.com/api).

#### Prerequisites

 - [A Shopify Partner account](http://docs.shopify.com/api/introduction/getting-started#shopify-partner-and-create-dev-shop)
 - [A public Shopify app](http://docs.shopify.com/api/introduction/getting-started#create-app)
 - [An API Key and Shared Secret](http://docs.shopify.com/api/authentication/oauth#get-the-client-redentials)

#### Configuration


    passport.use(new ShopifyStrategy({
        clientID: SHOPIFY_APP_ID,
        clientSecret: SHOPIFY_APP_SECRET,
        myshopifyDomain: SHOPIFY_SHOP_DOMAIN,
        callbackURL: "http://localhost:3000/auth/shopify/callback"
      },
      function(accessToken, refreshToken, profile, done) {
        Shop.findOrCreate({ shopId: profile.id, accessToken: accessToken },
          function (err, shop) {
            return done(err, shop);
          });
      }
    ));

The `verify` callback for Shopify authentication accepts three arguments:

 - `accessToken` - `{string}` - This is a permanent API access token that can be used to access the shop’s data as long as the client is installed. Clients should store the token somewhere to make authenticated requests for a shop’s data.
 - `refreshToken` - `{null}` - This argument is always undefined, since the access token is permanent and Shopify does not use refresh tokens.
 - `profile` - `{object}` - Detailed shop information provided by Shopify; refer to [User Profile]() for additional information.


Note: For security reasons, the callback URL must reside on the same host that is registered with Shopify.

#### Routes

Two routes are required for Shopify authentication. The first route redirects the user to Shopify. The second route is the URL to which Shopify will redirect the user after they have logged in.

    app.get('/auth/shopify',
      passport.authenticate('shopify'));

    app.get('/auth/shopify/callback',
      passport.authenticate('shopify', { failureRedirect: '/login' }),
      function(req, res) {
        // Successful authentication, redirect home.
        res.redirect('/');
      });

Note that the URL of the callback route matches that of the `callbackURL` option specified when configuring the strategy.

#### Permissions

To specify which parts of a shop's data you would like to access, Shopify provides a [list of possible access scopes](http://docs.shopify.com/api/authentication/oauth#scopes) you can request via the `scope` option to `passport.authenticate()`.

    app.get('/auth/shopify',
      passport.authenticate('shopify', { scope: ['read_products', 'write_products'] }));

## Examples

For a complete, working example, refer to the [login example](https://github.com/jaredhanson/passport-facebook/tree/master/examples/login).

## Tests

    $ npm install
    $ npm test

## License

[The MIT License](http://opensource.org/licenses/MIT)

Copyright (c) 2015 Alexander Brausewetter