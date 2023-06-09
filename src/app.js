const express = require("express");
const http = require("http");
const mongoose = require("mongoose");
const config = require("./config/config");

const passport = require("passport");
const passportConfig = require("./middlewares/passport.middleware");

const authRoutes = require("./routes/auth.route");

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
	app.use(passport.initialize());
	passportConfig(passport);

	app.use(express.urlencoded({ extended: true }));
	app.use(express.json());

	// Handle Incoming Requests
	app.use((req, res, next) => {
		logger.info(
			`Incoming -> Method [${req.method}] - Uri: [${req.url}] - IP: [${req.socket.remoteAddress}]`
		);
		res.on("finish", () => {
			logger.info(
				`Incoming -> Method [${req.method}] - Uri: [${req.url}] - IP: [${req.socket.remoteAddress}] - Status: [${res.statusCode}]`
			);
		});
		next();
	});

	app.use("/auth", authRoutes);

	// Healthcheck Endpoint
	app.get("/", (_req, res) => res.status(200).json({ message: "Healthcheck Achieved." }));

	app.get("/poo", (req, res, next) => {
		return res.status(200).json({ message: "pee" });
	});

	// Handle Non-existing Routes
	app.use((_req, res) => {
		const error = new Error("not found");
		logger.error(error);
		return res.status(404).json({ message: error.message });
	});

	http.createServer(app).listen(config.server.port, () =>
		logger.info(`Server is running on port ${config.server.port}.`)
	);
};
