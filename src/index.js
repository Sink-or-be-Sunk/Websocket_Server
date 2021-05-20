const express = require("express");
const app = express();
const port = 3000;

app.get("/", (req, res) => {
  console.log(req);
  console.log(res);
  console.log(`connection made with req: ${req}`);
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
