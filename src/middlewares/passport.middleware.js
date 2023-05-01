const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const JwtStrategy = require("passport-jwt").Strategy;
const { ExtractJwt } = require("passport-jwt");
const bcrypt = require("bcryptjs");
const User = require("../models/user.model");
const config = require("../config/config");

module.exports = () => {
	passport.use(
		new LocalStrategy(async (username, password, done) => {
			try {
				const user = await User.findOne({ username });

				if (!user) return done(null, false, { message: "Invalid username or password " });

				const isMatch = await bcrypt.compare(password, user.password);

				if (!isMatch)
					return done(null, false, { message: "Invalid username or password " });

				return done(null, user);
			} catch (error) {
				return done(error);
			}
		})
	);

	passport.use(
		new JwtStrategy(
			{
				jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
				secretOrKey: config.jwt.secret
			},
			async (payload, done) => {
				try {
					const user = await User.findById(payload.sub);
					if (!user) return done(null, false);

					return done(null, user);
				} catch (error) {
					return done(error, false);
				}
			}
		)
	);
};
