class Coordinate {
  constructor(letter, number) {
    this.row = letter.toLowerCase().charCodeAt(0) - 97;
    this.col = number - 1;
  }
}
module.exports = Coordinate;
