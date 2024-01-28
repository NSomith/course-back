const User = require("../models/User");
const mailSender = require("../utils/mailSender");
const bcrypt = require("bcrypt");

exports.resetPasswordToken = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not registered",
      });
    }

    //generate token
    const token = crypto.randomUUID();
    //   update the token to user
    const updatedDetails = await User.findOneAndUpdate(
      { email },
      {
        token,
        resetPasswordExpires: Date.now() + 5 * 60 * 1000, //5min
      },
      { new: true } //udapted doc will give in res
    );

    const url = `http://localhost:3000/update-password/${token}`;

    await mailSender(email, "Password Reset Link ", `Reset link : ${url}`);

    return res.json({
      success: true,
      message: "Reset Password successful",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Something went worng is password reset token " + error.message,
    });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { password, confirmPassword, token } = req.body; //frontend is giving the token directly
    if (password != confirmPassword) {
      return res.status(401).json({
        success: false,
        message: "password not mactching with confirm ",
      });
    }
    // get userdatails using token as saved above in resetPasswordToken
    const user = await User.findOne({ token });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Token invalid",
      });
    }

    const hashPassword = await bcrypt.hash(password, 10);

    await User.findOneAndUpdate(
      { token },
      { password: hashPassword },
      { now: true }
    );

    return res.status(200).json({
      success: true,
      message: "password updated succesfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Something went worng is password reset " + error.message,
    });
  }
};
