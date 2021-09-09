export class Move {
	type: MOVE_TYPE;
	at: string;
	c: number;
	r: number;

	constructor(raw: any) {
		this.c = -1;
		this.r = -1;
		this.at = "";

		try {
			if (isInstance(raw)) {
				this.type = raw.type;
				this.c = +raw.c; //+str provides shorthand for converting "1" to 1
				this.r = +raw.r;
				this.at = raw.at;
			} else {
				this.type = MOVE_TYPE.INVALID;
			}
		} catch (err) {
			this.type = MOVE_TYPE.BAD_FORMAT;
		}
	}

	isValid(grid: number) {
		if (this.type == MOVE_TYPE.INVALID || this.type == MOVE_TYPE.BAD_FORMAT) {
			return false;
		}
		if (this.c >= grid || this.r >= grid) {
			return false;
		}
		if (this.c < 0 || this.r < 0) {
			return false;
		}
		return true;
	}

	toString() {
		return JSON.stringify(this);
	}
}

export enum MOVE_TYPE {
	SOLO = "solo",
	SALVO = "salvo",
	EXPLOSIVE = "explosive",
	INVALID = "invalid",
	BAD_FORMAT = "bad_format",
}
export function isInstance(object: any) {
	if ("c" in object && "r" in object && "at" in object && "type" in object) {
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
