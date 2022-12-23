const express = require("express");
const router = express.Router();
const {
  getUsers,
  signUp,
  loginIn,
} = require("../controllers/users-controller");

router.get("/", getUsers);

router.post("/signup", signUp);

router.post("/login", loginIn);

module.exports = router;
