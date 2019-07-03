// Test server.js

process.env.GHOST_PUBLIC_URL = 'https://localhost/';
process.env.MYSQL_DATABASE_URL = 'mysql://testuser:testpass@localhost:3306/db';
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
      var dbdata = server.makeDbConfigFromUrl('mysql://testuser:testpass@localhost:3306/db');
      assert.equal(dbdata.host, 'localhost');
      assert.equal(dbdata.port, '3306');
      assert.equal(dbdata.user, 'testuser');
      assert.equal(dbdata.password, 'testpass');
      assert.equal(dbdata.database, 'db');
    });
  });
});

