const express = require("express");
const http = require("http");
const mongoose = require("mongoose");
const config = require("./config/config");

const logger = require("pino")({
	transport: {
		target: "pino-pretty",
		option: {
			colorize: true
		}
	}
});
const app = express();

mongoose.set("strictQuery", false);
mongoose.connect(config.mongo.url, { retryWrites: true, w: "majority" }).then(() => {
	logger.info("Connected to MongoDB.");
	startServer();
});

const startServer = () => {
	app.use(express.urlencoded({ extended: true }));
	app.use(express.json());

	// Handle Incoming Requests
	app.use((req, res, next) => {
		logger.info(
			`Incoming -> Method [${req.method}] - Uri: [${req.url}] - IP: [${req.socket.remoteAddress}]`
		);
		res.on("finish", () => {
			logger.info(
				`Incoming -> Method [${req.method}] - Uri: [${req.url}] - IP: [${req.socket.remoteAddress}] - Status: [${req.statusCode}]`
			);
		});
		next();
	});

	// Healthcheck Endpoint
	app.get("/", (_req, res, _next) => res.status(200).json({ message: "Healthcheck Achieved." }));

	// Handle Non-existing Routes
	app.use((_req, res, _next) => {
		const error = new Error("not found");
		logger.error(error);
		return res.status(404).json({ message: error.message });
	});

	http.createServer(app).listen(config.server.port, () =>
		logger.info(`Server is running on port ${config.server.port}.`)
	);
};
