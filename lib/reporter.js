/**
 * @class {EventEmitter}
 */
const EventEmitter = require("events");
const JSONBuilder = require("./JSONBuilder");
const mkdirp = require("mkdirp");
const fs = require("fs");
const path = require("path");

class CucumberJSONReporter extends EventEmitter {
    constructor(baseReporter, config, options = {}) {
        super();

        this.baseReporter = baseReporter;
        this.config = config;
        this.options = options;

        this.jsonBuilder = new JSONBuilder();

        this.on('end', () => {
            if (!this.options || typeof this.options.outputDir !== 'string') {
                return console.log(`Cannot write json report: empty or invalid 'outputDir'.`)
            }

            try {
                const dir = path.resolve(this.options.outputDir);
                const filename = "report.json";
                const filepath = path.join(dir, filename);
                mkdirp.sync(dir);
                this.jsonBuilder.clearEmptyFeatures();
                fs.writeFileSync(filepath, JSON.stringify(this.jsonBuilder.features));
                console.log(`Wrote json report to [${this.options.outputDir}].`)
            } catch (e) {
                console.log(`Failed to write json report to [${this.options.outputDir}]. Error: ${e}`)
            }
        });

        this.on('suite:start', (suite) => {
            if (suite.parent) {
                this.jsonBuilder.addScenario({
                    name: suite.title,
                    id: suite.uid,
                    parentId: suite.parent,
                    tags: suite.tags.map(tag => tag.name),
                    uri: suite.file
                })
            } else {
                this.jsonBuilder.addFeature({
                    name: suite.title,
                    id: suite.uid,
                    tags: suite.tags.map(tag => tag.name),
                    uri: suite.file
                })
            }
        });

        this.on('suite:end', (suite) => {
        });

        this.on('test:start', (test) => {
        });

        this.on('test:pass', (test) => {
            const stepData = {
                name: test.title,
                id: test.uid,
                tags: test.tags.map(tag => tag.name),
                uri: test.file,
                parentId: test.parent,
                keyword: test.keyword,
                result: {
                    status: "passed"
                },
                embeddings: test.embeddings
            };

            if (stepData.keyword === "After" || stepData.keyword === "Before") {
                this.jsonBuilder.addHook(stepData)
            } else {
                this.jsonBuilder.addStep(stepData)
            }

        });

        this.on('test:fail', (test) => {
            const stepData = {
                name: test.title,
                id: test.uid,
                tags: test.tags.map(tag => tag.name),
                uri: test.file,
                parentId: test.parent,
                keyword: test.keyword,
                result: {
                    status: "failed"
                },
                embeddings: test.embeddings
            };

            if (test.err.stack) {
                stepData.result.error_message = test.err.stack
            }

            if (stepData.keyword === "After" || stepData.keyword === "Before") {
                this.jsonBuilder.addHook(stepData)
            } else {
                this.jsonBuilder.addStep(stepData)
            }
        });

        this.on('test:pending', (test) => {
            const stepData = {
                name: test.title,
                id: test.uid,
                tags: test.tags.map(tag => tag.name),
                uri: test.file,
                parentId: test.parent,
                keyword: test.keyword,
                result: {
                    status: "skipped"
                },
                embeddings: test.embeddings
            };

            if (stepData.keyword === "After" || stepData.keyword === "Before") {
                this.jsonBuilder.addHook(stepData)
            } else {
                this.jsonBuilder.addStep(stepData)
            }
        });

        this.on('runner:command', (command) => {
        });

        this.on('runner:result', (command) => {
        });

        this.on('hook:start', (hook) => {
        });

        this.on('hook:end', (hook) => {
        });
    }
}

module.exports = CucumberJSONReporter;