// IONIC:
"use strict";
var ConfigMock = (function () {
    function ConfigMock() {
    }
    ConfigMock.prototype.get = function () {
        return '';
    };
    ConfigMock.prototype.getBoolean = function () {
        return true;
    };
    ConfigMock.prototype.getNumber = function () {
        return 1;
    };
    return ConfigMock;
}());
exports.ConfigMock = ConfigMock;
var NavMock = (function () {
    function NavMock() {
    }
    NavMock.prototype.pop = function () {
        return new Promise(function (resolve) {
            resolve();
        });
    };
    NavMock.prototype.push = function () {
        return new Promise(function (resolve) {
            resolve();
        });
    };
    NavMock.prototype.getActive = function () {
        return {
            'instance': {
                'model': 'something',
            },
        };
    };
    NavMock.prototype.setRoot = function () {
        return true;
    };
    return NavMock;
}());
exports.NavMock = NavMock;
var PlatformMock = (function () {
    function PlatformMock() {
    }
    PlatformMock.prototype.ready = function () {
        return new Promise(function (resolve) {
            resolve();
        });
    };
    return PlatformMock;
}());
exports.PlatformMock = PlatformMock;
