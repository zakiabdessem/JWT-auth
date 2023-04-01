const Joi = require("joi");

const nameSchema = Joi.object({
  name: Joi.string()
    .min(4)
    .max(70)
    .pattern(/^[a-zA-Z\s]*$/)
    .required()
    .error(
      new Error(
        "Name must be between 4 and 70 characters long and contain only letters and spaces"
      )
    ),
});

const emailSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .error(new Error("Please enter a valid email")),
});

const passwordSchema = Joi.object({
  password: Joi.string()
    .regex(/^[a-zA-Z0-9]{3,30}$/)
    .required()
    .error(
      new Error(
        "Password must be between 3 and 30 characters long and contain only letters and numbers."
      )
    ),
});

module.exports = {
  emailValidation: (email) =>
    emailSchema.validate(email, { abortEarly: false }),
  passwordValidation: (password) =>
    passwordSchema.validate(password, { abortEarly: false }),
  nameValidation: (name) => nameSchema.validate(name, { abortEarly: false }),
};
