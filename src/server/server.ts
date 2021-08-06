if (process.env.NODE_ENV !== "production") require("dotenv").config();
import express from "express";
import * as http from "http";
import WebSocket from "ws";
import Lobby from "./models/Lobby";
import WSClientMessage from "./models/WSClientMessage";
import ServerMessenger from "./models/ServerMessenger";
const expressLayouts = require("express-ejs-layouts");
import path from "path";

import indexRouter from "./routes/index";
import gameRouter from "./routes/game";

const lobby = new Lobby();

const app = express();

// initialize a simple http server
const server = http.createServer(app);

// initialize the WebSocket server instance
const wss = new WebSocket.Server({ server });

wss.on("connection", (ws: WebSocket) => {
	console.log(`Websocket Connected`);
	ws.send(ServerMessenger.CONNECTED.toString());

	ws.on("message", function incoming(raw) {
		const req = new WSClientMessage(raw.toString());
		if (
			req.id == WSClientMessage.REQ_TYPE.INVALID ||
			req.id == WSClientMessage.REQ_TYPE.BAD_FORMAT
		) {
			console.error(`${req.id}: client message:\n${raw}`);
			ws.send(ServerMessenger.FORMAT_ERROR.toString()); //TODO: Change server message based on what actual client msg error occurs
		} else {
			const resp = lobby.handleReq(ws, req);
			ws.send(resp.toString());
		}
	});

	ws.on("close", () => {
		lobby.leaveGame(ws);
	});
});

const port = process.env.PORT || 8080;

// start our server
server.listen(port, () => {
	console.log(`Server started on port: ${port}/`);
});

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
