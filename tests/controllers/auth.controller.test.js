const User = require("../../src/models/user.model");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { register, login, refreshToken } = require("../../src/controllers/auth.controller");
const validateUser = require("../../src/middlewares/validateUser");

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

describe('register', () => {
    const req = { body: { name: 'John Doe', email: 'john@example.com', password: 'Password@123' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();

    beforeEach(() => {
        User.mockClear;
        res.status.mockClear();
        res.json.mockClear();
        next.mockClear();
    });

    it('should create a new user and generate a token', async () => {
        const user = new User({ name: 'John Doe', email: 'john@example.com', password: 'Password@123'});
        User.mockReturnValueOnce;
        user.save = jest.fn();
        jest.spyOn(user, "generateAuthToken").mockResolvedValue(Object);

        await register(req, res, next);

        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({ user: expect.any(Object), token: expect.any(Object) });

    });

    it('should log an error if an error occurs', async () => {
        const error = new Error('bruh');
        const user = new User({ name: 'John Doe', email: 'john@example.com', password: 'Password@123'});
        User.mockImplementationOnce;
      
        jest.spyOn(user, "save").mockResolvedValue(Error);
        await register(req, res, next);

        expect(res.status).not.toHaveBeenCalled();
        expect(res.json).not.toHaveBeenCalled();

    });


describe('refreshToken endpoint', () => {
    let refreshedToken;

    req = {body: {name: 'John 2', email: 'john2@example.com', password: 'Password@123', phone: '617-610-3635'}};
    const res = {status: jest.fn().mockReturnThis(), json: jest.fn(), send: jest.fn()};
    const next = jest.fn();

    beforeAll(async () => {
        const user = new User({name: 'John 2', email: 'john2@example.com', password: 'Password@123', phone: '617-610-3635'});

        await register(req, res, next);
        await user.save();
        refreshedToken = user.generateAuthToken();

        User.mockClear;
        res.status.mockClear();
        res.send.mockClear();
    });

    test('should return a new access token and refresh token', async () => {

        req = {body: {refreshToken: refreshedToken.refreshToken}};
        await refreshToken(req, res);
        expect(res.send).toHaveBeenCalledWith({accessToken: expect.any(Object), refreshToken: expect.any(String)});

    });

    it("401 if no user found (invalid refresh token)", async () => {
        jest.spyOn(jwt, "verify").mockResolvedValue(String);
        jest.spyOn(User, "findById").mockResolvedValue();
        await refreshToken(req, res);
        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.send).toHaveBeenCalledWith({message: "Invalid refresh token"});
    });

    it("500 for other errors", async () => {
        const t_user = new User({
            email: "test@example.com",
            password: "test$4Password",
            phone: "617-610-3635"
        });
        jest.spyOn(jwt, "verify").mockResolvedValue(String);
        jest.spyOn(User, "findById").mockResolvedValue(t_user);
        jest.spyOn(t_user, "generateAuthToken").mockResolvedValue(String);
        jest.spyOn(jwt, "sign").mockResolvedValue(Error);
        await refreshToken(req, res);
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.send).toHaveBeenCalledWith({message: "Internal server error"});
    });
});

describe("login function", () => {
	let req, res, next;

	beforeEach(() => {
		req = { body: { email: "amen@bob.com", password: "Password@123" } };
		res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
		next = jest.fn();
	});

	afterEach(() => {
		jest.restoreAllMocks();
	});

	it("return token for valid email & password", async () => {
		const f_user = new User({ email: "amen@bob.com", password: "Password@123" });

		jest.spyOn(User, "findOne").mockResolvedValue(f_user);
		jest.spyOn(bcrypt, "compare").mockResolvedValue(true);
		jest.spyOn(f_user, "generateAuthToken").mockResolvedValue(
			Object({
				accessToken: "1234",
				refreshToken: "1232"
			})
		);
		await login(req, res, next);
		expect(User.findOne).toHaveBeenCalledWith({ email: "amen@bob.com" });
		expect(bcrypt.compare).toHaveBeenCalledWith("Password@123", f_user.password);
		expect(f_user.generateAuthToken).toHaveBeenCalled();
		expect(res.status).toHaveBeenCalledWith(200);
		expect(res.json).toHaveBeenCalledWith({
			token: expect.objectContaining({
				accessToken: expect.any(String),
				refreshToken: expect.any(String)
			})
		});
		expect(next).not.toHaveBeenCalled();
	});

	it("401 if email incorrect", async () => {
		const f_user = new User({ email: "amen@bob.com", password: "Password@123" });
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
		const f_user = new User({ email: "amen@bob.com", password: "Password@123" });
		jest.spyOn(User, "findOne").mockResolvedValue(f_user);
		jest.spyOn(bcrypt, "compare").mockResolvedValue(false);
		jest.spyOn(f_user, "generateAuthToken");
		await login(req, res, next);
		expect(User.findOne).toHaveBeenCalledWith({ email: "amen@bob.com" });
		expect(bcrypt.compare).toHaveBeenCalledWith("Password@123", f_user.password);
		expect(res.status).toHaveBeenCalledWith(401);
		expect(res.json).toHaveBeenCalledWith({ message: "Invalid email or password" });
		expect(f_user.generateAuthToken).not.toHaveBeenCalled();
		expect(next).not.toHaveBeenCalled();
	});

	it("catch any other error", async () => {
		const f_user = new User({ email: "amen@bob.com", password: "Password@123" });
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