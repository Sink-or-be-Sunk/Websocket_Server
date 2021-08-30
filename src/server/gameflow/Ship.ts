import Board from "./Board";
import Layout from "./Layout";
import Move from "./Move";

class Ship {
	squares: Board.Square[];
	type: Ship.Type;
	state: Ship.STATE;

	constructor(type: Layout.TYPE, squares: Board.Square[]) {
		this.type = this.initType(type);
		this.squares = squares;
		this.state = Ship.STATE.WHOLE;
		if (this.type.size != squares.length) {
			this.type = new Ship.Type(Ship.DESCRIPTOR.SIZE_MISMATCH);
		}
	}

	initType(type: Layout.TYPE): Ship.Type {
		if (type == Layout.TYPE.PATROL) {
			return new Ship.Type(Ship.DESCRIPTOR.PATROL);
		} else if (type == Layout.TYPE.DESTROYER) {
			return new Ship.Type(Ship.DESCRIPTOR.DESTROYER);
		} else if (type == Layout.TYPE.SUBMARINE) {
			return new Ship.Type(Ship.DESCRIPTOR.SUBMARINE);
		} else if (type == Layout.TYPE.BATTLESHIP) {
			return new Ship.Type(Ship.DESCRIPTOR.BATTLESHIP);
		} else if (type == Layout.TYPE.CARRIER) {
			return new Ship.Type(Ship.DESCRIPTOR.CARRIER);
		} else {
			throw new Error("Invalid Layout type: this should never happen");
		}
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
		SIZE_MISMATCH = "SIZE MISMATCH",
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
