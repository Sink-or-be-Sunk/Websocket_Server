class Coordinate {
  constructor(letter, number) {
    this.col = letter.toLowerCase().charCodeAt(0) - 97;
    this.row = number - 1;
  }
}
module.exports = Coordinate;
