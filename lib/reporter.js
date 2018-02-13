/**
 * @class {EventEmitter}
 */
const EventEmitter = require("events");
const JSONBuilder = require("JSONBuilder");

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
            this.jsonBuilder.addFeature(suite.cid, suite)
        });

        this.on('suite:end', (suite) => {
        });

        this.on('test:start', (test) => {
        });

        this.on('test:pass', (test) => {
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
