const CONSTANTS = require("./Constants");

class Ship {
  constructor(size) {
    this.size = size;
    this.location = { x: 0, y: 0 };
    this.hits = new Array(size).fill(0);
    this.orientation = undefined;
  }

  position(coordinate, dir) {
    this.location.x = coordinate.col;
    this.location.y = coordinate.row;
    this.orientation = dir;
  }

  attack(coordinate) {
    for (let i = 0; i < this.size; i++) {
      let c = undefined;
      let r = undefined;
      switch (this.orientation) {
        case CONSTANTS.DIR.north: {
          c = this.location.x - i;
          r = this.location.y;
          break;
        }
        case CONSTANTS.DIR.south: {
          c = this.location.x + i;
          r = this.location.y;
          break;
        }
        case CONSTANTS.DIR.east: {
          c = this.location.x;
          r = this.location.y + i;
          break;
        }
        case CONSTANTS.DIR.west: {
          c = this.location.x;
          r = this.location.y - i;
          break;
        }
      }

      if (c === coordinate.col && r === coordinate.row) {
        this.hits[i] = 1;
        if (this.hits.filter((x) => x === 1).length == this.hits.length) {
          return "sunk";
        } else {
          return "hit";
        }
      }
    }
    return "miss";
  }

  show() {
    process.stdout.write("[");
    for (let i = 0; i < this.size; i++) {
      if (this.hits[i]) {
        process.stdout.write(" X ");
      } else {
        process.stdout.write(" O ");
      }
    }
    process.stdout.write("]");
    let dirString = null;
    switch (this.orientation) {
      case CONSTANTS.DIR.north: {
        dirString = "north";
        break;
      }
      case CONSTANTS.DIR.south: {
        dirString = "south";
        break;
      }
      case CONSTANTS.DIR.east: {
        dirString = "east";
        break;
      }
      case CONSTANTS.DIR.west: {
        dirString = "west";
        break;
      }
    }

    process.stdout.write(
      `  @ (${this.location.x}, ${this.location.y}) ${dirString} \n`
    );
  }
}

module.exports = Ship;
