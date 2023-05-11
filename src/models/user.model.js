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
		match: /.+\@.+\..+/
	},
	password: {
		type: String,
		required: true,
		validate: {
			validator: function(v) {
				return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\da-zA-Z]).{8,}$/.test(v);
			},
			message: props => `Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number, and one special character!`
		}},
	name: { type: String },
	phone: {
		type: String,
		validate: {
			validator: function(v) {
				return /\d{3}-\d{3}-\d{4}/.test(v);
			},
			message: props => `${props.value} is not a valid phone number!`
		},
		unique: true
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
