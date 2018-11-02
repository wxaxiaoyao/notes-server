
const _ = require("lodash");
const ahocorasick = require("aho-corasick.js");
const trie = new ahocorasick.TrieNode();

module.exports = async app => {
	const list = await app.model.sensitiveWords.findAll({limit:100000});
	_.each(list, o => trie.add(o.word, {word:o.word}));
	ahocorasick.add_suffix_links(trie);

	ahocorasick.check = async (word) => {
		const data = await new Promise((resolve, reject) => {
			let words = [];
			ahocorasick.search(word, trie, (foundWord, data) => {
				words.push(foundWord);
			});	
			return resolve(words);
		});

		return data;
	}

	app.ahocorasick = ahocorasick;
}
