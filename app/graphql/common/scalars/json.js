
const { GraphQLScalarType } = require('graphql');
const { Kind } = require('graphql/language');

module.exports = new GraphQLScalarType({
	name: 'Json',
	description: 'Date custom scalar type',
	parseValue(value) {
		try {
			return JSON.parse(value);
		} catch(e) {
			return ;
		}
	},
	serialize(value) {
		return value;
		//return JSON.stringify(value);
	},
	parseLiteral(ast) {
		//if (ast.kind === Kind.INT) {
			//return parseInt(ast.value, 10);
		//}
		return null;
	},
});
