const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user.model");
const config = require("../config/config");
const next = require("../../src/for_next/services");
const { startSession } = require("mongoose");
const validateUser = require("../middlewares/validateUser");

const logger = require("pino")({
	transport: {
		target: "pino-pretty",
		option: {
			colorize: true
		}
	}
});

const register = async (req, res, next) => {
	try {
		const { name, email, password } = req.body;
		const user = new User({ name, email, password });

		const validate = validateUser(user.toObject());
		if (validate.message !== "Valid") {
			res.status(401).json({ message: validate.message });
			return;
		}
		const token = user.generateAuthToken();

		await user.save();

		res.status(201).json({ user, token });
	} catch (error) {
		next(error);
	}
};

const login = async (req, res, next) => {
	try {
		const { email, password } = req.body;

		const validation_dummy = new User({ email, password });

		const validate = validateUser(validation_dummy.toObject());
		if (validate.message !== "Valid") {
			res.status(401).json({ message: validate.message });
			return;
		}
		const user = await User.findOne({ email });
		if (!user) {
			res.status(401).json({ message: "Invalid email or password" });
			return;
		}
		const isMatch = await bcrypt.compare(password, user.password);
		if (!isMatch) {
			res.status(401).json({ message: "Invalid email or password" });
			return;
		}

		const token = await user.generateAuthToken();
		res.status(200).json({ token });
	} catch (error) {
		next(error);
	}
};

const refreshToken = async (req, res) => {
	try {
		const session = await startSession();
		session.startTransaction();
		const { refreshToken } = req.body;
		const decoded = jwt.verify(refreshToken, config.jwt.refresh);
		const user = await User.findById(decoded._id);

		if (!user) {
			res.status(401).send({ message: "Invalid refresh token" });
			return;
		}

		const updatedAccessToken = user.generateAuthToken();
		const updatedRefreshToken = jwt.sign({ _id: user._id }, config.jwt.refresh, {
			expiresIn: "7d"
		});
		user.refreshTokens = user.refreshTokens.filter((token) => token !== refreshToken);
		user.refreshTokens.push(updatedRefreshToken);

		await user.save();
		await session.commitTransaction();
		session.endSession();
		res.send({ accessToken: updatedAccessToken, refreshToken: updatedRefreshToken });
	} catch (error) {
		logger.error(error);
		res.status(500).send({ message: "Internal server error" });
	}
};

module.exports = {
	register,
	login,
	refreshToken
};
