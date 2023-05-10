const logger = require("pino")({
	transport: {
		target: "pino-pretty",
		option: {
			colorize: true
		}
	}
});
function next(error) {
	logger.error(error);
}

module.exports = next;
