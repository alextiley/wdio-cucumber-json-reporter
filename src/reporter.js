/**
 * @class {EventEmitter}
 */
const EventEmitter = require('events');
const JSONBuilder = require('./JSONBuilder');
const mkdirp = require('mkdirp');
const fs = require('fs');
const path = require('path');
const Gherkin = require('gherkin');
const jsdiff = require('diff');

class CucumberJSONReporter extends EventEmitter {

  constructor(baseReporter, config, options = {}) {
    super();

    this.baseReporter = baseReporter;
    this.config = config;
    this.options = options;
    this.cachedFeatures = {};
    this.cachedScenarios = {};
    this.reportIdentifier = 0;
    this.jsonBuilder = new JSONBuilder();

    /**
     * Once all tests completed, iterate over reports and generate multiple JSON reports
     */
    this.on('end', () => {

      if (!this.options || typeof this.options.outputDir !== 'string') {
        console.log('Cannot write json report: empty or invalid "outputDir".');
        return;
      }

      try {
        const dir = path.resolve(this.options.outputDir);

        mkdirp.sync(dir);

        this.jsonBuilder.clearEmptyFeatures();

        Object.keys(this.jsonBuilder.reports).forEach((cid) => {
          const report = this.jsonBuilder.reports[cid];
          const filename = (this.reportIdentifier === 0 ? 'report' : `report_${this.reportIdentifier}`) + '.json';
          const filepath = path.join(dir, filename);

          fs.writeFileSync(filepath, JSON.stringify(report.features));

          if (this.options.cucumberJsonReporter && this.options.cucumberJsonReporter.verbose === true) {
            console.log(`Wrote json report '${filename}' to [${this.options.outputDir}].`);
          }
          this.reportIdentifier += 1;
        });
      } catch (e) {
        console.log(`Failed to write json report to [${this.options.outputDir}]. Error: ${e}`);
      }
    });

    /**
     * Decorate features with meta data whenever a feature finishes
     */
    this.on('suite:end', (suite) => {
      // Feature
      if (suite.parent === null) {
        this.jsonBuilder.addMeta({
          cid: suite.cid,
          browser: suite.runner[suite.cid].browserName,
          deviceName: this.options.cucumberJsonReporter && this.options.cucumberJsonReporter.deviceName
            ? this.options.cucumberJsonReporter.deviceName
            : 'Local test environment'
        });
      // Scenario
      } else {
        this.jsonBuilder.appendScenarioArgumentsToTitle({
          cid: suite.cid,
          id: suite.uid,
          parentId: suite.parent
        });
      }
    });

    this.on('suite:start', (test) => {
      if (test.parent) {
        const scenario = this.getScenario(test.file, test.title);

        this.jsonBuilder.addScenario({
          cid: test.cid,
          type: 'scenario',
          keyword: scenario.keyword,
          description: scenario.description,
          line: scenario.location.line,
          name: scenario.name,
          id: test.uid,
          parentId: test.parent,
          tags: test.tags,
          uri: test.file,
        });
      } else {
        const feature = this.getFeature(test.file);

        this.jsonBuilder.addFeature({
          cid: test.cid,
          type: 'feature',
          keyword: feature.keyword,
          name: feature.name,
          id: test.uid,
          tags: test.tags,
          uri: test.file,
          line: feature.location.line,
          description: feature.description,
        });
      }
    });

    this.on('test:pass', (test) => {

      const step = this.getStepByLineNumber(test.file, this.getLineNumberFromUid(test.uid));

      if (step === null) {
        return;
      }

      const stepData = {
        cid: test.cid,
        type: 'step',
        name: test.title,
        id: test.uid,
        tags: test.tags,
        uri: test.file,
        parentId: test.parent,
        keyword: step.keyword,
        arguments: this.getArgumentsFromStep(step.text, test.title),
        line: this.getLineNumberFromUid(test.uid),
        result: {
          status: 'passed',
          duration: test.duration * 1000000,
        },
        embeddings: []
      };

      if (stepData.keyword === 'After' || stepData.keyword === 'Before') {
        this.jsonBuilder.addHook(stepData);
      } else {
        this.jsonBuilder.addStep(stepData);
      }
    });

    this.on('test:fail', (test) => {

      const step = this.getStepByLineNumber(test.file, this.getLineNumberFromUid(test.uid));

      if (step === null) {
        return;
      }

      const stepData = {
        cid: test.cid,
        type: 'step',
        name: test.title,
        id: test.uid,
        tags: test.tags,
        uri: test.file,
        parentId: test.parent,
        keyword: step.keyword,
        arguments: this.getArgumentsFromStep(step.text, test.title),
        line: this.getLineNumberFromUid(test.uid),
        result: {
          status: 'failed',
          duration: test.duration * 1000000,
        },
        embeddings: [],
      };

      if (test.err.stack) {
        stepData.result.error_message = test.err.stack;
      } else {
        stepData.result.error_message = test.err.message;
      }

      if (stepData.keyword === 'After' || stepData.keyword === 'Before') {
        this.jsonBuilder.addHook(stepData);
      } else {
        this.jsonBuilder.addStep(stepData);
      }
    });

    this.on('test:pending', (test) => {

      const step = this.getStepByLineNumber(test.file, this.getLineNumberFromUid(test.uid));

      if (step === null) {
        return;
      }

      const isPending = this.hasUndefinedStepMessage(test.title);
      const runnerTitle = this.removeUndefinedStepFromTitle(test.title);

      const stepData = {
        cid: test.cid,
        type: 'step',
        name: runnerTitle,
        id: test.uid,
        tags: test.tags,
        uri: test.file,
        parentId: test.parent,
        keyword: step.keyword,
        arguments: this.getArgumentsFromStep(step.text, runnerTitle),
        line: this.getLineNumberFromUid(test.uid),
        result: {
          status: isPending ? 'pending' : 'skipped',
          duration: test.duration * 1000000,
        },
        embeddings: [],
      };

      if (stepData.keyword === 'After' || stepData.keyword === 'Before') {
        this.jsonBuilder.addHook(stepData);
      } else {
        this.jsonBuilder.addStep(stepData);
      }
    });
  }

  /**
   * Determines whether a spec title indicates where it is undefined or not
   * wdio spec.title contains " (undefined step)" if not implemented.
   * @param title
   * @returns {boolean}
   */
  hasUndefinedStepMessage(title) {
    return (title.trim().indexOf(' (undefined step)') > -1);
  }

  removeUndefinedStepFromTitle(title) {
    return title.trim().replace(/\s\(undefined\sstep\)$/, '');
  }

  /**
   * Parses a gherkin feature file and transforms to JSON
   * @param filePath - the path to the gherkin .feature file
   * @returns {number|*}
   */
  parseFeature(filePath) {
    const featurePath = path.join(process.cwd(), filePath);
    const featureText = fs.readFileSync(featurePath).toString();

    const parser = new Gherkin.Parser(new Gherkin.AstBuilder());
    const scanner = new Gherkin.TokenScanner(featureText);
    const matcher = new Gherkin.TokenMatcher();

    return parser.parse(scanner, matcher);
  }

  /**
   * Given a gherkin file path and scenario text, finds the scenario within the
   * .feature file and obtains the scenario's meta data
   *
   * @param filePath - the path to the gherkin .feature file
   * @param scenarioTextFromRunner - the scenario text, as reported from wdio
   * @returns {*}
   */
  getScenario(filePath, scenarioTextFromRunner) {
    const scenarioCacheKey = `${filePath}_${scenarioTextFromRunner}`;

    if (typeof this.cachedScenarios[scenarioCacheKey] !== 'undefined') {
      return this.cachedScenarios[scenarioCacheKey];
    }
    const document = this.parseFeature(filePath);

    const scenario = document.feature.children.find((scenario) => {
      return (scenarioTextFromRunner === scenario.name);
    }) || {};

    // Cache the feature as we already have it at this point
    this.cachedFeatures[filePath] = document.feature;
    this.cachedScenarios[scenarioCacheKey] = scenario;

    return scenario;
  }

  /**
   * Given a gherkin file path, finds the feature within the .feature file
   * and returns the feature's meta data
   *
   * @param filePath - the path to the gherkin .feature file
   * @returns {*}
   */
  getFeature(filePath) {
    if (typeof this.cachedFeatures[filePath] !== 'undefined') {
      return this.cachedFeatures[filePath];
    }
    const document = this.parseFeature(filePath);

    this.cachedFeatures[filePath] = document.feature;

    return document.feature;
  }

  /**
   * Given a gherkin file path and line number, finds the step from the relevant
   * .feature file and returns the step's meta data.
   *
   * @param filePath
   * @param line
   * @returns {{}}
   */
  getStepByLineNumber(filePath, line) {
    let ret = null;
    const feature = this.getFeature(filePath);
    const BreakException = {};

    // Exit early
    try {
      feature.children.forEach((scenario) => {
        scenario.steps.forEach((step) => {
          if (step.location.line === line) {
            ret = step;
            throw BreakException;
          }
        });
      });
    } catch (e) {
      if (e !== BreakException) throw e;
    }

    return ret;
  }

  /**
   * The UID returned from wdio contains the step's line number from the .feature file
   * This helper will extract it from the UID string
   * @param uid
   * @returns {number}
   */
  getLineNumberFromUid(uid) {
    let line = uid.match(/\d+$/);

    if (line === null || !Array.isArray(line) || isNaN(Number(line[0]))) {
      return -1;
    }
    return Number(line);
  }

  getArgumentsFromStep(definitionName, testRunnerName) {
    let args = [];
    try {
      definitionName = definitionName.replace(/[<>]+/g, '');

      args = jsdiff.diffWords(definitionName, testRunnerName)
        .filter(diff => (diff.added === true))
        .map(diff => diff.value);
    } catch (e) {}

    return args;
  }
}

CucumberJSONReporter.reporterName = 'json-cucumber';

module.exports = CucumberJSONReporter;
