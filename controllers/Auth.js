require("dotenv").config();
const User = require("../models/User");
const OTP = require("../models/OTP");
const Profile = require("../models/Profile");
const otpGenerator = require("otp-generator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

exports.sendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    const checkUserPresenet = await User.findOne({ email });

    if (checkUserPresenet) {
      return res.status(401).json({
        success: false,
        message: "User already exist",
      });
    }

    let otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });

    const result = OTP.findOne(otp);

    while (result) {
      otp = otpGenerator.generate(6, {
        upperCaseAlphabets: false,
        lowerCaseAlphabets: false,
        specialChars: false,
      });

      result = OTP.findOne(otp);
    }

    const otpPayload = { email, otp };
    const optBody = await OTP.create(otpPayload);
    return res.status(200).json({
      success: true,
      message: "otp send sucessful",
      otp,
    });

    // const otpBody =
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "opt failed sending " + error.message,
    });
  }
};

exports.signUp = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      confirmPasssword,
      accountType,
      contactNumber,
      otp,
    } = req.body;

    if (
      !firstName ||
      !lastName ||
      !email ||
      !password ||
      !confirmPasssword ||
      !otp
    ) {
      return res.status(403).json({
        success: false,
        message: "All fields are required",
      });
    }

    if (password !== confirmPasssword) {
      return res.status(403).json({
        success: false,
        message: "Password not same",
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User aleady exist",
      });
    }

    const recentOtp = await OTP.find({ email })
      .sort({ createdAt: -1 })
      .limit(1);

    if (recentOtp.length === 0) {
      return res.status(400).json({
        success: false,
        message: "OTP not found",
      });
    } else if (opt !== recentOtp.otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid otp",
      });
    }

    const profileDetail = await Profile.create({
      gender: null,
      dateOfBirth: null,
      about: null,
      contactNumber: null,
    });

    const hashpassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      firstName,
      lastName,
      password: hashpassword,
      email,
      accountType,
      additionalDetails: profileDetail._id,
      image: `https://api.dicebear.com/5.x/initials/svg?seeds=${firstName} ${lastName}`,
    });

    return res.status(200).json({
      success: true,
      message: "user registered successfully" + user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "user not registered " + error.message,
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(404).json({
        success: false,
        message: "All field are required",
      });
    }

    const user = await User.findOne({ email }).populate("additionalDetails");
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not regiestered",
      });
    }

    if (await bcrypt.compare(password, user.password)) {
      const payload = {
        email: user.email,
        id: user._id,
        role: user.accountType,
      };
      const token = await jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: "2h",
      });

      user.token = token;
      user.password = null;

      const options = {
        expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), //3days
        httpOnly: true,
      };

      res.cookie("token", token, options).status(200).json({
        success: true,
        token,
        user,
        message: "logged in successfully",
      });
    } else {
      return res.status(401).json({
        success: false,
        message: "Password incorrect",
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Loggin failure " + error.message,
    });
  }
};
