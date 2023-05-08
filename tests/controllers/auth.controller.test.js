const User = require("../../src/models/user.model")
const { register, refreshToken } = require("../../src/controllers/auth.controller");
const next = require("../../src/for_next/services");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const jwt = require("jsonwebtoken");
const config = require('../../src/config/config');

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
    const req = { body: { name: 'John Doe', email: 'john@example.com', password: 'password123' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();

    beforeEach(() => {
        User.mockClear;
        res.status.mockClear();
        res.json.mockClear();
        next.mockClear();
    });

    it('should create a new user and generate a token', async () => {
        const user = new User({ name: 'John Doe', email: 'john@example.com', password: 'password123'});
        User.mockReturnValueOnce;
        user.save = jest.fn();
        jest.spyOn(user, "generateAuthToken").mockResolvedValue(Object);

        await register(req, res, next);

        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({ user: expect.any(Object), token: expect.any(Object) });

    });

    it('should log an error if an error occurs', async () => {
        const error = new Error('bruh');
        const user = new User({ name: 'John Doe', email: 'john@example.com', password: 'password123'});
        User.mockImplementationOnce;

        jest.spyOn(user, "save").mockResolvedValue(Error);
        await register(req, res, next);

        expect(res.status).not.toHaveBeenCalled();
        expect(res.json).not.toHaveBeenCalled();

    });
});


describe('refreshToken endpoint', () => {
    let refreshedToken;

    req = { body: { name: 'John 2', email: 'john2@example.com', password: 'password123', phone: '617' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn(), send: jest.fn() };
    const next = jest.fn();

    beforeAll(async () => {
        const user = new User({ name: 'John 2', email: 'john2@example.com', password: 'password123', phone: '617'});

        await register(req, res, next);
        await user.save();
        refreshedToken = user.generateAuthToken();

        User.mockClear;
        res.status.mockClear();
        res.send.mockClear();
    });

    test('should return a new access token and refresh token', async () => {

        req = { body: { refreshToken: refreshedToken.refreshToken }};
        await refreshToken(req, res);
        expect(res.send).toHaveBeenCalledWith({ accessToken: expect.any(Object), refreshToken: expect.any(String) });

    });

    it("401 if no user found (invalid refresh token)", async () => {
        jest.spyOn(jwt, "verify").mockResolvedValue(String);
        jest.spyOn(User, "findById").mockResolvedValue();
        await refreshToken(req, res);
        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.send).toHaveBeenCalledWith({ message: "Invalid refresh token" });
    });

    it("500 for other errors", async () => {
        const t_user = new User({
            email: "test@example.com",
            password: "testpassword",
            phone: "6176103635"
        });
        jest.spyOn(jwt, "verify").mockResolvedValue(String);
        jest.spyOn(User, "findById").mockResolvedValue(t_user);
        jest.spyOn(t_user, "generateAuthToken").mockResolvedValue(String);
        jest.spyOn(jwt, "sign").mockResolvedValue(Error);
        await refreshToken(req, res);
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.send).toHaveBeenCalledWith({ message: "Internal server error" });
    });
});
