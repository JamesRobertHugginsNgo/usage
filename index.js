const ANSI_COLOURS = require('ansi-colours');
const EnvLog = require('env-log');
const Path = require('path');

const ENV_LOG_VAR = 'USAGE_LOG';

function usage(configs) {
	const log = EnvLog.factory(ENV_LOG_VAR);

	const promise = new Promise((resolve) => {
		const [node, script, ...argv] = process.argv;

		// Find the correct callback or exit loop to show usage information
		// Path holds all the keys to the config
		const path = [];
		while (argv.length > 0) {
			const argvN = argv.shift();

			// Not found
			if (!configs[argvN]) {
				break;
			}

			// Found as function
			if (typeof configs[argvN] === 'function') {
				log && log(`Starting ${argvN}...`);
				return resolve(configs[argvN](...argv));
			}

			// Found as object with callback
			if (configs[argvN].callback) {
				log && log(`Starting ${argvN}...`);
				return resolve(configs[argvN].callback(...argv));
			}

			// Must be nested configuration, move to the sub configs
			configs = configs[argvN];
			path.push(argvN);
		}

		// Build meta data, used for displaying information
		// Longest size variables is for for padding to line up args and desc
		let longestKeySize = 0, longestArgsSize = 0;
		const meta = {};
		for (const key in configs) {
			if (key.length > longestKeySize) {
				longestKeySize = key.length;
			}
			const config = configs[key];
			const args = config.args || '';
			if (args.length > longestArgsSize) {
				longestArgsSize = args.length;
			}
			const desc = config.desc
				? `${ANSI_COLOURS.BLUE}${config.desc}${ANSI_COLOURS.RESET}`
				: typeof config !== 'function' && !config.callback
					? '...'
					: '';
			meta[key] = { args, desc };
		}

		log && log(`Displaying usage...`);

		// Build common prefix
		const prefixNode = Path.basename(node, Path.extname(node));
		const prefixScript = Path.basename(script, Path.extname(script));
		const prefixPath = path.length > 0 ? ` ${path.join(' ')}` : '';
		const prefix = `${prefixNode} ${prefixScript}${prefixPath}`;

		// Display usage information
		console.group('Usage:');
		for (const key in meta) {
			const { args, desc } = meta[key];
			console.log(prefix, key.padEnd(longestKeySize), args.padEnd(longestArgsSize), desc);
		}
		console.groupEnd();

		resolve();
	});

	if (log) {
		return promise.then((data) => {
			log('Finishing without error');
			return data;
		}, (error) => {
			log('Finishing with error -', error);
			return Promise.reject(error);
		});
	}

	return promise;
}

module.exports = usage;
