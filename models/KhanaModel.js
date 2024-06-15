const mongoose = require("mongoose");

const khanaSchema = mongoose.Schema({
  name: String,
  ingredients: String,
  cusine: String,
  veg: Boolean,
  instructions: String,
  filename: String,
  path: String,
  
});

module.exports = mongoose.model("Recipe", khanaSchema);
