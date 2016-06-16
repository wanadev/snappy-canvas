"use strict";

var helpers = {
    merge: function merge(dest, src) {
        for (var prop in src) {
            dest[prop] = src[prop];
        }
        return dest;
    },
    clone: function clone(obj) {
        return JSON.parse(JSON.stringify(obj));
    }
};

module.exports = helpers;