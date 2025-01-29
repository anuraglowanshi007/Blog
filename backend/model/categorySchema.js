const mongoose = require('mongoose');
const { Schema } = mongoose;

const categorySchema = new Schema({
  category: { type: String, required: true },
  no_of_posts: {type: Number, required: true, default: 0}
});

module.exports = mongoose.model('category', categorySchema);