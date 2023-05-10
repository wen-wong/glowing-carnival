const validateUser = require("../../src/middlewares/validateUser");
const User = require("../../src/models/user.model");

describe("ajv User schema validation", () => {
	test("successful schema validation", () => {
		const test_user = {
			email: "Bob@bob.com",
			password: "password",
			name: "Bob Bob",
			phone: "(123)456-7890",
			role: "user",
			refreshToken: ["token1", "token2"]
		};
		const user = new User({ email: test_user.email, password: test_user.password });
		expect(validateUser(test_user).message).toBe("Valid");
	});

	test("Unsuccessful schema validation", () => {
		const test_user = {
			email: "Bobbob.com",
			password: "password",
			name: "Bob Bob",
			phone: "(123)456-7890",
			role: "user",
			refreshToken: ["token1", "token2"]
		};
		const user = new User({ email: test_user.email, password: test_user.password });
		expect(validateUser(test_user)).not.toBe("Valid");
	});
});
