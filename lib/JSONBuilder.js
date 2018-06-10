class JSONBuilder {
  constructor() {
    this.features = [];
  }

  addFeature(options) {
    this.features.push({
      keyword: options.keyword,
      type: options.type,
      name: options.name,
      description: options.description,
      id: options.id,
      tags: options.tags,
      uri: options.uri,
      line: options.line,
      elements: [],
    });
  }


  addScenario(options) {
    const featureIndex = this.features.findIndex(feature => feature.id === options.parentId);
    const scenarioIndex = this.features[featureIndex].elements
      .findIndex(scenario => scenario.id === options.id);

    const scenarioData = {
      keyword: options.keyword,
      type: options.type,
      description: options.description,
      name: options.name,
      id: options.id,
      tags: options.tags,
      uri: options.uri,
      line: options.line,
      steps: [],
    };

    if (scenarioIndex === -1) {
      this.features[featureIndex].elements.push(scenarioData);
    }
  }

  addStep(options) {
    const featureIndex = this.features
      .findIndex(feature => feature.elements.find(scenario => scenario.id === options.parentId));

    const scenarioIndex = this
      .features[featureIndex]
      .elements.findIndex(scenario => scenario.id === options.parentId);

    const stepIndex = this
      .features[featureIndex]
      .elements[scenarioIndex]
      .steps.findIndex(step => step.id === options.id);

    const stepData = {
      keyword: options.keyword,
      line: options.line,
      name: options.name,
      id: options.id,
      tags: options.tags,
      uri: options.uri,
      result: options.result,
      embeddings: options.embeddings,
    };

    if (stepIndex === -1) {
      this.features[featureIndex].elements[scenarioIndex].steps.push(stepData);
    } else {
      this.features[featureIndex].elements[scenarioIndex].steps[stepIndex] = stepData;
    }
  }

  addHook(options) {
    const featureIndex = this.features
      .findIndex(feature => feature.elements.find(scenario => scenario.id === options.parentId));

    const scenarioIndex = this
      .features[featureIndex]
      .elements.findIndex(scenario => scenario.id === options.parentId);

    const stepData = {
      keyword: options.keyword,
      name: options.name,
      id: options.id,
      tags: options.tags,
      uri: options.uri,
      result: options.result,
      hidden: true,
      embeddings: options.embeddings.map(embedding => ({
        data: embedding.data,
        media: {
          type: embedding.mimeType,
        },
      })),
    };

    this.features[featureIndex].elements[scenarioIndex].steps.push(stepData);
  }

  clearEmptyFeatures() {
    this.features = this.features.filter(feature => feature.elements.length > 0);
  }
}

module.exports = JSONBuilder;
