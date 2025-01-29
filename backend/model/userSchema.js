const mongoose = require("mongoose");
const { Schema } = mongoose;
const userSchema = new Schema({
  username: { type: String, required: true, unique:true  },
  email: { type: String, required: true, unique: true },
  userdesc: { type: String },
  name: { type: String },
  password: { type: String, required: true },
  date: { type: Date, default: Date.now },
  contact: { type: Number },
  year_of_passing: { type:Number },
  branch: { type: String },
  liked_posts: [{ type: String }],
});

module.exports = mongoose.model("user", userSchema);