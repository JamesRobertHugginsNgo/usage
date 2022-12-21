const ANSI_COLOURS = require('ansi-colours');
const Path = require('path');

function usage(configs) {
	return new Promise((resolve, reject) => {
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
				return resolve(configs[argvN](...argv));
			}

			// Found as object with callback
			if (configs[argvN].callback) {
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
			const args = Array.isArray(config.args)
				? config.args.join(' ')
				: config.args || '';
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

		// Return an error
		reject('Script Not Found');
	});
}

module.exports = usage;
