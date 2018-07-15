# wdio-cucumber-json-reporter
Generates a JSON report for cucumber via webdriver.io

## About this repo ##

This is a fork of the work previously done by [AlexGalichenko](https://github.com/AlexGalichenko/wdio-cucumber-json-reporter)

I have adapted and added missing properties to the JSON report. It's quite rough around the edges and could definitely do with a tidy up, along with some defensive coding and tests! It was thrown together quickly in order to get nice reporting working via [multiple-cucumber-html-reporter](https://github.com/wswebcreation/multiple-cucumber-html-reporter)

## Usage ##

1. To install, run `yarn add wdio-json-cucumber-reporter` or `npm install wdio-json-cucumber-reporter`
2. Add `json-cucumber` to the list of reporters in `wdio.conf.js` (see below).
3. Run your tests
4. Added bonus: `yarn add multiple-cucumber-html-reporter` and follow their readme to create a beautiful HTML report.

#### wdio.conf.js ####
```javascript
{
  ...
  reporters: ['json-cucumber'],
  ...
  reporterOptions: {
    outputDir: 'some/output/dir',
    cucumberJsonReporter: {
      verbose: true, // true|false - set to true for verbose logging
      deviceName: 'Local test environment' // Meta data for multiple-cucumber-html-reporter
    }
  }
  ...
}
```

## Bug reporting ##

Feel free to raise a pull request, or throw me a ticket via the issues section.

## Known issues / missing features ##

* Add support for screenshots via cucumber attachments
* Add browser version to feature metadata, if obtainable
* Add metadata for test start time, end time and total duration
* Add metadata for feature count, scenario/scenario outline counts and step counts
* Add metadata for failing test count
* Save report file names based on browser name and timestamp
* Retrieve arguments supplied to each step