var config = require('./protractor.conf.js')
var userParams = require('./user1_params.js')

config.config.capabilities = {
        'browserName': 'chrome',
        'chromeOptions':{
          'args':['--user-data-dir=~/.config/google-chrome1']
        }
    };

config.config.params = userParams;
config.config.multiCapabilities = [];

exports.config = config.config;