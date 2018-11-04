import {app, http, assert} from  "@/mock.js";

function sum(a, b) {
	return a + b;
}

it('adds 1 + 2 to equal 3',  (done) => {
	assert.equal(1 + 2, 3);
	done();
});
