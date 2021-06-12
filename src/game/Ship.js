/**
 * origin (i.e. top left)
 * (A,1) -->
 * |
 * v
 *
 * north is up
 * south is down
 * east is right
 * west is left
 */
const DIR = Object.freeze({ north: 1, south: 2, east: 3, west: 4 });

class Ship {
  constructor(size) {
    this.size = size;
    this.location = { x: 0, y: 0 };
    this.hits = new Array(size).fill(0);
    this.orientation = DIR.north;
    this.show();
  }

  //   attack(coordinate) {}

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
      case DIR.north: {
        dirString = "north";
        break;
      }
      case DIR.south: {
        dirString = "south";
        break;
      }
      case DIR.east: {
        dirString = "east";
        break;
      }
      case DIR.west: {
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
