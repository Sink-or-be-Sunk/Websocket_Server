if (process.env.NODE_ENV !== "production") require("dotenv").config();
import express from "express";
const expressLayouts = require("express-ejs-layouts");
import path from "path";
import ServerManager from "./objects/ServerManager";
import methodOverride from "method-override";

import indexRouter from "./routes/index";
import gameRouter from "./routes/game";
import accountRouter from "./routes/account";

const app = express();
const server = new ServerManager(app);
server.start();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "../src/server/views"));
app.set("layout", "layouts/main");
app.use(expressLayouts);

import mongoose from "mongoose";
mongoose.connect(
	process.env.DATABASE_URL ?? "error: couldn't load database url",
);
const db = mongoose.connection;
db.on("error", (error) => console.log(error));
db.once("open", () => console.log("Connected to Mongoose"));

app.use(methodOverride("_method"));
app.use(express.urlencoded({ limit: "10mb", extended: false }));
app.use(express.static(path.join(__dirname, "../dist/public")));
app.use("/", indexRouter);
app.use("/game", gameRouter);
app.use("/account", accountRouter);
app.use("*", (req, res) => {
	res.redirect("/"); //catch all non-managed uri and redirect to homepage
});
