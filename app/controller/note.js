
const _ = require("lodash");
const Controller = require("../core/controller.js");

const Note = class extends Controller {
	get modelName() {
		return "notes";
	}
}

module.exports = Note;
