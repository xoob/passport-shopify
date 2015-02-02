function Profile(id) {
  if (!id) { throw new TypeError('Missing required shop ID'); }
  this.id = id;
};

Profile.prototype.provider = 'shopify';

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