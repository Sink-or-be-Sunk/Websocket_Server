import Board from "./Board";
import Move from "./Move";

class Ship {
	squares: Board.Square[];
	type: Ship.Type;
	state: Ship.STATE;

	constructor(type: Ship.Type, board: Board) {
		this.type = type;
		this.state = Ship.STATE.WHOLE;
		if (type.size > board.size) {
			throw Error("Cannot add a ship bigger than game board!");
		}
		this.squares = this.initSquares(board);
	}

	checkSunk() {
		for (let i = 0; i < this.squares.length; i++) {
			const square = this.squares[i];
			if (square.state != Board.STATE.HIT) {
				return false;
			}
		}
		return true;
	}

	attack(move: Move) {
		for (let i = 0; i < this.squares.length; i++) {
			const square = this.squares[i];
			if (square.c == move.c && square.c == move.r) {
				square.hit();
				this.state = Ship.STATE.DAMAGED;
				if (this.checkSunk()) {
					this.state = Ship.STATE.SUNK;
				}
				return true;
			}
		}
		return false;
	}

	private initSquares(board: Board) {
		const squares = new Array<Board.Square>(this.type.size);
		let i = 0;
		for (let c = 0; c < board.size; c++) {
			let r = 0;
			//align ships vertically in line
			if (board.grid[c][r].state == Board.STATE.EMPTY) {
				for (; r < this.type.size; r++) {
					squares[i++] = board.grid[c][r];
				}
			}
		}
		return squares;
	}
}

namespace Ship {
	export enum CLASS {
		CARRIER = "AIRCRAFT CARRIER",
		BATTLESHIP = "BATTLESHIP",
		DESTROYER = "DESTROYER",
		SUBMARINE = "SUBMARINE",
		PATROL = "PATROL",
	}

	export enum NAME {
		MIDWAY = "USS MIDWAY",
		ARIZONA = "USS ARIZONA",
		JOHNSON = "USS JOHNSON",
		DEFAULT = "DEFAULT",
	}
	export enum STATE {
		WHOLE = "WHOLE",
		DAMAGED = "DAMAGED",
		SUNK = "SUNK",
	}

	export class Type {
		type: Ship.CLASS;
		name: Ship.NAME;
		size: number;

		constructor(type: Ship.CLASS, name?: Ship.NAME) {
			this.type = type;
			if (name) {
				this.name = name;
			} else {
				this.name = Ship.NAME.DEFAULT;
			}

			this.size = this.initSize(type);
		}

		private initSize(type: Ship.CLASS) {
			if (type == Ship.CLASS.CARRIER) {
				return 5;
			} else if (type == Ship.CLASS.BATTLESHIP) {
				return 4;
			} else if (
				type == Ship.CLASS.DESTROYER ||
				type == Ship.CLASS.SUBMARINE
			) {
				return 3;
			} else if (type == Ship.CLASS.PATROL) {
				return 2;
			} else {
				throw Error("Invalid Ship Type: this should never occur");
			}
		}

		toString() {
			let str = this.type.toString();
			if (this.name != Ship.NAME.DEFAULT) {
				str += `-${this.name}`;
			}
			return str;
		}
	}
}

export default Ship;
