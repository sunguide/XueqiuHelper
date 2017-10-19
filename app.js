'use strict';
const cache = require("./app/libs/cache.js");
module.exports = app => {
    app.cache = cache;
};
