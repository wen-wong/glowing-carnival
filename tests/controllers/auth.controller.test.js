const User = require("../../src/models/user.model")
const { register } = require("../../src/controllers/auth.controller");

const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");

let mongoServer;

beforeAll(async () => {
    mongoServer = new MongoMemoryServer();
    await mongoServer.start();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
    // , {
    //     useNewUriParser: true,
    //     userUnifiedTopology: true,
    // });
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

test("valid register", async() => {
    const user = new User ({name:"Joe", email:"joemama123@gmail.com", password:"mom"});
    register(user);
    await expect(user.save()).resolves.toBeDefined();
})

test("same email register", async() => {
    const user1 = {name:"Bob", email:"bob@mail.com", password:"bob"};
    const user2 = {name:"Man", email:"bob@mail.com", password:"man"};
    register(user1);
    try {
        await register(user2);
    } catch (e) {
        expect(e).toMatch('error');
    }
    //return register(user2).catch(e => expect(e).toMatch('error'));
})

// test("email is not all lowercase", async() => {
//     const user = {name:"Sal", email:"SalMan@gmail.com", password:"sal"};
//     return register(user).catch(e => expect(e).toMatch('error'));
// })

//email is not a string
//email is not given
//password is not a string
//password is not given
//name is not a string

test("test", () => {
    hello = true;
    expect(hello).toBe(true);

})