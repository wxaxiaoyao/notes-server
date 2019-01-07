
const _ = require("lodash");
const Controller = require("../core/controller.js");

const NotePackage = class extends Controller {
	get modelName() {
		return "notePackages";
	}
}

module.exports = NotePackage;
