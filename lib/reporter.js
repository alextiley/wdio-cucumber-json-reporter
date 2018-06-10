/**
 * @class {EventEmitter}
 */
const EventEmitter = require('events');
const JSONBuilder = require('./JSONBuilder');
const mkdirp = require('mkdirp');
const fs = require('fs');
const path = require('path');
const Gherkin = require('gherkin');

class CucumberJSONReporter extends EventEmitter {
  constructor(baseReporter, config, options = {}) {
    super();

    if (
      typeof options.cucumberJsonReporter === 'undefined' ||
      typeof options.cucumberJsonReporter.baseDir === 'undefined'
    ) {
      console.log('Cannot write json report: missing reporters.cucumberJsonReporter.baseDir in webdriver.io config file.');
      return;
    }

    this.baseReporter = baseReporter;
    this.config = config;
    this.options = options;

    this.jsonBuilder = new JSONBuilder();

    this.on('end', () => {
      if (!this.options || typeof this.options.outputDir !== 'string') {
        console.log('Cannot write json report: empty or invalid \'outputDir\'.');
        return;
      }

      try {
        const dir = path.resolve(this.options.outputDir);
        const filename = 'report.json';
        const filepath = path.join(dir, filename);
        mkdirp.sync(dir);
        this.jsonBuilder.clearEmptyFeatures();
        fs.writeFileSync(filepath, JSON.stringify(this.jsonBuilder.features));
        if (this.options.cucumberJsonReporter.silent !== true) {
          console.log(`Wrote json report to [${this.options.outputDir}].`);
        }
      } catch (e) {
        console.log(`Failed to write json report to [${this.options.outputDir}]. Error: ${e}`);
      }
    });

    this.on('suite:start', (test) => {
      const document = this.parseFeature(test.file);

      if (test.parent) {
        let scenario = {};

        document.feature.children.forEach((sc) => {
          if (test.title === sc.name) {
            scenario = sc;
          }
        });

        this.jsonBuilder.addScenario({
          type: 'scenario',
          keyword: scenario.keyword,
          description: scenario.description
            ? scenario.description
            : document.feature.description,
          line: scenario.location.line,
          name: scenario.name,
          id: test.uid,
          parentId: test.parent,
          tags: test.tags,
          uri: test.file,
        });
      } else {
        this.jsonBuilder.addFeature({
          type: 'feature',
          keyword: document.feature.keyword,
          name: document.feature.name,
          id: test.uid,
          tags: test.tags,
          uri: test.file,
          line: document.feature.location.line,
          description: document.feature.description,
        });
      }
    });

    this.on('test:pass', (test) => {
      let step = {};

      const document = this.parseFeature(test.file);

      document.feature.children.forEach((sc) => {
        sc.steps.forEach((st) => {
          const stepTextWithoutArgs = st.text.replace(/<\w+>.*/g, '').trim();
          if (test.title.indexOf(stepTextWithoutArgs) !== -1) {
            step = st;
          }
        });
      });

      const stepData = {
        type: 'step',
        name: test.title,
        id: test.uid,
        tags: test.tags,
        uri: test.file,
        parentId: test.parent,
        keyword: step.keyword ? step.keyword.trim() : test.keyword,
        line: step.location ? step.location.line : 1,
        result: {
          status: 'passed',
          duration: test.duration * 1000000,
        },
      };

      if (stepData.keyword === 'After' || stepData.keyword === 'Before') {
        this.jsonBuilder.addHook(stepData);
      } else {
        this.jsonBuilder.addStep(stepData);
      }
    });

    this.on('test:fail', (test) => {
      let step = {};

      const document = this.parseFeature(test.file);

      document.feature.children.forEach((sc) => {
        sc.steps.forEach((st) => {
          const stepTextWithoutArgs = st.text.replace(/<\w+>.*/g, '').trim();
          if (test.title.indexOf(stepTextWithoutArgs) !== -1) {
            step = st;
          }
        });
      });

      const stepData = {
        type: 'step',
        name: test.title,
        id: test.uid,
        tags: test.tags,
        uri: test.file,
        parentId: test.parent,
        keyword: step.keyword ? step.keyword.trim() : test.keyword,
        line: step.location ? step.location.line : 1,
        result: {
          status: 'failed',
          duration: test.duration * 1000000,
        },
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
      let step = {};

      const document = this.parseFeature(test.file);

      document.feature.children.forEach((sc) => {
        sc.steps.forEach((st) => {
          const stepTextWithoutArgs = st.text.replace(/<\w+>.*/g, '').trim();
          if (test.title.indexOf(stepTextWithoutArgs) !== -1) {
            step = st;
          }
        });
      });

      const stepData = {
        type: 'step',
        name: test.title,
        id: test.uid,
        tags: test.tags,
        uri: test.file,
        parentId: test.parent,
        keyword: step.keyword ? step.keyword.trim() : test.keyword,
        line: step.location ? step.location.line : 1,
        result: {
          status: 'skipped',
          duration: test.duration * 1000000,
        },
      };

      if (stepData.keyword === 'After' || stepData.keyword === 'Before') {
        this.jsonBuilder.addHook(stepData);
      } else {
        this.jsonBuilder.addStep(stepData);
      }
    });
  }

  parseFeature(filePath) {
    const featurePath = path.join(this.options.cucumberJsonReporter.baseDir, filePath);
    const featureText = fs.readFileSync(featurePath).toString();

    const parser = new Gherkin.Parser(new Gherkin.AstBuilder());
    const scanner = new Gherkin.TokenScanner(featureText);
    const matcher = new Gherkin.TokenMatcher();

    return parser.parse(scanner, matcher);
  }
}

CucumberJSONReporter.reporterName = 'cucumber-json-reporter';

module.exports = CucumberJSONReporter;