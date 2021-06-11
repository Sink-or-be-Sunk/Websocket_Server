class Game {
  constructor() {
    this.isOver = false;
  }

  parseMessage(message) {
    console.log(message);
    return { resp: "next action" };
  }
}

module.exports = Game;
