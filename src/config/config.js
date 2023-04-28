const dotenv = require("dotenv");

dotenv.config();

const MONGO_USERNAME = process.env.MONGO_USERNAME || "";
const MONGO_PASSWORD = process.env.MONGO_PASSWORD || "";

const MONGO_URL = `mongodb+srv://${MONGO_USERNAME}:${MONGO_PASSWORD}@cluster0.jrig5xl.mongodb.net/`;
const SERVER_PORT = process.env.SERVER_PORT ? parseInt(process.env.SERVER_PORT) : 1337;

const config = {
	mongo: {
		url: MONGO_URL
	},
	server: {
		port: SERVER_PORT
	}
};

module.exports = config;
