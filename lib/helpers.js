"use strict";

var helpers = {

    merge(dest, src) {
        for (let prop in src) {
            dest[prop] = src[prop];
        }
        return dest;
    }

};

module.exports = helpers;
