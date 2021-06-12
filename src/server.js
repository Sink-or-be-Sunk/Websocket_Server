if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

// const express = require("express");
// const app = express();

// const findRouter = require("./api/routes/find");
// const playRouter = require("./api/routes/play");

// app.use("/", findRouter);
// app.use("/", playRouter);

// app.listen(port, () => {
//   console.log(`Sink or be Sunk Server listening at http://localhost:${port}`);
// });

const Game = require("./game/Game.js");
const Fleet = require("./game/Fleet.js");
const Coordinate = require("./game/Coordinate.js");
const CONSTANTS = require("./game/Constants");

const WebSocketServer = require("websocket").server;
const http = require("http");
const Ship = require("./game/Ship.js");
const port = process.env.PORT || 3000;

const server = http.createServer(function (req, res) {
  console.log(new Date() + " Received req for " + req.url);
  res.writeHead(404);
  res.end();
});
server.listen(port, function () {
  console.log(new Date() + ` Server is listening on port ${port}`);
});

wsServer = new WebSocketServer({
  httpServer: server,
  // TODO: You should not use autoAcceptConnections for production
  // applications, as it defeats all standard cross-origin protection
  // facilities built into the protocol and the browser.  You should
  // *always* verify the connection's origin and decide whether or not
  // to accept it.
  autoAcceptConnections: false,
});

function originIsAllowed(origin) {
  // TODO: put logic here to detect whether the specified origin is allowed.
  return true;
}

wsServer.on("request", function (req) {
  if (!originIsAllowed(req.origin)) {
    // Make sure we only accept reqs from an allowed origin
    req.reject();
    console.log(
      new Date() + " Connection from origin " + req.origin + " rejected."
    );
    return;
  }

  const connection = req.accept("game-protocol", req.origin);
  console.log(new Date() + " Connection accepted.");

  const game = new Game();

  connection.on("message", function (message) {
    if (message.type === "utf8") {
      console.log(`${connection.remoteAddress} sent: <${message.utf8Data}>`);
      connection.sendUTF("echo: " + message.utf8Data);
    } else {
      console.error(`Invalid Message Type Received: ${message.type}`);
    }
  });
  connection.on("close", function (reasonCode, description) {
    console.log(
      new Date() + " Peer " + connection.remoteAddress + " disconnected."
    );
  });
});

// const fleet = new Fleet();
// const res = fleet.attack(new Coordinate("A", 1));
// console.log(res);
const game = new Game(["player1", "player2"]);
const ship = new Ship(3);
ship.position(new Coordinate("C", 2), CONSTANTS.DIR.east);
ship.show();
console.log(ship.attack(new Coordinate("A", 1)));
console.log(ship.attack(new Coordinate("C", 2)));
console.log(ship.attack(new Coordinate("C", 3)));
