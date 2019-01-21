const jwt = require("jwt-simple");
const _ = require("lodash");
const qrcode = require("qrcode");
const Hashes = require("jshashes");
const uuidv1 = require("uuid/v1");
const md5 = require("blueimp-md5");
const crypto = require("crypto");
const base64 = require('js-base64').Base64;

const sha1 = new Hashes.SHA1().setUTF8(true);

const util = {};

const getStringByteLength = function(str) {
	var totalLength = 0;     
	var charCode;  
	for (var i = 0; i < str.length; i++) {  
		charCode = str.charCodeAt(i);  
		if (charCode < 0x007f)  {     
			totalLength++;     
		} else if ((0x0080 <= charCode) && (charCode <= 0x07ff))  {     
			totalLength += 2;     
		} else if ((0x0800 <= charCode) && (charCode <= 0xffff))  {     
			totalLength += 3;   
		} else{  
			totalLength += 4;   
		}          
	}  
	return totalLength;   
}

util.uuid = function() {
	return uuidv1().replace(/-/g, "");
}

// 与gitlab sha一致
util.hash = function(content) {
	var header = "blob " + getStringByteLength(content) + "\0";
	var text = header + content;
	return sha1.hex(text);
}

util.md5 = function(str) {
	return md5(str);
}

util.jwt_encode = function(payload, key, expire = 3600 * 24 * 100) {
	payload = payload || {};
	payload.exp = Date.now() / 1000 + expire;

	return jwt.encode(payload, key);
}

util.jwt_decode = function(token, key, noVerify) {
	try {
		return jwt.decode(token, key, noVerify);
	} catch(e) {

	}

	return ;
}

util.base64  = function(text) {
	return base64.encode(text);
}

util.getDate = function(str = null) {
	const date = new Date(str);
	const year = _.padStart(date.getFullYear(), 4, "0");
	const month =  _.padStart(date.getMonth() + 1, 2, "0");
    const day = _.padStart(date.getDate(), 2, "0");
    const hour = _.padStart(date.getHours(), 2, "0");
    const minute = _.padStart(date.getMinutes(), 2, "0");
	const second = _.padStart(date.getSeconds(), 2, "0");
	
	const datetime = year + month + day + hour + minute + second;
	return {year, month, day, hour, minute, second, datetime};
}

util.getFileType = function(filename) {
	const filetypes = {
		"/": "folders",

		".md": "pages",

		".jpg": "images",
		".jpeg": "images",
		".png": "images",
		".svg": "images",

		".mp4": "videos",
		".webm": "videos",

		".mp3": "audios",
		".ogg": "audios",
		".wav": "audios",

		".json": "datas",
		".yml": "datas",

		//unknow: "files",
	}
	if (_.endsWith(filename, "/")) return "folders";
	const ext = _.toLower(filename.substring(filename.lastIndexOf(".")));
	return filetypes[ext] || "files";
}

util.rsaEncrypt = function(prvKey, message) {
	return crypto.privateEncrypt(prvKey, Buffer.from(message, "utf8")).toString("hex");
}

util.rsaDecrypt = function(pubKey, sig) {
	return crypto.publicDecrypt(pubKey, Buffer.from(sig, "hex")).toString("utf8");
}

util.qrcode = async text => {
	try {
		return await qrcode.toDataURL(text);
	} catch(e) {
		return ;
	}
}

module.exports = util;
