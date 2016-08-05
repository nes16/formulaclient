"use strict";
var core_1 = require('@angular/core');
var testing_1 = require('@angular/compiler/testing');
var testing_2 = require('@angular/core/testing');
var common_1 = require('@angular/common');
var ionic_angular_1 = require('ionic-angular');
var mocks_1 = require('./mocks');
var utils_1 = require('../app/services/utils');
var testUtils_1 = require('./testUtils');
exports.TestUtils = testUtils_1.TestUtils;
exports.providers = [
    ionic_angular_1.Form,
    core_1.provide(ionic_angular_1.Config, { useClass: mocks_1.ConfigMock }),
    core_1.provide(ionic_angular_1.App, { useClass: mocks_1.ConfigMock }),
    core_1.provide(ionic_angular_1.NavController, { useClass: mocks_1.NavMock }),
    core_1.provide(ionic_angular_1.Platform, { useClass: mocks_1.ConfigMock }),
];
exports.injectAsyncWrapper = (function (callback) { return testing_2.injectAsync([testing_1.TestComponentBuilder], callback); });
exports.asyncCallbackFactory = (function (component, testSpec, detectChanges, beforeEachFn) {
    return (function (tcb) {
        return tcb.createAsync(component)
            .then(function (fixture) {
            testSpec.fixture = fixture;
            testSpec.instance = fixture.componentInstance;
            testSpec.instance.control = new common_1.Control('');
            if (detectChanges)
                fixture.detectChanges();
            if (beforeEachFn)
                beforeEachFn(testSpec);
        })
            .catch(utils_1.Utils.promiseCatchHandler);
    });
});
