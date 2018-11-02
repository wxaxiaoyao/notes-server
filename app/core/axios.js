const _ = require("lodash");
const axios = require("axios");


const methods= [
	"get",
	"post",
	"put",
	"delete",
	"head",
	"options",
	"patch",
];

const mockAxios = {
	datas: {
		GET:{},
		POST:{},
		PUT:{},
		DELETE:{},
		HEAD:{},
		OPTIONS:{},
		PATCH:{},
	},

	getCacheData(url, method="GET") {
		method = method.toUpperCase();
		return this.datas[method][url];
	}
}

mockAxios.getCacheData = function(url, method="GET") {
	method = method.toUpperCase();
	return this.datas[method][url];
}

mockAxios.request = async function(config){
	const data = this.getCacheData(config.url, config.method);

	return data ? Promise.resolve(data) : await axios.request(config);
}

_.each(methods, method => {
	mockAxios[method] = async function(url, ...args){
		const data = this.getCacheData(url, method);

		return data != undefined ? Promise.resolve(data) : await axios[method](url, ...args);
	}
});

mockAxios.mock = function(url, method, data) {
	method = method.toUpperCase();
	this.datas[method][url] = data;
}

//mockAxios.mock("test", "get", {data:{key:1}});
//const test = async () => {
	//const data = await mockAxios.get("test").then(res => res.data);

	//console.log(data);
//}
//test();

module.exports = app => {
	if (app.config.env != "unittest" && app.config.env != "test") {
		app.axios = axios;
		return;
	}

	app.axios = mockAxios;
}
