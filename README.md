# wdio-cucumber-json-reporter
Generates a JSON report for cucumber via webdriver.io

## About this repo ##

This is a fork of the work previously done by [AlexGalichenko](https://github.com/AlexGalichenko/wdio-cucumber-json-reporter)

I have adapted and added missing properties to the JSON report. It's quite rough around the edges and could definitely do with a tidy up, along with some defensive coding and tests! It was thrown together quickly in order to get nice reporting working via [multiple-cucumber-html-reporter](https://github.com/wswebcreation/multiple-cucumber-html-reporter)

## Usage ##

1. To install, run `yarn add wdio-json-cucumber-reporter` or `npm install wdio-json-cucumber-reporter`
2. Add `json-cucumber` to the list of reporters in `wdio.conf.js` (see below).
3. Run your tests
4. Added bonus: `yarn add multiple-cucumber-html-reporter` and adapt the example config below.

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

## Integrating with multiple-cucumber-html-reporter

This repository was originally created so that I could integrate my work project with `multiple-cucumber-html-reporter`. Here's an example of how to get it working.

As long as the JSON reports are generated, you can then add something like the below to your `wdio.conf.js` onComplete hook. Make sure you set the paths correctly.

```javascript
  ...
  onComplete: () => {
    if (existsSync('./some/output/dir/report.json')) {
      htmlReporter.generate({
        pageTitle: `My report page title`,
        reportName: `Cucumber test report`,
        disableLog: true,
        jsonDir: './some/output/dir/',
        reportPath: './some/output/dir/'
      });
    }
  },
  ...
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