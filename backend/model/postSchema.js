const mongoose = require('mongoose');
const { Schema } = mongoose;

const commentSchema = new Schema({
  username: {type: String , required:true},
  date: { type: Date, default: Date.now },
  commentDesc: {type: String, required:true}
});

const postSchema = new Schema({
  username: { type: String, required: true },
  email: { type: String, required: true },
  postTitle: { type: String, required: true },
  postDesc: { type: String, required: true },
  postUrl: { type: String },
  likes: {type: Number, default:"0"},
  comments : [commentSchema],
  category: [{type: String, default:"all", required: true}],
});

module.exports = mongoose.model('post', postSchema);