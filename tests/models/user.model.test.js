const User = require("../../src/models/user.model");
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

describe("User Schema", () => {
	//WORKING CASE TESTS
	test("should insert a User document correctly", async () => {
		const user = new User({
			email: "elmo@mail.ca",
			password: "Elmo$999",
			name: "Elmo",
			phone: "123-123-1234",
			role: "user",
			refreshTokens: ["1"]
		});
		await expect(user.save()).resolves.toBeDefined();
	});

	test("user can be retrieved from database and it matches info", async () => {
		const user = new User({
			email: "elmo2@mail.ca",
			password: "Elmo$999",
			name: "Elmo",
		});
		await user.save();

		const retrievedUser = await User.findById(user._id);
		expect(retrievedUser.email).toEqual(user.email);
		expect(retrievedUser.name).toEqual(user.name);

	});

	test("user can be updated with valid info", async () => {
		const user = new User({
			email: "elmo3@mail.ca",
			password: "Elmo$999",
			name: "Elmo",
			phone: "123-123-1200",
			role: "user"
		});

		await user.save();

		const updatedUserData = {
			email: 'updateduser@example.com',
			phone: '555-555-5555',
			name: 'elmo 2.0'
		};

		const updatedUser = await User.findByIdAndUpdate(user._id, updatedUserData, { new : true });
		expect(updatedUser.email).toEqual(updatedUserData.email);
		expect(updatedUser.phone).toEqual(updatedUserData.phone);
		expect(updatedUser.name).toEqual(updatedUserData.name);

	});


	//ERROR CASE TESTS
	test("error thrown when user created w/o email", async () => {
		expect.assertions(1);
		const user = new User({
			password: "fRog$1114"
		});

		try {
			await user.save();
		} catch(err) {
			expect(err).toBeTruthy();
		}

	});

	test("invalid email format", async () => {
		expect.assertions(1);
		const user = new User({
			email: "frog",
			password: "fRog$1114"
		});

		try {
			await user.save();
		} catch(err) {
			expect(err).toBeTruthy();
		}

	});

	test("duplicate email", async () => {
		expect.assertions(1);
		const user = new User({
			email: "bigfrog@mail.com",
			password: "fRog$1114",
			phone: "111-111-1111"
		});
		await user.save();

		const dup_user = new User({
			email: "bigfrog@mail.com",
			password: "Password@123"
		});

		try {
			await dup_user.save();
		} catch(err) {
			expect(err).toBeTruthy();
		}

	});

	test("no password", async () => {
		expect.assertions(1);
		const user = new User({
			email: "frog@mail.com"
		});

		try {
			await user.save();
		} catch(err) {
			expect(err).toBeTruthy();
		}

	});

	test("invalid password format (weak password)", async () => {
		expect.assertions(1);
		const user = new User({
			email: "frog@mail.com",
			password: "frog"
		});

		try {
			await user.save();
		} catch(err) {
			expect(err).toBeTruthy();
		}

	});

	test("invalid phone number", async () => {
		expect.assertions(1);
		const user = new User({
			email: "frog@mail.com",
			password: "fRog$1114",
			phone: "617"
		});

		try {
			await user.save();
		} catch(err) {
			expect(err).toBeTruthy();
		}

	});

	test("error thrown when trying to create a user with duplicate phone number", async () => {
		expect.assertions(1);
		const user = new User({
			email: "frog@mail.com",
			password: "fRog$1114",
			phone: "617-610-3635"
		});
		await user.save();

		const dup_user = new User({
			email: "otherfrog@mail.com",
			password: "Password@123",
			phone: "617-610-3635"
		});

		try {
			await dup_user.save();
		} catch(err) {
			expect(err).toBeTruthy();
		}

	});

	test("error thrown when trying to create a user with a role that is not in roles", async () => {
		expect.assertions(1);
		const user = new User({
			email: "frog@mail.com",
			password: "Password@123",
			role: "not a valid role"
		});

		try {
			await user.save();
		} catch(err) {
			expect(err).toBeTruthy();
		}

	});

});
