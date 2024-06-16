const mongoose = require("mongoose");

const khanaSchema = mongoose.Schema({
  name: String,
  ingredients: String,
  cusine: String,
  veg: String,
  instructions: String,
  filename: String,
  path: String,
  img: String,
  likes: Number,
  Comment: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }],
});

module.exports = mongoose.model("Recipe", khanaSchema);
