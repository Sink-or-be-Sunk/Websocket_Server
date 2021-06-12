const Ship = require("./Ship.js");

class Fleet {
  constructor(type = "basic") {
    switch (type) {
      case "basic": {
        this.ships = [];
        this.ships.push(new Ship(2)); // Destroyer
        this.ships.push(new Ship(3)); // Cruiser
        this.ships.push(new Ship(3)); // Submarine
        this.ships.push(new Ship(4)); // Battleship
        this.ships.push(new Ship(5)); // Carrier
        break;
      }
      default: {
        throw new Error(`Invalid Fleet Type: ${type}`);
      }
    }
  }

  attack(coordinate) {
    for (let i = 0; i < this.ships.length; i++) {
      const res = this.ships[i].attack(coordinate);
      switch (res) {
        case "hit": {
          break;
        }
        case "miss": {
          continue;
        }
      }
      if (res) {
        return;
      }
    }
  }

  show() {
    for (let i = 0; i < this.ships.length; i++) {
      this.ships[i].show();
    }
  }
}

module.exports = Fleet;
