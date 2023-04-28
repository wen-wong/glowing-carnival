const bcrypt = require("bcryptjs");
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

const register = async (req, res, next) => {
	try {
		const { name, email, password } = req.body;
		const hashedPassword = await bcrypt.hash(password, 10);
		const user = new User({ name, email, password: hashedPassword });

		await user.save();
		const token = user.generateAuthToken();

		res.status(201).json({ user, token });
	} catch (error) {
		next(error);
	}
};

const login = async (req, res, next) => {
	try {
		const { email, password } = req.body;
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

		const token = user.generateAuthToken();
		res.status(200).json({ user, token });
	} catch (error) {
		next(error);
	}
};

refreshToken = async (req, res) => {
	try {
		const { refreshToken } = req.body;
		const decoded = jwt.verify(refreshToken, config.jwt.refresh);
		const user = await User.findOne({ _id: decoded._id, refreshTokens: refreshToken });

		if (!user) {
			return res.status(401).send({ message: "Invalid refresh token" });
		}

		const updatedAccessToken = user.generateAuthToken();
		const updatedRefreshToken = jwt.sign({ _id: user._id }, config.config.refresh, {
			expiresIn: "7d"
		});
		user.refreshTokens = user.refreshTokens.filter((token) => token !== refreshToken);
		user.refreshTokens.push(updatedRefreshToken);

		await user.save();

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
