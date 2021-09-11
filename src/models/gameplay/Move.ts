import { ShipType } from "./Ship";

export class Move {
	type: MOVE_TYPE;
	readonly from: string;
	readonly to: string;
	readonly c: number;
	readonly r: number;

	result: MOVE_RESULT;

	result_ship: ShipType;

	constructor(raw: Object) {
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
			this.from = move.from;
		} else {
			this.type = MOVE_TYPE.INVALID;
		}
	}

	isValid(grid?: number) {
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

	toString() {
		return JSON.stringify(this);
	}
}

export enum MOVE_RESULT {
	INIT = "INIT",
	HIT = "HIT",
	MISS = "MISS",
	SUNK = "SUNK"
}
export enum MOVE_TYPE {
	SOLO = "SOLO",
	SALVO = "SALVO",
	EXPLOSIVE = "EXPLOSIVE",
	INVALID = "INVALID",
}
export function isInstance(object: any) {
	if ("c" in object && "r" in object && "to" in object && "from" in object && "type" in object) {
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
