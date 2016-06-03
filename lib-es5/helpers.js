"use strict";

var helpers = {
    merge: function merge(dest, src) {
        for (var prop in src) {
            dest[prop] = src[prop];
        }
        return dest;
    }
};

module.exports = helpers;