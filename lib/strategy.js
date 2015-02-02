/**
 * Module dependencies.
 */
var util = require('util')
  , OAuth2Strategy = require('passport-oauth2')
  , InternalOAuthError = require('passport-oauth2').InternalOAuthError
  , Profile = require('./profile');

/**
 * Create a new Shopify `Strategy`.
 */
function Strategy(options, verify) {
  options = options || {};

  if (!options.myshopifyDomain) { throw new TypeError('Shopify Strategy requires a myshopifyDomain option'); }

  options.authorizationURL = options.authorizationURL || 'https://' + options.myshopifyDomain + '/admin/oauth/authorize';
  options.tokenURL = options.tokenURL || 'https://' + options.myshopifyDomain + '/admin/oauth/access_token';
  options.scopeSeparator = options.scopeSeparator || ',';
  options.customHeaders = options.customHeaders || {};

  OAuth2Strategy.call(this, options, verify);

  this.name = 'shopify';
  this._userProfileURL = options.userProfileURL || 'https://' + options.myshopifyDomain + '/admin/shop.json';
  this._customHeaders = options.customHeaders;
};

util.inherits(Strategy, OAuth2Strategy);

/**
 *
 */
Strategy.prototype.userProfile = function(accessToken, done) {
  this._customHeaders['X-Shopify-Access-Token'] = accessToken;

  this._oauth2.get(this._userProfileURL, null, function (err, body, res) {
    var json
      , profile;

    if (err) {
      return done(new InternalOAuthError('Failed to fetch shop metadata for user profile', err));
    }

    try {
      json = JSON.parse(body);
      profile = Profile.parse(json);
    } catch (e) {
      return done(e);
    }

    profile._raw = body;
    profile._json = json;

    done(null, profile);
  });
};

module.exports = Strategy;