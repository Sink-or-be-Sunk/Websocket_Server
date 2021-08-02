import { isNumericLiteral } from "typescript";
import Board from "./Board";
import Game from "./Game";
import Move from "./Move";

class Ship {
	squares: Board.Square[];
	type: Ship.Type;
	state: Ship.STATE;

	constructor(type: Ship.Type, grid: Board.Square[][]) {
		this.type = type;
		this.squares = [];
		this.state = Ship.STATE.WHOLE;
		if (
			type.size > grid.length ||
			this.type.descriptor == Ship.DESCRIPTOR.INVALID_SIZE
		) {
			this.type = new Ship.Type(Ship.DESCRIPTOR.INVALID_SIZE);
		} else {
			this.squares = this.initSquares(grid);
		}
	}

	private initSquares(grid: Board.Square[][]) {
		const squares = new Array<Board.Square>(this.type.size);
		let i = 0;
		for (let c = 0; c < grid.length; c++) {
			let r = 0;
			//align ships vertically in line
			if (grid[c][r].state == Board.STATE.EMPTY) {
				for (; r < this.type.size; r++) {
					const square = grid[c][r];
					square.state = Board.STATE.FILLED;
					squares[i++] = square;
				}
				break;
			}
		}
		return squares;
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
			if (square.c == move.c && square.r == move.r) {
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
}

namespace Ship {
	export enum DESCRIPTOR {
		INVALID_SIZE = "INVALID SIZE",
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
		descriptor: Ship.DESCRIPTOR;
		name: Ship.NAME;
		size: number;

		constructor(descriptor: Ship.DESCRIPTOR, name?: Ship.NAME) {
			this.descriptor = descriptor;
			if (name) {
				this.name = name;
			} else {
				this.name = Ship.NAME.DEFAULT;
			}

			this.size = Type.classToSize(descriptor);
		}

		private static classToSize(type: Ship.DESCRIPTOR) {
			if (type == Ship.DESCRIPTOR.CARRIER) {
				return 5;
			} else if (type == Ship.DESCRIPTOR.BATTLESHIP) {
				return 4;
			} else if (
				type == Ship.DESCRIPTOR.DESTROYER ||
				type == Ship.DESCRIPTOR.SUBMARINE
			) {
				return 3;
			} else if (type == Ship.DESCRIPTOR.PATROL) {
				return 2;
			} else {
				return -1;
			}
		}

		toString() {
			let str = this.descriptor.toString();
			if (this.name != Ship.NAME.DEFAULT) {
				str += `-${this.name}`;
			}
			return str;
		}
	}
}

export default Ship;
