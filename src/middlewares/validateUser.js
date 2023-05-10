const Ajv = require("ajv");
const ajv = new Ajv({
	allErrors: false,
	coerceTypes: true,
	useDefaults: true,
	removeAdditional: true
});

const user_ajv_schema = {
	type: "object",
	properties: {
		email: {
			type: "string",
			pattern: "^[a-zA-Z0-9.%+-]+@[a-zA-Z0-9.-]+.[a-zA-Z]{2,}$",
			maxLength: 254
		},
		password: { type: "string" },
		name: { type: "string" },
		phone: {
			type: "string"
		},
		role: { enum: ["user", "moderator", "admin"] },
		refreshTokens: { type: "array", items: { type: "string" } }
	},
	required: ["email", "password"],
	additionalProperties: false
};

const validateUser = (user) => {
	console.log(typeof user);
	const validate = ajv.compile(user_ajv_schema);
	const valid = validate(user);
	if (!valid) {
		console.log(validate.errors[0].message);
		return { message: validate.errors[0].message };
	}
	return { message: "Valid" };
};

module.exports = validateUser;
