const mongoose = require("mongoose");
const mailSender = require("../utils/mailSender");

const otpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  otp: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
    expires: 5 * 60, //5min expires
  },
});

// user -> otp email send -> enter otp -> create dp entry
// pre save middleware

async function sendVerificationEmail(email, otp) {
  try {
    mailSender(email, "Verfication email from STUDY Course", otp);
  } catch (error) {
    console.log(err, "error while sending");
  }
}

otpSchema.pre("save", async function (next) {
  await sendVerificationEmail(this.email, this.otp);
  next();
});

module.exports = mongoose.model("OTPSchema", otpSchema);
