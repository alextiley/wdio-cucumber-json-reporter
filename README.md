# wdio-cucumber-json-reporter
Cucumber JSON reporter

## About this repo ##

This is a fork of the work previously done by [AlexGalichenko](https://github.com/AlexGalichenko/wdio-cucumber-json-reporter)

I have adapted and added missing properties to the JSON report. It's quite rough around the edges and could definitely do with a tidy up, along with some defensive coding! It was thrown together quickly in order to get nice reporting working via [multiple-cucumber-html-reporter](https://github.com/wswebcreation/multiple-cucumber-html-reporter)

## Usage ##
`1`. `yarn add wdio-json-cucumber-reporter` or `npm install wdio-json-cucumber-reporter`

`2`. Add 'json-cucumber' to the list of reporters in `wdio.conf.js` and add the following configuration:

```javascript
{
  reporterOptions: {
    outputDir: 'some/output/dir',
    cucumberJsonReporter: {
      silent: true, // true|false - supresses message notifying of report output
      baseDir: __dirname, // Should be your project's root directory, used to determine where your feature files are stored
      deviceName: 'Local test environment' // Meta data for multiple-cucumber-html-reporter
    }
  }
}
```

`3`. Run your tests

`4`. Added bonus: `yarn add multiple-cucumber-html-reporter` and follow their readme to create a beautiful HTML report.

## Bug reporting ##

Feel free to raise a pull request, or throw me a ticket via the issues section.

## Known issues / missing features ##

* Add support for screenshots via cucumber attachments/"embeddings"
* Add browser name to feature metadata
* Add metadata for test start time, end time and total duration
* Add metadata for feature count, scenario/scenario outline counts and step counts
* Add metadata for failing test count
* Step duration and line number is experimental - It's nigh on impossible to fetch the correct step data if the step contains a variable
* Svme report file names based on browser name and timestamp