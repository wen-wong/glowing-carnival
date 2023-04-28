const jwt = require("jsonwebtoken");
const User = require("../models/user.model");
const config = require("../config/config");
const logger = require("pino")({
	transport: {
		target: "pino-pretty",
		option: {
			colorize: true
		}
	}
});

const getCurrentUser = async (req, res, next) => {
	try {
		const token = req.headers.authorization.split(" ")[1];
		const decodedToken = jwt.verify(token, config.jwt.secret);
		const user = await User.findById(decodedToken.userId);

		req.user = user;

		next();
	} catch (error) {
		logger.error(error);
		res.status(401).json({ message: "Invalid token" });
	}
};

module.exports = getCurrentUser;
