const { User } = require("../../src/models/user.model");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");

let mongoServer;

beforeAll(async () => {
	mongoServer = new MongoMemoryServer();
	await mongoServer.start();
	const mongoUri = mongoServer.getUri();
	await mongoose.connect(mongoUri);
});

afterAll(async () => {
	await mongoose.disconnect();
	await mongoServer.stop();
});

// describe("User Schema", () => {
// 	test("should insert a User document correctly", async() => {
// 		const user = new User({
// 			email: "elmo@mail.ca",
// 			password: "elmo",
// 			name: "Elmo",
// 			phone: "123-123-1234",
// 			role: "user"
// 		});
// 		await expect(user.save()).resolves.toBeDefined();
// 	});
// });
