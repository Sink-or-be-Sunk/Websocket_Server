class Board {
  constructor(size = 8) {
    this.size = size;
    this.grid = Array.from(Array(size), () => new Array(size));

    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        this.grid[i][j] = 0;
      }
    }
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
}

module.exports = Board;
