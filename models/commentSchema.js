const mongoose = require("mongoose");

const commentSchema = mongoose.Schema({
  name: String,
  msg: String,
});

module.exports = mongoose.model("comment", commentSchema);
