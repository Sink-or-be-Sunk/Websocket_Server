/**
 * Game Board where integers are used to represent the state of the game
 *   0: is the initial "untouched" state of the board space
 *   1: counts as a miss
 *   2: counts as a hit
 */
class Board {
  constructor(size = 8, ships) {
    this.size = size;
    this.grid = Array.from(Array(size), () => new Array(size));
    this.ships = ships;
    this.clear();
    this.printBoard();
  }

  printBoard() {
    let c = 10;
    process.stdout.write("   ");
    for (let i = 0; i < this.size; i++) {
      process.stdout.write((i + 10).toString(36) + ", ");
    }
    process.stdout.write("\n");
    for (let i = 0; i < this.size; i++) {
      process.stdout.write(`${i + 1}, `);
      for (let j = 0; j < this.size; j++) {
        process.stdout.write(`${this.grid[i][j]}, `);
      }
      process.stdout.write("\n");
    }
  }

  /**
   * Function used to attempt to mark a spot on the game board
   * @param row letter corresponding to row
   * @param col 1 indexed column
   */
  mark(row, col) {
    row = row.toLowerCase().charCodeAt(0) - 97;
    col--;
    if (this.grid[col][row] === 1) {
      return false;
    } else {
      this.grid[col][row] = 1;
      return true;
    }
  }

  clear() {
    for (let i = 0; i < this.size; i++) {
      for (let j = 0; j < this.size; j++) {
        this.grid[i][j] = 0;
      }
    }
  }
}

module.exports = Board;
