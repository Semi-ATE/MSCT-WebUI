// Karma configuration file, see link for more information
// https://karma-runner.github.io/1.0/config/configuration-file.html

module.exports = function (config) {
  config.set({
    basePath: '',
    frameworks: ['jasmine', '@angular-devkit/build-angular', 'viewport'],
    plugins: [
      require('karma-jasmine'),
      require('karma-chrome-launcher'),
      require('karma-jasmine-html-reporter'),
      require('karma-viewport'),
      require('karma-coverage'),
      require('@angular-devkit/build-angular/plugins/karma')
    ],
    client: {
      jasmine: {
        // you can add configuration options for Jasmine here
        // the possible options are listed at https://jasmine.github.io/api/edge/Configuration.html
        // for example, you can disable the random execution with `random: false`
        // or set a specific seed with `seed: 4321`
      },
      clearContext: false // leave Jasmine Spec Runner output visible in browser
    },
    jasmineHtmlReporter: {
      suppressAll: true // removes the duplicated traces
    },
    reporters: ['progress', 'kjhtml'],
    coverageReporter: {
      dir: '.coverage/',
      subdir: '.',
      reproters: [
        { type: 'html' },
        { type: 'text-summary' }
      ],
      check: {
        global: {
          statements: 85,
          branches: 85,
          functions: 85,
          lines: 85,
        }
      }
    },
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true,
    browsers: ['Chrome'],
    singleRun: false,
    restartOnFileChange: true,
    customLaunchers: {
      ChromeDebug: {
        base: 'Chrome',
        flags: [ '--remote-debugging-port=9333' ]
      },
      ChromeCi: {
        base: 'ChromeHeadless',
        flags: [ '--no-sandbox' ]
      }
    }
  });
};
