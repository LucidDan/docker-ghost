// Test server.js

process.env.GHOST_PUBLIC_URL = 'https://localhost/';
process.env.MYSQL_DATABASE_URL = 'mysql://user:foo@localhost:3306/localhost';
process.env.GHOST_MAIL_FROM = 'foo@foo.com';
process.env.GHOST_MAIL_USER = 'foo@foo.com';
process.env.GHOST_MAIL_PASSWORD = 'sekret';
process.env.GHOST_STORAGE_ADAPTER = 'digitalocean';
process.env.GHOST_STORAGE_DO_KEY = 'digitalocean';
process.env.GHOST_STORAGE_DO_SECRET = 'digitalocean';
process.env.GHOST_STORAGE_DO_BUCKET = 'digitalocean';
process.env.GHOST_STORAGE_DO_REGION = 'digitalocean';

var server = require('../server.js');
var assert = require('assert');

describe('Array', function() {
  describe('makeDbConfigFromUrl()', function() {
    it('should return an object', function() {
      assert.equal(server.makeDbConfigFromUrl(), {});
    });
  });
});

