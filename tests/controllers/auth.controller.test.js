const User = require("../../src/models/user.model")
const { register, refreshToken } = require("../../src/controllers/auth.controller");
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
        //User.mockImplementationOnce(() => { throw error; });
        User.mockImplementationOnce;

        const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

        await register(req, res, next);

        //expect(User).toHaveBeenCalledTimes(1);
        //expect(User).toHaveBeenCalledWith({ name: 'John Doe', email: 'john@example.com', password: 'password123' });

        expect(res.status).not.toHaveBeenCalled();
        expect(res.json).not.toHaveBeenCalled();

        expect(consoleSpy).toHaveBeenCalledWith('error');

        consoleSpy.mockRestore();
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
    let user;
    let refreshToken;
    const req = { body: { refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2NDU0MDg1NzE3MGMyOTE5N2U0MzZhMDUiLCJpYXQiOjE2ODMyMzIwODEsImV4cCI6MTY4MzgzNjg4MX0.CV9KXNob6VSU82oUe3A9vGLAS6b8uTpVJ7Ozb8CpXqU' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };


    beforeAll(async () => {
        user = new User({
            email: 'test@example.com',
            password: 'testpassword',
            phone: '6176103635'
        });
        await user.save();
        refreshedToken = user.generateRefreshToken;
    });

    afterAll(async () => {
        await User.deleteMany({});
    });

    test('should return a new access token and refresh token', async () => {
        //const response = await register.refreshToken(user);
            //.post('/refresh-token')
            //.send({ refreshToken })
            //.expect(200);
        await refreshToken(req, res);
       // expect(response.body).toHaveProperty('accessToken');
        //expect(response.body).toHaveProperty('refreshToken');
        expect(res.status).toHaveBeenCalledWith(200);
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
    // test('should return 401 if the refresh token is invalid', async () => {
    //     const response = await request(app)
    //         .post('/refresh-token')
    //         .send({ refreshToken: 'invalid-token' })
    //         .expect(401);
    //
    //     expect(response.body).toEqual({ message: 'Invalid refresh token' });
    // });
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
