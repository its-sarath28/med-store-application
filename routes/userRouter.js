const express = require("express");
const bcrypt = require("bcryptjs");
const { body, validationResult } = require("express-validator");

const userRouter = express.Router();

const User = require("../models/userModel");

userRouter.get("/register", (req, res, next) => {
  res.render("register", { errors: "", values: "" });
});

userRouter.post(
  "/register",
  [
    body("firstName")
      .trim()
      .notEmpty()
      .withMessage("First name is required")
      .isAlpha()
      .withMessage("Only letters are allowed"),
    body("lastName")
      .trim()
      .notEmpty()
      .withMessage("Last name is required")
      .isAlpha()
      .withMessage("Only letters are allowed"),
    body("email")
      .notEmpty()
      .withMessage("Email is required")
      .isEmail()
      .withMessage("Enter a valid email"),
    body("password")
      .trim()
      .notEmpty()
      .withMessage("Password is required")
      .isLength({ min: 6 })
      .withMessage("Password should be at least 6 characters long"),
    body("cnfPassword")
      .trim()
      .notEmpty()
      .withMessage("Confirm password is required")
      .custom((value, { req }) => {
        if (value !== req.body.password) {
          throw new Error("Passwords do not match");
        }
        return true;
      }),
  ],
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.render("register", {
        errors: errors.mapped(),
        values: req.body,
      });
    } else {
      const { firstName, lastName, email, password } = req.body;

      try {
        const userFound = await User.findOne({ email });

        if (userFound) {
          console.log(`User email already exists`);
          return res.render("register", {
            errors: {
              email: {
                msg: "Email already exists",
              },
            },
            values: req.body,
          });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await User.create({
          firstName,
          lastName,
          email,
          password: hashedPassword,
        });

        await user.save();

        req.session.userId = user._id;
        res.redirect("/medicine");
      } catch (err) {
        console.error(err);
        res.status(500).send("Error while registering user");
      }
    }
  }
);

userRouter.get("/login", (req, res, next) => {
  res.render("login", { errors: "", values: "" });
});

userRouter.post(
  "/login",
  [
    body("email").trim().notEmpty().withMessage("Enter your email"),
    body("password").trim().notEmpty().withMessage("Enter your password"),
  ],
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.render("login", {
        errors: errors.mapped(),
        values: req.body,
      });
    } else {
      const { email, password } = req.body;

      try {
        const userFound = await User.findOne({ email });

        if (!userFound) {
          return res.render("login", {
            errors: {
              invalid: {
                msg: "Invalid credentials",
              },
            },
            values: req.body,
          });
        }

        const isPasswordMatch = await bcrypt.compare(
          password,
          userFound.password
        );

        if (!isPasswordMatch) {
          return res.render("login", {
            errors: {
              invalid: {
                msg: "Invalid credentials",
              },
            },
            values: req.body,
          });
        } else {
          req.session.userId = userFound._id;
          res.redirect("/medicine");
        }
      } catch (err) {
        console.error(err);
        res.status(500).send("Error while logging user");
      }
    }
  }
);

userRouter.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    console.log(err);
    res.redirect("/users/login");
  });
});

module.exports = userRouter;
