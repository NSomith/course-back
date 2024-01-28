require("dotenv").config();
const jwt = require("jsonwebtoken");
const User = require("../models/User");

exports.auth = async (req, res, next) => {
  try {
    const token =
      req.cookie.token ||
      req.body.token ||
      req.header("Authorisation").replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Token is missing",
      });
    }

    try {
      const decode = await jwt.verify(token, process.env.JWT_SECRET);
      req.user = decode;
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: "Token is invalid",
      });
    }
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Something went wrong while vaidation of token",
    });
  }
};

exports.isStudent = async (req, res, next) => {
  try {
    if (req.user.accountType !== "Student") {
      return res.status(401).json({
        success: false,
        message: "This is protected route for students only",
      });
    }
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Something went wrong is isStudent",
    });
  }
};

exports.isInstructor = async (req, res, next) => {
  try {
    if (req.user.accountType !== "Instructor") {
      return res.status(401).json({
        success: false,
        message: "This is protected route for instructor only",
      });
    }
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Something went wrong is isStudent",
    });
  }
};

exports.isAdmin = async (req, res, next) => {
  try {
    if (req.user.accountType !== "Admin") {
      return res.status(401).json({
        success: false,
        message: "This is protected route for admin only",
      });
    }
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Something went wrong is isStudent",
    });
  }
};
