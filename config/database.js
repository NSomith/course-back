require("dotenv").config();
const mongoose = require("mongoose");

exports.connect = () => {
  mongoose
    .connect(process.env.MONGODB_URL, {
      useNewUrlParser: true,
      useUnifiesTopology: true,
    })
    .then(() => console.log("DB Connected Successfully"))
    .catch((err) => {
      console.log("DB failed", err);
      process.exit(1);
    });
};
