
import test from "node:test";
import assert from "node:assert/strict";
import { validateRegister } from "../middlewares/validation.middleware.js";

const runValidation = async (body) => {
  const req = { body };

  const res = {
    statusCode: undefined,
    payload: undefined,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.payload = payload;
      return this;
    },
  };

  let nextCalled = false;

  const next = () => {
    nextCalled = true;
  };

  for (const middleware of validateRegister) {
    await middleware(req, res, next);

    if (res.statusCode === 400) {
      break;
    }
  }

  return { res, nextCalled };
};

test("register validation accepts a strong password", async () => {
  const { res, nextCalled } = await runValidation({
    name: "Alice",
    email: "alice@example.com",
    password: "Password@123",
    role: "student",
  });

  assert.equal(res.statusCode, undefined);
  assert.equal(nextCalled, true);
});

test("register validation rejects passwords that do not meet the password policy", async (t) => {
  const weakPasswords = [
    "password",      // no uppercase, number, special character
    "PASSWORD123",   // no lowercase, special character
    "Pass123",       // too short
    "12345678",      // only numbers
    "Password123",   // no special character
    "Password@",     // no number
  ];

  for (const password of weakPasswords) {
    await t.test(`rejects "${password}"`, async () => {
      const { res, nextCalled } = await runValidation({
        name: "Alice",
        email: "alice@example.com",
        password,
        role: "student",
      });

      assert.equal(res.statusCode, 400);
      assert.equal(nextCalled, false);

      assert.match(
        res.payload.message,
        /Password/i
      );
    });
  }
});

test("register validation rejects missing password", async () => {
  const { res, nextCalled } = await runValidation({
    name: "Alice",
    email: "alice@example.com",
    role: "student",
  });

  assert.equal(res.statusCode, 400);
  assert.equal(nextCalled, false);
});


