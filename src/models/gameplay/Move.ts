import { ShipType } from "./Ship";

export class Move {
	public static readonly WINNER_TAG = " Winner";
	public static readonly LOSER_TAG = " Loser";
	type: MOVE_TYPE;
	from: string;
	readonly to: string;
	readonly c: number;
	readonly r: number;

	result: MOVE_RESULT;

	result_ship: ShipType;

	constructor(raw: any) {
		this.c = -1;
		this.r = -1;
		this.to = "";
		this.from = "";
		this.result = MOVE_RESULT.INIT;
		this.result_ship = null;

		if (isInstance(raw)) {
			const move = raw as Move;
			this.type = move.type;
			this.c = +move.c; //+str provides shorthand for converting "1" to 1
			this.r = +move.r;
			this.to = move.to;
		} else {
			this.type = MOVE_TYPE.INVALID;
		}
	}

	isValid(grid?: number): boolean {
		if (this.type == MOVE_TYPE.INVALID) {
			return false;
		}
		if (this.c < 0 || this.r < 0) {
			return false;
		}
		if (grid) {
			if (this.c >= grid || this.r >= grid) {
				return false;
			}
		}
		return true;
	}

	toResultString(): string {
		// =-=-=-=-=-=-=-=-
		// SUNK at r:0, c:0
		if (this.result == MOVE_RESULT.SUNK) {
			return `${this.result} ${this.result_ship}`;
		} else {
			const col = String.fromCharCode(this.c + 65);
			const row = String.fromCharCode(this.r + 49);
			return `${this.result} at c:${col}, r:${row}`;
		}
	}

	toString(): string {
		return JSON.stringify(this);
	}
}

export enum MOVE_RESULT {
	INIT = "INIT",
	HIT = "HIT",
	MISS = "MISS",
	SUNK = "SUNK",
}
export enum MOVE_TYPE {
	SOLO = "SOLO",
	SALVO = "SALVO",
	EXPLOSIVE = "EXPLOSIVE",
	INVALID = "INVALID",
}
export function isInstance(object: any): boolean {
	if ("c" in object && "r" in object && "to" in object && "type" in object) {
		if (!isNaN(object.c) && !isNaN(object.r)) {
			if (
				object.type === MOVE_TYPE.SOLO ||
				object.type === MOVE_TYPE.SALVO ||
				object.type === MOVE_TYPE.EXPLOSIVE
			) {
				return true;
			}
		}
	}
	return false;
}
