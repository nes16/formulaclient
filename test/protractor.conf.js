exports.config = {
    baseUrl: 'http://10.0.2.15:8100',

    specs: [
        '../www/build/test/**/*.e2e.js'
    ],

    exclude: [],

    framework: 'jasmine2',

    allScriptsTimeout: 110000,

    jasmineNodeOpts: {
        showTiming: true,
        showColors: true,
        isVerbose: false,
        includeStackTrace: false,
        defaultTimeoutInterval: 400000
    },

    directConnect: true,

    capabilities: {
        'browserName': 'chrome'
    },

    multiCapabilities: [{
      'browserName': 'chrome',
      'chromeOptions': {
          'args': ['--user-data-dir=~/.config/google-chrome1']
        }
    }, {
      'browserName': 'chrome',
      'chromeOptions': {
          'args': ['--user-data-dir=~/.config/google-chrome2']
        }
    }],

    getMultiCapabilities1: function() {
    var deferred = q.defer();

    var multiCapabilities = [
        {
            browserName: "chrome",
            specs: [
                "*.spec.js"
            ],

            exclude: [
                "footer.disabledJavascript.spec.js"
            ]
        }
    ];

    // Wait for a server to be ready or get capabilities asynchronously.
    setTimeout(function() {
        var options = new chrome.Options().
        options
        var firefoxProfile = new FirefoxProfile();
        firefoxProfile.setPreference("javascript.enabled", false);
        firefoxProfile.encoded(function (encodedProfile) {
            var capabilities = {
                "browserName": "chrome",
                "firefox_profile": encodedProfile,
                "specs": [
                    "footer.disabledJavascript.spec.js"
                ]
            };
            multiCapabilities.push(capabilities);
            deferred.resolve(multiCapabilities);
        });
    }, 1000);

    return deferred.promise;
  },

    onPrepare: function() {
        var SpecReporter = require('jasmine-spec-reporter');
        // add jasmine spec reporter
        jasmine.getEnv().addReporter(new SpecReporter({displayStacktrace: true}));


        browser.ignoreSynchronization = false;
    },


    /**
     * Angular 2 configuration
     *
     * useAllAngular2AppRoots: tells Protractor to wait for any angular2 apps on the page instead of just the one matching
     * `rootEl`
     *
     */
    useAllAngular2AppRoots: true
};
