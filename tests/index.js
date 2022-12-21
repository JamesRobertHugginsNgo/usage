const usage = require('../index');

const configConfig = {
	'argOne': (...args) => {
		console.log('argOne', ...args);
	},

	'argTwo': {
		args: 'ID',
		desc: 'Description',
		callback: (...args) => {
			console.log('argTwo', ...args);
		}
	},

	'argThree': {
		'argThreeOne': (...args) => {
			console.log('argThreeOne', ...args);
		},

		'argThreeTwo': {
			args: 'ID',
			desc: 'Description',
			callback: (...args) => {
				console.log('argThreeTwo', ...args);
			}
		}
	},

	'argFour': {
		args: 'UUID',
		desc: 'Universal Unique Identifier',
		callback(args) {
			console.log('argFour', ...args);
		}
	}
};

usage(configConfig).then(() => {
	console.log('COMPLETE');
}, (error) => {
	console.log('COMPLETE WITH ERROR:', error);
}).then(() => {
	console.log();
});
