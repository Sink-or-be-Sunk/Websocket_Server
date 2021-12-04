import { Square, BOARD_STATE } from "./Board";
import { Position, POSITION_TYPE } from "./Layout";
import { Move } from "./Move";

export class Ship {
	squares: Square[];
	type: ShipType;
	pType: POSITION_TYPE;
	state: SHIP_STATE;

	constructor(type: POSITION_TYPE, squares: Square[]) {
		this.pType = type;
		this.type = this.initType(type);
		this.squares = squares;
		this.state = SHIP_STATE.WHOLE;
		if (this.type.size != squares.length) {
			this.type = new ShipType(SHIP_DESCRIPTOR.SIZE_MISMATCH);
		}
	}

	initType(type: POSITION_TYPE): ShipType {
		if (type == POSITION_TYPE.PATROL) {
			return new ShipType(SHIP_DESCRIPTOR.PATROL);
		} else if (type == POSITION_TYPE.DESTROYER) {
			return new ShipType(SHIP_DESCRIPTOR.DESTROYER);
		} else if (type == POSITION_TYPE.SUBMARINE) {
			return new ShipType(SHIP_DESCRIPTOR.SUBMARINE);
		} else if (type == POSITION_TYPE.BATTLESHIP) {
			return new ShipType(SHIP_DESCRIPTOR.BATTLESHIP);
		} else if (type == POSITION_TYPE.CARRIER) {
			return new ShipType(SHIP_DESCRIPTOR.CARRIER);
		} else {
			throw new Error("Invalid Layout type: this should never happen");
		}
	}

	checkSunk(): boolean {
		for (let i = 0; i < this.squares.length; i++) {
			const square = this.squares[i];
			if (square.state != BOARD_STATE.HIT) {
				return false;
			}
		}
		return true;
	}

	sink(): void {
		for (let i = 0; i < this.squares.length; i++) {
			const square = this.squares[i];
			square.sink();
		}
		this.state = SHIP_STATE.SUNK;
	}

	attack(move: Move): boolean {
		for (let i = 0; i < this.squares.length; i++) {
			const square = this.squares[i];
			if (square.c == move.c && square.r == move.r) {
				square.hit();
				this.state = SHIP_STATE.DAMAGED;
				if (this.checkSunk()) {
					this.sink();
				}
				return true;
			}
			//FIXME: FIND OUT WHERE WE ARE GETTING MISS INFORMATION!
		}
		return false;
	}
	getPosition(): Position[] {
		const one = this.squares[0];
		const two = this.squares[this.squares.length - 1];
		return [
			new Position(one.c, one.r, this.pType),
			new Position(two.c, two.r, this.pType),
		];
	}
}

export enum SHIP_DESCRIPTOR {
	SIZE_MISMATCH = "SIZE MISMATCH",
	// =-=-=-=-=-=-=-=-
	// SUNK 123456789ab
	// names must have len <= 11
	CARRIER = "CARRIER",
	BATTLESHIP = "BATTLESHIP",
	DESTROYER = "DESTROYER",
	SUBMARINE = "SUBMARINE",
	PATROL = "PATROL",
}

export enum SHIP_NAME {
	MIDWAY = "USS MIDWAY",
	ARIZONA = "USS ARIZONA",
	JOHNSON = "USS JOHNSON",
	DEFAULT = "DEFAULT",
}
export enum SHIP_STATE {
	WHOLE = "WHOLE",
	DAMAGED = "DAMAGED",
	SUNK = "SUNK",
}

export class ShipType {
	descriptor: SHIP_DESCRIPTOR;
	name: SHIP_NAME;
	size: number;

	constructor(descriptor: SHIP_DESCRIPTOR, name?: SHIP_NAME) {
		this.descriptor = descriptor;
		if (name) {
			this.name = name;
		} else {
			this.name = SHIP_NAME.DEFAULT;
		}

		this.size = ShipType.classToSize(descriptor);
	}

	private static classToSize(type: SHIP_DESCRIPTOR) {
		if (type == SHIP_DESCRIPTOR.CARRIER) {
			return 5;
		} else if (type == SHIP_DESCRIPTOR.BATTLESHIP) {
			return 4;
		} else if (
			type == SHIP_DESCRIPTOR.DESTROYER ||
			type == SHIP_DESCRIPTOR.SUBMARINE
		) {
			return 3;
		} else if (type == SHIP_DESCRIPTOR.PATROL) {
			return 2;
		} else {
			return -1;
		}
	}

	toString(): string {
		let str = this.descriptor.toString();
		if (this.name != SHIP_NAME.DEFAULT) {
			str += `-${this.name}`;
		}
		return str;
	}
}
