/* global describe, it, before, beforeEach, after, afterEach, expect, chai */

var url = require('url')
  , ShopifyStrategy = require('..')
  , AuthorizationError = require('passport-oauth2').AuthorizationError;

describe('Shopify Strategy', function() {
  var strategy = new ShopifyStrategy({
    clientID: 'ABC123',
    clientSecret: 'secret',
    myshopifyDomain: 'passport-shopify.myshopify.com',
    skipUserProfile: true
  }, (function(accessToken, refreshToken, profile, done) {
    done(null, { accessToken: accessToken, profile: profile });
  }));

  describe('#constructor', function() {
    it('should require a myshopifyDomain option', function() {
      expect(function() {
        new ShopifyStrategy({
          clientID: 'ABC123',
          clientSecret: 'secret'
        });
      }).to.throw(TypeError, /myshopifyDomain/);
    });

    it('should set #name to shopify', function() {
      expect(strategy.name).to.eq('shopify');
    });
  });

  describe('redirecting for authentication', function() {
    var redirectURL;

    before(function(done) {
      chai.passport.use(strategy)
      .redirect(function(url_) {
        redirectURL = url.parse(url_, true);
        done();
      })
      .authenticate({
        scope: ['foo', 'baz', 'bar']
      });
    });

    it('should redirect to the correct URL', function() {
      expect(redirectURL.protocol).to.equal('https:');
      expect(redirectURL.hostname).to.equal('passport-shopify.myshopify.com');
      expect(redirectURL.pathname).to.equal('/admin/oauth/authorize');
    });

    it('should use comma as the scope separator', function() {
        expect(redirectURL.query.scope).to.equal('foo,baz,bar');
    });
  });

  describe('handling a success callback', function() {
    var tokenURL
      , user;

    before(function(done) {
      strategy._oauth2.getOAuthAccessToken = function(code, options, callback) {
        tokenURL = url.parse(this._accessTokenUrl, true);
        callback(null, 'foobar', null, { 'access_token': 'foobar' });
      };

      chai.passport.use(strategy)
      .success(function(user_, info_) {
        user = user_;
        done();
      })
      .req(function(req) {
        req.query = {
          code: 'abcdef',
          hmac: '123456',
          shop: 'passport-shopify.myshopify.com',
          signature: '123456',
          timestamp: '123456789012'
        };
      })
      .authenticate();
    });

    it('should request access token from the correct URL', function() {
      expect(tokenURL.protocol).to.equal('https:');
      expect(tokenURL.hostname).to.equal('passport-shopify.myshopify.com');
      expect(tokenURL.pathname).to.equal('/admin/oauth/access_token');
    });
  });

  describe('handling a standard error callback', function() {
    var err;

    before(function(done) {
      chai.passport.use(strategy)
      .error(function(err_) {
        err = err_;
        done();
      })
      .req(function(req) {
        req.query = {
          error: 'invalid_scope',
          hmac: '123456',
          shop: 'passport-shopify.myshopify.com',
          signature: '123456',
          timestamp: '123456789012'
        };
      })
      .authenticate();
    });

    it('should fail with an error', function() {
      expect(err).to.instanceOf(AuthorizationError);
    });
  });
});