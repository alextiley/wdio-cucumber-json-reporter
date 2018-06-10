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
      baseDir: __dirname // Should be your project's root directory, used to determine where your feature files are stored
    }
  }
}
```

`3`. Run your tests

`4`. Added bonus: `yarn add multiple-cucumber-html-reporter` and follow their readme to create a beautiful HTML report.

## Bug reporting ##

Feel free to raise a pull request, or throw me a ticket via the issues section.
