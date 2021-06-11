const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  //TODO: need to add logic for finding a new match
  console.log(`connection made with req: ${req}`);
  res.send("Hello World!");
});

module.exports = router;
