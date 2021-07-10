import * as dotenv from "dotenv";
import express from "express";
import path from "path";
import Game from "./models/game";

dotenv.config();

console.log("here", process.env.PORT);

const game = new Game();

const PORT = process.env.PORT || 8080;
const server = express();

server.use(express.static(path.join(__dirname, "../public")));
server.set("views", path.join(__dirname, "../views"));
server.set("view engine", "ejs");
server.get("/", (req, res) => res.send("bang bang"));

server.listen(PORT, () => console.log(`server listening on port ${PORT}`));
