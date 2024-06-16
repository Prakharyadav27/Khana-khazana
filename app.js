const express = require("express");
const app = express();
const path = require("path");
const cokieParser = require("cookie-parser");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const multer = require("multer");
// const upload = multer({ dest: "uploads/" });

const userSchema = require("./models/userModel");
const recipeSchema = require("./models/KhanaModel");
const { log } = require("console");
// const { log } = require("console");

app.use(express.json());
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(cokieParser());

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./my-uploads");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix);
  },
});

const upload = multer({ storage: storage });

app.get("/", function (req, res) {
  res.render("index");
});

app.get("/register", function (req, res) {
  res.render("register");
});
app.get("/info/:id", async function (req, res) {
  const recipe = await recipeSchema.findOne({ _id: req.params.id });

  res.render("info", { recipe });
});

app.post("/login", async function (req, res) {
  const { email, password } = req.body;
  const user = await userSchema.findOne({ email });
  if (!user) {
    return res.status(404).send("User not found");
  }
  bcrypt.compare(password, user.password, function (err, result) {
    if (result) {
      const token = jwt.sign({ email: user.email }, "secret");
      res.cookie("token", token);
      res.redirect("/home");
    } else {
      res.send("Invalid password");
    }
  });
});

app.get("/logout", function (req, res) {
  res.clearCookie("token");
  res.redirect("/");
});

app.post("/register", async function (req, res) {
  const { name, email, password } = req.body;
  bcrypt.genSalt(10, function (err, salt) {
    bcrypt.hash(password, salt, async function (err, hash) {
      const user = await userSchema.create({
        name,
        email,
        password: hash,
      });
      const token = jwt.sign({ email: user.email }, "secret");
      res.cookie("token", token);
      res.redirect("/home");
    });
  });
});

app.get("/home", isLoggedIn, async function (req, res) {
  const user = await userSchema.findOne({ email: req.email });
  const recipes = await recipeSchema.find();
  res.render("home", { user, recipes });
});

app.get("/uploadrecipe", isLoggedIn, async function (req, res) {
  res.render("uploadrecipe");
});

app.post("/upload", upload.single("file"), function (req, res) {
  const { name, ingredients, instructions, veg, cusine, img } = req.body;
  const filename = req.file.filename;

  let recipe = recipeSchema.create({
    name,
    ingredients,
    instructions,
    filename,
    veg,
    cusine,
    img,
    path: req.file.path,
  });
  res.redirect("/home");
});

function isLoggedIn(req, res, next) {
  const token = req.cookies.token;
  if (token) {
    jwt.verify(token, "secret", function (err, decoded) {
      if (err) {
        return res.redirect("/");
      }
      req.email = decoded.email;
      next();
    });
  }
}

app.listen(3000, function () {
  console.log("Server is running on port http://localhost:3000");
});
