const Board = require("./Board.ts");
class Game {
  constructor(players) {
    this.isOver = false;
    this.players = players;
    this.turn = players[0];
    this.board = new Board();
  }

  parseMessage(message) {
    console.log(message);
    return { resp: "next action" };
  }
}

module.exports = Game;
