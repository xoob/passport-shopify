/* global describe, it, before, beforeEach, after, afterEach, expect, chai */

var url = require('url')
  , fs = require('fs')
  , path = require('path')
  , ShopifyStrategy = require('..')
  , Profile = ShopifyStrategy.Profile
  , InternalOAuthError = require('passport-oauth2').InternalOAuthError;

describe('User Profile', function() {
  var strategy = new ShopifyStrategy({
    clientID: 'ABC123',
    clientSecret: 'secret',
    myshopifyDomain: 'passport-shopify.myshopify.com'
  }, (function(accessToken, refreshToken, profile, done) {
    done(null, { accessToken: accessToken, profile: profile });
  }));

  describe('#constructor', function() {
    it('should require an ID', function() {
      expect(function() {
        new Profile();
      }).to.throw(TypeError, /shop ID/);
    });
  });

  describe('loading the shop profile', function() {
    var profileReq
      , profile
      , err;

    before(function(done) {
      strategy._oauth2._executeRequest = function(http_library, options, post_body, callback) {
        profileReq = options;
        callback(null, fs.readFileSync(path.join(__dirname, 'fixtures', 'shop.json')).toString(), {});
      };

      strategy.userProfile('foobar', function(err_, profile_) {
        err = err_;
        profile = profile_;
        done();
      });
    });

    it('should fetch from the correct URL', function() {
      expect(profileReq.host).to.equal('passport-shopify.myshopify.com');
      expect(profileReq.path).to.equal('/admin/shop.json');
      expect(profileReq.method).to.equal('GET');
    });

    it('should set X-Shopify-Access-Token header', function() {
      expect(profileReq.headers).to.haveOwnProperty('X-Shopify-Access-Token');
      expect(profileReq.headers['X-Shopify-Access-Token']).to.equal('foobar');
    });

    it('should be a Profile instance', function() {
      expect(profile).to.be.instanceOf(ShopifyStrategy.Profile);
    });

    it('should set raw and json data', function() {
      expect(profile).to.haveOwnProperty('_raw');
      expect(profile._raw).to.be.a('string');

      expect(profile).to.haveOwnProperty('_json');
      expect(profile._json).to.be.an('object');
    });

    it('should set provider to shopify', function() {
      expect(profile.provider).to.equal('shopify');
    });

    it('should set profile information', function() {
      expect(profile.id).to.equal(690933842);
      expect(profile.displayName).to.equal('Apple Computers');
      expect(profile.domain).to.equal('shop.apple.com');
      expect(profile.myshopifyDomain).to.equal('apple.myshopify.com');
    });

    it('should set contact information', function() {
      expect(profile.emails).to.be.an('array');
      expect(profile.emails[0]).to.be.a('object');
      expect(profile.emails[0].value).to.equal('steve@apple.com');

      expect(profile.phoneNumbers).to.be.an('array');
      expect(profile.phoneNumbers[0]).to.be.a('object');
      expect(profile.phoneNumbers[0].value).to.equal('1231231234');
    });

    it('should set address information', function() {
      expect(profile.addresses).to.be.an('array');
      expect(profile.addresses[0]).to.be.a('object');

      var addr = profile.addresses[0];

      expect(addr.streetAddress).to.equal('1 Infinite Loop');
      expect(addr.locality).to.equal('Cupertino');
      expect(addr.postalCode).to.equal('95014');
      expect(addr.region).to.equal('California');
      expect(addr.country).to.equal('US');
    });
  });

  describe('handling a request error', function() {
    var profile
      , err;

    before(function(done) {
      strategy._oauth2._executeRequest = function(http_library, options, post_body, callback) {
        callback({ statusCode: 500, data: '{"foo":"bar"}' });
      };

      strategy.userProfile('foobar', function(err_, profile_) {
        err = err_;
        profile = profile_;
        done();
      });
    });

    it('should fail with error', function() {
      expect(err).to.be.instanceOf(InternalOAuthError);
      expect(err.message).to.have.equal('Failed to fetch shop metadata for user profile');
    });
  });

  describe('handling an invalid JSON response', function() {
    var profile
      , err;

    before(function(done) {
      strategy._oauth2._executeRequest = function(http_library, options, post_body, callback) {
        callback(null, '{gar "bage}', {});
      };

      strategy.userProfile('foobar', function(err_, profile_) {
        err = err_;
        profile = profile_;
        done();
      });
    });

    it('should fail with error', function() {
      expect(err).to.be.instanceOf(SyntaxError);
    });
  });
});