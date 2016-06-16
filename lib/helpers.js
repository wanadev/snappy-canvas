"use strict";

var helpers = {

    merge(dest, src) {
        for (let prop in src) {
            dest[prop] = src[prop];
        }
        return dest;
    },

    clone(obj) {
        return JSON.parse(JSON.stringify(obj));
    }

};

module.exports = helpers;
