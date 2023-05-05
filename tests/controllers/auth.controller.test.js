const User = require("../../src/models/user.model")
const { register } = require("../../src/controllers/auth.controller");
const next = require("../../src/for_next/services");
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

jest.mock('./register');

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

    it('should create a new user and return a token', async () => {
        const user = { _id: '123', name: 'John Doe', email: 'john@example.com', password: 'password123', generateAuthToken: jest.fn().mockReturnValue('token') };
        //User.mockReturnValueOnce(user);
        User.mockReturnValueOnce;
        user.save = jest.fn();

        await register(req, res, next);

        expect(User).toHaveBeenCalledTimes(1);
        expect(User).toHaveBeenCalledWith({ name: 'John Doe', email: 'john@example.com', password: 'password123' });

        expect(user.generateAuthToken).toHaveBeenCalledTimes(1);
        expect(user.save).toHaveBeenCalledTimes(1);

        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({ user, token: 'token' });

        expect(next).not.toHaveBeenCalled();
    });

    // it('should log an error if an error occurs', async () => {
    //     const error = new Error('Oops!');
    //     User.mockImplementationOnce(() => { throw error; });
    //
    //     const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    //
    //     await register(req, res, next);
    //
    //     expect(User).toHaveBeenCalledTimes(1);
    //     expect(User).toHaveBeenCalledWith({ name: 'John Doe', email: 'john@example.com', password: 'password123' });
    //
    //     expect(res.status).not.toHaveBeenCalled();
    //     expect(res.json).not.toHaveBeenCalled();
    //
    //     expect(consoleSpy).toHaveBeenCalledWith('error');
    //
    //     consoleSpy.mockRestore();
    // });
});


test("successful register", async() => {
    const user = new User ({
        name:"Joe",
        email:"hello@gmail.com",
        password:"mom"
    });
    register(user);
    await expect(user.save()).resolves.toBeDefined();
});

test("same email register", async() => {
    const user1 = new User ({name:"Bob", email:"bob@mail.com", password:"bob"});
    const user2 = new User ({name:"Man", email:"bob@mail.com", password:"man"});
    register(user1);
    try {
        await register(user2);
    } catch (e) {
        expect(e).toMatch('error');
    }
    //return register(user2).catch(e => expect(e).toMatch('error'));
})

test("email is not all lowercase", async() => {
    const user = new User ({
        name:"Sal",
        email:"SalMan@gmail.com",
        password:"sal"
    });
    register(user);
    return register(user).catch(e => expect(e).toMatch('error'));
})

//email is not a string
//email is not given
//password is not a string
//password is not given
//name is not a string

// test("test", () => {
//     hello = true;
//     expect(hello).toBe(true);
//
// })