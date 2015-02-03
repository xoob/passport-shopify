/**
 * Module dependencies.
 */
var Strategy = require('./strategy')
  , Profile = require('./profile');

/**
 * Library version.
 */
exports.version = require('../package.json').version;

/**
 * Expose `Strategy` directly from package.
 */
exports = module.exports = Strategy;

/*
 * Expose constructors.
 */
exports.Strategy = Strategy;
exports.Profile = Profile;