'use strict';

// had enabled by egg
// exports.static = true;
exports.nunjucks = {
  enable: true,
  package: 'egg-view-nunjucks',
};

exports.mongoose = {
  enable: false,
  package: 'egg-mongoose',
};
