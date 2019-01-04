
const _ = require("lodash");
const Controller = require("../core/controller.js");

const KnowledgeArea = class extends Controller {
	get modelName() {
		return "KnowledgeAreas";
	}
}

module.exports = KnowledgeArea;
