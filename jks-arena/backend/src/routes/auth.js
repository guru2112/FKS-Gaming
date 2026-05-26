const express = require("express");

const bcrypt = require("bcryptjs");

const jwt = require("jsonwebtoken");

const axios = require("axios");

const crypto = require("crypto");

const { sendMail } = require("../utils/mailer");

const User = require("../models/User");

const Admin = require("../models/Admin");

const rateLimit = require("express-rate-limit");

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 auth requests per windowMs
  message: { message: "Too many requests from this IP, please try again after 15 minutes." }
});

const router = express.Router();

router.use(authLimiter);



// =========================================================
// 🔥 CREATE JWT TOKEN
// =========================================================

function createToken(user, role) {

  return jwt.sign(

    {
      sub: user._id.toString(),
      email: user.email,
      role,
      tokenVersion: user.tokenVersion || 0,
    },

    process.env.JWT_SECRET,

    {
      expiresIn:
        process.env.JWT_EXPIRES_IN ||
        "7d",
    }

  );

}



// =========================================================
// 🔥 FORGOT PASSWORD
// =========================================================

router.post(
  "/forgot-password",
  async (req, res) => {

    try {

      const { email } = req.body;

      const user =
        await User.findOne({

          email:
            email
              .toLowerCase()
              .trim(),

        });

      if (!user) {

        return res
          .status(404)
          .json({

            message:
              "Email not found.",

          });

      }

      const otp =
        Math.floor(
          100000 +
            Math.random() *
              900000
        ).toString();

      user.resetOTP = otp;

      user.resetOTPExpires =
        Date.now() + 600000;

      await user.save();

      await sendMail({

        to: user.email,

        subject:
          `Your JKS Arena Code: ${otp}`,

        html:
          `<div style="text-align:center; border:1px solid #ff6b35; padding:20px;">
            <h1>${otp}</h1>
            <p>Enter this code to verify your account.</p>
          </div>`,

      });

      res.json({

        message:
          "OTP sent!",

      });

    } catch (err) {

      console.error(err);

      res.status(500).json({

        message: "Error.",

      });

    }

  }
);



// =========================================================
// 🔥 VERIFY OTP
// =========================================================

router.post(
  "/verify-otp",
  async (req, res) => {

    const {
      email,
      otp,
    } = req.body;

    const user =
      await User.findOne({

        email:
          email
            .toLowerCase()
            .trim(),

        resetOTP: otp,

        resetOTPExpires: {
          $gt: Date.now(),
        },

      });

    if (!user) {

      return res
        .status(400)
        .json({

          message:
            "Invalid or expired OTP.",

        });

    }

    res.json({

      message:
        "OTP Verified. Now set your new password.",

    });

  }
);



// =========================================================
// 🔥 RESET PASSWORD
// =========================================================

router.post(
  "/reset-password",
  async (req, res) => {

    const {
      email,
      otp,
      password,
    } = req.body;

    const user =
      await User.findOne({

        email:
          email
            .toLowerCase()
            .trim(),

        resetOTP: otp,

        resetOTPExpires: {
          $gt: Date.now(),
        },

      });

    if (!user) {

      return res
        .status(400)
        .json({

          message:
            "Invalid or expired OTP.",

        });

    }

    user.passwordHash =
      await bcrypt.hash(
        password,
        12
      );

    user.resetOTP = null;

    user.resetOTPExpires =
      null;

    user.tokenVersion = (user.tokenVersion || 0) + 1;

    await user.save();

    res.json({

      message:
        "Success! Password changed.",

    });

  }
);



// =========================================================
// 🔥 GOOGLE AUTH
// =========================================================

router.post(
  "/google",
  async (req, res) => {

    try {

      const { token } =
        req.body;

      if (!token) {

        return res
          .status(400)
          .json({

            message:
              "Token required.",

          });

      }

      const googleRes =
        await axios.get(
          "https://www.googleapis.com/oauth2/v3/userinfo",
          {

            headers: {

              Authorization:
                `Bearer ${token}`,

            },

          }
        );

      const {
        email,
        name,
        sub: googleId,
      } = googleRes.data;

      const normalizedEmail =
        email
          .toLowerCase()
          .trim();

      // =========================================================
      // 🔥 ADMIN LOGIN
      // =========================================================

      let admin =
        await Admin.findOne({

          email:
            normalizedEmail,

          isActive: true,

        });

      if (admin) {

        return res
          .status(200)
          .json({

            token:
              createToken(
                admin,
                "admin"
              ),

            role: "admin",

            user: {

              id:
                admin._id.toString(),

              name:
                admin.name,

              email:
                admin.email,

              avatarUrl:
                admin.avatarUrl ||
                "",

              topbarUrl:
                admin.topbarUrl ||
                "",

            },

            message:
              "Admin Login Successful",

          });

      }

      // =========================================================
      // 🔥 USER LOGIN
      // =========================================================

      let user =
        await User.findOne({

          email:
            normalizedEmail,

        });

      if (!user) {

        user =
          await User.create({

            name,

            email:
              normalizedEmail,

            passwordHash:
              `google_${googleId}`,

            avatarUrl: "",

            topbarUrl: "",

          });

      }

      return res
        .status(200)
        .json({

          token:
            createToken(
              user,
              "user"
            ),

          role: "user",

          user: {

            id:
              user._id.toString(),

            name:
              user.name,

            email:
              user.email,

            avatarUrl:
              user.avatarUrl ||
              "",

            topbarUrl:
              user.topbarUrl ||
              "",

          },

          message:
            "Login Successful",

        });

    } catch (err) {

      console.error(err);

      res.status(401).json({

        message:
          "Google authentication failed.",

      });

    }

  }
);



// =========================================================
// 🔥 REGISTER
// =========================================================

router.post(
  "/register",
  async (req, res, next) => {

    try {

      const {
        name,
        email,
        password,
      } = req.body;

      if (
        !name ||
        !email ||
        !password
      ) {

        return res
          .status(400)
          .json({

            message:
              "Name, email, and password are required.",

          });

      }

      const normalizedEmail =
        email
          .toLowerCase()
          .trim();

      const existingUser =
        await User.findOne({

          email:
            normalizedEmail,

        });

      if (existingUser) {

        return res
          .status(409)
          .json({

            message:
              "Email is already registered.",

          });

      }

      const passwordHash =
        await bcrypt.hash(
          password,
          12
        );

      const newUser =
        await User.create({

          name:
            name.trim(),

          email:
            normalizedEmail,

          passwordHash,

          avatarUrl: "",

          topbarUrl: "",

        });

      const token =
        createToken(
          newUser,
          "user"
        );

      res.status(201).json({

        token,

        role: "user",

        user: {

          id:
            newUser._id.toString(),

          name:
            newUser.name,

          email:
            newUser.email,

          avatarUrl:
            newUser.avatarUrl ||
            "",

          topbarUrl:
            newUser.topbarUrl ||
            "",

        },

      });

    } catch (err) {

      next(err);

    }

  }
);



// =========================================================
// 🔥 LOGIN
// =========================================================

router.post(
  "/login",
  async (req, res, next) => {

    try {

      const {
        email,
        password,
      } = req.body;

      if (
        !email ||
        !password
      ) {

        return res
          .status(400)
          .json({

            message:
              "Email and password are required.",

          });

      }

      const normalizedEmail =
        email
          .toLowerCase()
          .trim();

      // =========================================================
      // 🔥 ADMIN LOGIN
      // =========================================================

      const admin =
        await Admin.findOne({

          email:
            normalizedEmail,

          isActive: true,

        });

      if (admin) {

        const adminMatch =
          await bcrypt.compare(
            password,
            admin.passwordHash
          );

        if (!adminMatch) {

          return res
            .status(401)
            .json({

              message:
                "Invalid email or password.",

            });

        }

        return res
          .status(200)
          .json({

            token:
              createToken(
                admin,
                "admin"
              ),

            role: "admin",

            user: {

              id:
                admin._id.toString(),

              name:
                admin.name,

              email:
                admin.email,

              avatarUrl:
                admin.avatarUrl ||
                "",

              topbarUrl:
                admin.topbarUrl ||
                "",

            },

          });

      }

      // =========================================================
      // 🔥 USER LOGIN
      // =========================================================

      const user =
        await User.findOne({

          email:
            normalizedEmail,

        });

      if (!user) {

        return res
          .status(401)
          .json({

            message:
              "Invalid email or password.",

          });

      }

      const passwordMatch =
        await bcrypt.compare(
          password,
          user.passwordHash
        );

      if (!passwordMatch) {

        return res
          .status(401)
          .json({

            message:
              "Invalid email or password.",

          });

      }

      return res
        .status(200)
        .json({

          token:
            createToken(
              user,
              "user"
            ),

          role: "user",

          user: {

            id:
              user._id.toString(),

            name:
              user.name,

            email:
              user.email,

            avatarUrl:
              user.avatarUrl ||
              "",

            topbarUrl:
              user.topbarUrl ||
              "",

          },

        });

    } catch (err) {

      next(err);

    }

  }
);



// =========================================================
// 🔥 EXPORT
// =========================================================

module.exports = router;