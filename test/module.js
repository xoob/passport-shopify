/* global describe, it, before, beforeEach, after, afterEach, expect, chai */

var ShopifyStrategy = require('..');

describe('Module', function() {
  it('should export public interfaces', function() {
    expect(ShopifyStrategy).to.be.a('function');
    expect(ShopifyStrategy.Strategy).to.be.a('function');
    expect(ShopifyStrategy).to.equal(ShopifyStrategy.Strategy);
    expect(ShopifyStrategy.Profile).to.be.a('function');
  });
});