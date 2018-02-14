/**
 * @class {EventEmitter}
 */
const EventEmitter = require("events");
const JSONBuilder = require("./JSONBuilder");

const LOGGING_HOOKS = ['"before all" hook', '"after all" hook'];

class CucumberJSONReporter extends EventEmitter {
    constructor (baseReporter, config, options = {}) {
        super();

        this.baseReporter = baseReporter;
        this.config = config;
        this.options = options;
        this.allures = {};

        const { epilogue } = this.baseReporter;

        this.jsonBuilder = new JSONBuilder();

        this.on('end', () => {
            epilogue.call(baseReporter)
        });

        this.on('suite:start', (suite) => {
            // console.log(suite);
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
            // console.log(test);
        });

        this.on('test:pass', (test) => {
            // console.log(test);
        });

        this.on('test:fail', (test) => {
        });

        this.on('test:pending', (test) => {
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
