class JSONBuilder {

    constructor() {
        this.features = [];
    }

    addFeature(id, options) {
        this.features.push({
            keyword: "Feature",
            name: options.name,
            id: id,
            tags: options.tags,
            uri: options.uri,
            elements: []
        })
    }

}

module.exports = JSONBuilder;