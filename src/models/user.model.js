const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("../config/config");

const userSchema = new mongoose.Schema({
	email: {
		type: String,
		required: true,
		unique: true,
		lowercase: true,
		match: /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
		validate: {
			validator: function (value) {
				return mongoose
					.model("User", userSchema)
					.findOne({ email: value })
					.then((user) => !user);
			}
		}
	},
	password: { type: String, required: true },
	name: { type: String },
	phone: {
		type: String,
		unique: true,
		match: /\d{3}-\d{3}-\d{4}/,
		validate: {
			validator: function (value) {
				return mongoose
					.model("User", userSchema)
					.findOne({ phone: value })
					.then((user) => !user);
			}
		}
	},
	role: { type: String, enum: ["user", "moderator", "admin"], default: "user" },
	refreshTokens: [{ type: String }]
});

// Hash the password before saving the user to the database
userSchema.pre("save", async function (next) {
	try {
		const user = this;
		if (user.isModified("password")) {
			user.password = await bcrypt.hash(user.password, config.hash.salt);
		}
		next();
	} catch (error) {
		next(error);
	}
});

// Create a JWT token for the user
userSchema.methods.generateAuthToken = function () {
	const user = this;
	const token = jwt.sign(
		{ _id: user._id, email: user.email, role: user.role },
		config.jwt.secret,
		{ expiresIn: "15m" }
	);
	const refreshToken = jwt.sign({ _id: user._id }, config.jwt.refresh, { expiresIn: "7d" });
	user.refreshTokens.push(refreshToken);
	return { accessToken: token, refreshToken: refreshToken };
};

const User = mongoose.model("User", userSchema);

module.exports = User;
