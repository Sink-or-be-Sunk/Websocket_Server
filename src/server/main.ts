if (process.env.NODE_ENV !== "production") require("dotenv").config();
import express from "express";
import * as http from "http";
import WebSocket from "ws";
import Lobby from "./models/Lobby";
import WSClientMessage from "./models/WSClientMessage";
import ServerMessenger from "./models/ServerMessenger";
const expressLayouts = require("express-ejs-layouts");
import path from "path";
import ServerManager from "./models/ServerManager";

import indexRouter from "./routes/index";
import gameRouter from "./routes/game";

const app = express();
const server = new ServerManager(app);
server.start();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "../src/server/views"));
app.set("layout", "layouts/main");
app.use(expressLayouts);

app.use(express.static(path.join(__dirname, "../dist/public")));
app.use("/", indexRouter);
app.use("/game", gameRouter);
app.use("*", (req, res) => {
	res.redirect("/"); //catch all non-managed uri and redirect to homepage
});
