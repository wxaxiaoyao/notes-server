
const _ = require("lodash");
const Controller = require("../core/controller.js");

const KnowledgePackage = class extends Controller {
	get modelName() {
		return "KnowledgePackages";
	}
}

module.exports = KnowledgePackage;
