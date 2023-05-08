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

// jest.mock('./register');
//
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
        //User.mockReturnValueOnce(user);
        User.mockReturnValueOnce;
        user.save = jest.fn();
        //user.generateAuthToken = jest.fn();
        jest.spyOn(user, "generateAuthToken").mockResolvedValue(Object);

        await register(req, res, next);

        //expect(User).toHaveBeenCalledTimes(1);
        //expect(User).toHaveBeenCalledWith({ name: 'John Doe', email: 'john@example.com', password: 'password123' });
        //expect(user.generateAuthToken).toHaveBeenCalledTimes(1);
        //expect(user.save).toHaveBeenCalledTimes(1);

        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({ user: expect.any(Object), token: expect.any(Object) });

        //expect(next).not.toHaveBeenCalled();
    });

    /*ERROR TEST CASE*/
    it('should log an error if an error occurs', async () => {
        const error = new Error('bruh');
        const user = new User({ name: 'John Doe', email: 'john@example.com', password: 'password123'});
        //User.mockImplementationOnce(() => { throw error; });
        User.mockImplementationOnce;

        //const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
        jest.spyOn(user, "save").mockResolvedValue(Error);
        await register(req, res, next);

        //expect(User).toHaveBeenCalledTimes(1);
        //expect(User).toHaveBeenCalledWith({ name: 'John Doe', email: 'john@example.com', password: 'password123' });

        expect(res.status).not.toHaveBeenCalled();
        expect(res.json).not.toHaveBeenCalled();

        //expect(consoleSpy).toHaveBeenCalledWith('error');

        //consoleSpy.mockRestore();
    });
});

// const request = require('supertest');
// const app = require('./app');
//
// describe('GET /users', () => {
//     it('responds with a JSON object', (done) => {
//         request(app)
//             .get('/users')
//             .set('Accept', 'application/json')
//             .expect('Content-Type', /json/)
//             .expect(200)
//             .end((err, res) => {
//                 if (err) return done(err);
//                 expect(res.body).toEqual({ users: [] });
//                 done();
//             });
//     });
// });

// test("successful register", async() => {
//     const user = {
//         name:"Joe",
//         email:"hello@gmail.com",
//         password:"mom"
//     };
//
//     await expect(register(user));
// });

// test("same email register", async() => {
//     const user1 = new User ({name:"Bob", email:"bob@mail.com", password:"bob"});
//     const user2 = new User ({name:"Man", email:"bob@mail.com", password:"man"});
//     register(user1);
//     try {
//         await register(user2);
//     } catch (e) {
//         expect(e).toMatch('error');
//     }
//     //return register(user2).catch(e => expect(e).toMatch('error'));
// })
//
// test("email is not all lowercase", async() => {
//     const user = new User ({
//         name:"Sal",
//         email:"SalMan@gmail.com",
//         password:"sal"
//     });
//     register(user);
//     return register(user).catch(e => expect(e).toMatch('error'));
// })

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

/* REFRESH TOKEN
* req = refreshToken
* test case for !user -> can check with return res status message
* test case for if session.commitTransaction()
* test case for error
* */


describe('refreshToken endpoint', () => {
    let refreshedToken;
    // const user = new User ({
    //     email: 'test@example.com',
    //     password: 'testpassword',
    //     phone: '6176103635'
    // });
    // user.save = jest.fn();
    // const authedToken = user.generateAuthToken();
    // refreshedToken = user.generateRefreshToken;

    // const userId = '64540857170c29197e436a05';
    // const refreshSecret = config.jwt.refresh;
    //
    // const refreshedToken = jwt.sign({ _id: userId }, refreshSecret, { expiresIn: '7d' });
    //
    // console.log(refreshedToken);
    req = { body: { name: 'John 2', email: 'john2@example.com', password: 'password123', phone: '617' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn(), send: jest.fn() };
    const next = jest.fn();

    beforeAll(async () => {
        const user = new User({ name: 'John 2', email: 'john2@example.com', password: 'password123', phone: '617'});

        //jest.spyOn(user, "generateAuthToken").mockResolvedValue(String);
        await register(req, res, next);
        await user.save();
        refreshedToken = user.generateAuthToken();

        console.log(refreshedToken.refreshToken);
        //await user.save();
        //refreshedToken = user.generateRefreshToken;

        User.mockClear;
        res.status.mockClear();
        res.send.mockClear();
    });

    // afterAll(async () => {
    //     await User.deleteMany({});
    // });

    test('should return a new access token and refresh token', async () => {

        req = { body: { refreshToken: refreshedToken.refreshToken }};
        await refreshToken(req, res);
        //await expect(user.save()).resolves.toBeDefined();
        expect(res.send).toHaveBeenCalledWith({ accessToken: expect.any(Object), refreshToken: expect.any(String) });

        //expect(response.body).toHaveProperty('accessToken');
        //expect(response.body).toHaveProperty('refreshToken');
        //expect(res.status).toHaveBeenCalledWith(200);
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

    // test('should update the user with the new refresh token', async () => {
    //     const response = await request(app)
    //         .post('/refresh-token')
    //         .send({ refreshToken })
    //         .expect(200);
    //
    //     const updatedUser = await User.findById(user._id);
    //     expect(updatedUser.refreshTokens).toContain(response.body.refreshToken);
    //     expect(updatedUser.refreshTokens).not.toContain(refreshToken);
    // });
    //

    //TEST CASE 2
    // test('should return 401 if the refresh token is invalid', async () => {
    //     // const response = await request(app)
    //     //     .post('/refresh-token')
    //     //     .send({ refreshToken: 'invalid-token' })
    //     //     .expect(401);
    //     const response = await refreshToken(req, res);
    //     expect(res.status).toHaveBeenCalledWith(401);
    //     expect(res.send).toHaveBeenCalledWith({ message: "Invalid refresh token" });
    //
    // });
    //

    //
    // test('should return 500 if there is an internal server error', async () => {
    //     jest.spyOn(User, 'findById').mockImplementation(() => {
    //         throw new Error('Internal server error');
    //     });
    //
    //     const response = await request(app)
    //         .post('/refresh-token')
    //         .send({ refreshToken })
    //         .expect(500);
    //
    //     expect(response.body).toEqual({ message: 'Internal server error' });
    //
    //     User.findById.mockRestore();
    // });
});
