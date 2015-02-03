/**
 * `Profile` is a Passport user profile containing Shopify shop metadata.
 */
function Profile(id) {
  if (!id) { throw new TypeError('Missing required shop ID'); }
  this.id = id;
};

Profile.prototype.provider = 'shopify';

/**
 * Create a `Profile` instance from API response data.
 *
 * @param {Object} shop The parsed response data.
 * @returns {Profile} A new profile populated from the response data.
 *
 * @see {@link http://passportjs.org/guide/profile/}
 * @see {@link http://portablecontacts.net/draft-spec.html#schema}
 * @see {@link http://docs.shopify.com/api/shop}
 *
 * @api private
 */
Profile.parse = function(shop) {
  if (shop.shop) {
    shop = shop.shop;
  }

  var profile = new Profile(shop.id);

  profile.displayName = shop.name;
  profile.domain = shop.domain;
  profile.myshopifyDomain = shop.myshopify_domain;

  profile.emails = [{ value: shop.email }];
  profile.phoneNumbers = [{ value: shop.phone }];

  profile.addresses = [{
    streetAddress: shop.address1,
    locality: shop.city,
    postalCode: shop.zip,
    region: shop.province,
    country: shop.country
  }];

  return profile;
};

module.exports = Profile;