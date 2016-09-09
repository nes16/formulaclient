var config = require('./protractor.conf.js')
var userParams = require('./user2_params.js')
config.config.capabilities={
        'browserName': 'chrome',
        'chromeOptions':{
          'args':['--user-data-dir=~/.config/google-chrome2']
        }
    };
//config.config.capabilities['chromeOptions']['args']=['--user-data-dir=~/.config/google-chrome2']
config.config.params = userParams;
config.config.multiCapabilities = [];

exports.config = config.config;