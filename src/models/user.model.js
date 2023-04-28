const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("../config/config");

const userSchema = new mongoose.Schema({
	email: { type: String, required: true, unique: true },
	password: { type: String, required: true },
	name: { type: String },
	role: { type: String, enum: ["user", "moderator", "admin"], default: "user" },
	refreshTokens: [{ type: String }]
});

// Hash the password before saving the user to the database
userSchema.pre("save", async function (next) {
	const user = this;
	if (user.isModified("password")) {
		const salt = await bcrypt.genSalt(10);
		user.password = await bcrypt.hash(user.password, salt);
	}
	next();
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
	user.save();
	return { accessToken: token, refreshToken: refreshToken };
};

const User = mongoose.model("User", userSchema);

module.exports = User;
