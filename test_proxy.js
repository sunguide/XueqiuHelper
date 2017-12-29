'use strict';
var request = require('superagent');

// extend with Request#proxy()
require('superagent-proxy')(request);

// HTTP, HTTPS, or SOCKS proxy to use
var proxy = process.env.http_proxy || 'http://183.157.169.104:8080';

request
  .get('http://ifconfig.me/ip.json')
  .proxy(proxy)
  .end(onresponse);

function onresponse (err, res) {
  if (err) {
    console.log(err);
  } else {
    console.log(res.status, res.headers);
    console.log(res.text);
  }
}
