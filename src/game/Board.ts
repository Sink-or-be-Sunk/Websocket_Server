class Board {
  size: number;
  private grid: number[][];

  constructor(size: number = 8) {
    this.size = size;
    this.grid = Array.from(Array(size), () => new Array(size));

    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        this.grid[j][i] = 0;
      }
    }
    this.mark(1, 2);
    this.printBoard();
    console.log(this.getMarked(1, 2));
    console.log(this.getMarked(2, 2));
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

  mark(row: number, col: number) {
    this.grid[col][row] = 1;
  }

  getMarked(row: number, col: number) {
    return this.grid[col][row] === 1;
  }
}

module.exports = Board;
