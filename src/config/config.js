const dotenv = require("dotenv");

dotenv.config();

const MONGO_USERNAME = process.env.MONGO_USERNAME || "";
const MONGO_PASSWORD = process.env.MONGO_PASSWORD || "";

const MONGO_URL = `mongodb+srv://${MONGO_USERNAME}:${MONGO_PASSWORD}@cluster0.jrig5xl.mongodb.net/`;
const SERVER_PORT = process.env.SERVER_PORT ? parseInt(process.env.SERVER_PORT) : 1337;

const JWT_SECRET_KEY =
	process.env.JWT_SECRET_KEY ||
	"ec2bfb56c10db939f2feab4fd088d417c7a598cd7d0561fb403f9af1e901de91";

const JWT_REFRESH_SECRET_KEY =
	process.env.JWT_REFRESH_SECRET_KEY ||
	"ec2bfb56c10db939f2feab4fd088d417c7a598cd7d0561fb403f9af1e901de91";

const HASH_SALT = process.env.HASH_SALT || 10;

const config = {
	mongo: {
		url: MONGO_URL
	},
	server: {
		port: SERVER_PORT
	},
	jwt: {
		secret: JWT_SECRET_KEY,
		refresh: JWT_REFRESH_SECRET_KEY
	},
	hash: {
		salt: HASH_SALT
	}
};

module.exports = config;
