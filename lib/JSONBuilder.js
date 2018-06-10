"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var JSONBuilder = function () {
  function JSONBuilder() {
    _classCallCheck(this, JSONBuilder);

    this.features = [];
  }

  _createClass(JSONBuilder, [{
    key: "addFeature",
    value: function addFeature(options) {
      this.features.push({
        keyword: options.keyword,
        type: options.type,
        name: options.name,
        description: options.description,
        id: options.id,
        tags: options.tags,
        uri: options.uri,
        line: options.line,
        elements: []
      });
    }
  }, {
    key: "addScenario",
    value: function addScenario(options) {
      var featureIndex = this.features.findIndex(function (feature) {
        return feature.id === options.parentId;
      });
      var scenarioIndex = this.features[featureIndex].elements.findIndex(function (scenario) {
        return scenario.id === options.id;
      });

      var scenarioData = {
        keyword: options.keyword,
        type: options.type,
        description: options.description,
        name: options.name,
        id: options.id,
        tags: options.tags,
        uri: options.uri,
        line: options.line,
        steps: []
      };

      if (scenarioIndex === -1) {
        this.features[featureIndex].elements.push(scenarioData);
      }
    }
  }, {
    key: "addStep",
    value: function addStep(options) {
      var featureIndex = this.features.findIndex(function (feature) {
        return feature.elements.find(function (scenario) {
          return scenario.id === options.parentId;
        });
      });

      var scenarioIndex = this.features[featureIndex].elements.findIndex(function (scenario) {
        return scenario.id === options.parentId;
      });

      var stepIndex = this.features[featureIndex].elements[scenarioIndex].steps.findIndex(function (step) {
        return step.id === options.id;
      });

      var stepData = {
        keyword: options.keyword,
        line: options.line,
        name: options.name,
        id: options.id,
        tags: options.tags,
        uri: options.uri,
        result: options.result,
        embeddings: options.embeddings
      };

      if (stepIndex === -1) {
        this.features[featureIndex].elements[scenarioIndex].steps.push(stepData);
      } else {
        this.features[featureIndex].elements[scenarioIndex].steps[stepIndex] = stepData;
      }
    }
  }, {
    key: "addHook",
    value: function addHook(options) {
      var featureIndex = this.features.findIndex(function (feature) {
        return feature.elements.find(function (scenario) {
          return scenario.id === options.parentId;
        });
      });

      var scenarioIndex = this.features[featureIndex].elements.findIndex(function (scenario) {
        return scenario.id === options.parentId;
      });

      var stepData = {
        keyword: options.keyword,
        name: options.name,
        id: options.id,
        tags: options.tags,
        uri: options.uri,
        result: options.result,
        hidden: true,
        embeddings: options.embeddings.map(function (embedding) {
          return {
            data: embedding.data,
            media: {
              type: embedding.mimeType
            }
          };
        })
      };

      this.features[featureIndex].elements[scenarioIndex].steps.push(stepData);
    }
  }, {
    key: "clearEmptyFeatures",
    value: function clearEmptyFeatures() {
      this.features = this.features.filter(function (feature) {
        return feature.elements.length > 0;
      });
    }
  }]);

  return JSONBuilder;
}();

module.exports = JSONBuilder;