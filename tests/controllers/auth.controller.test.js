const User = require("../../src/models/user.model");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const bcrypt = require("bcryptjs");
const { register, login, refreshToken } = require("../../src/controllers/auth.controller");
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

describe("login function", () => {
	let req, res, next;

	beforeEach(() => {
		req = { body: { email: "amen@bob.com", password: "123" } };
		res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
		next = jest.fn();
	});

	afterEach(() => {
		jest.restoreAllMocks();
	});

	it("return token for valid email & password", async () => {
		const f_user = new User({ email: "amen@bob.com", password: "123" });

		jest.spyOn(User, "findOne").mockResolvedValue(f_user);
		jest.spyOn(bcrypt, "compare").mockResolvedValue(true);
		jest.spyOn(f_user, "generateAuthToken").mockResolvedValue(Object);

		await login(req, res, next);
		expect(User.findOne).toHaveBeenCalledWith({ email: "amen@bob.com" });
		expect(bcrypt.compare).toHaveBeenCalledWith("123", f_user.password);
		expect(f_user.generateAuthToken).toHaveBeenCalled();
		expect(res.status).toHaveBeenCalledWith(200);
		expect(res.json).toHaveBeenCalledWith({ token: expect.any(Object) });
		expect(next).not.toHaveBeenCalled();
	});

	it("401 if email incorrect", async () => {
		const f_user = new User({ email: "amen@bob.com", password: "123" });
		jest.spyOn(User, "findOne").mockResolvedValue(null);
		jest.spyOn(bcrypt, "compare");
		jest.spyOn(f_user, "generateAuthToken");
		await login(req, res, next);
		expect(User.findOne).toHaveBeenCalledWith({ email: "amen@bob.com" });
		expect(bcrypt.compare).not.toHaveBeenCalled();
		expect(res.status).toHaveBeenCalledWith(401);
		expect(res.json).toHaveBeenCalledWith({ message: "Invalid email or password" });
		expect(f_user.generateAuthToken).not.toHaveBeenCalled();
		expect(next).not.toHaveBeenCalled();
	});

	it("401 if password incorrect", async () => {
		const f_user = new User({ email: "amen@bob.com", password: "123" });
		jest.spyOn(User, "findOne").mockResolvedValue(f_user);
		jest.spyOn(bcrypt, "compare").mockResolvedValue(false);
		jest.spyOn(f_user, "generateAuthToken");
		await login(req, res, next);
		expect(User.findOne).toHaveBeenCalledWith({ email: "amen@bob.com" });
		expect(bcrypt.compare).toHaveBeenCalledWith("123", f_user.password);
		expect(res.status).toHaveBeenCalledWith(401);
		expect(res.json).toHaveBeenCalledWith({ message: "Invalid email or password" });
		expect(f_user.generateAuthToken).not.toHaveBeenCalled();
		expect(next).not.toHaveBeenCalled();
	});

	it("catch any other error", async () => {
		const f_user = new User({ email: "amen@bob.com", password: "123" });
		jest.spyOn(User, "findOne").rejects;
		jest.spyOn(bcrypt, "compare");
		jest.spyOn(f_user, "generateAuthToken");
		await login(res, req, next);
		expect(bcrypt.compare).not.toHaveBeenCalled();
		expect(res.status).not.toHaveBeenCalled();
		expect(res.json).not.toHaveBeenCalled();
		expect(f_user.generateAuthToken).not.toHaveBeenCalled();
		expect(next).toHaveBeenCalled();
	});
});
