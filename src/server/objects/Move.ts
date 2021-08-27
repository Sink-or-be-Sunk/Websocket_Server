class Move {
	type: Move.TYPE;
	at: string;
	c: number;
	r: number;

	constructor(raw: string) {
		this.c = -1;
		this.r = -1;
		this.at = "";

		try {
			const parse = JSON.parse(raw) as Move;
			if (Move.isInstance(parse)) {
				this.type = parse.type;
				this.c = +parse.c; //+str provides shorthand for converting "1" to 1
				this.r = +parse.r;
				this.at = parse.at;
			} else {
				this.type = Move.TYPE.INVALID;
			}
		} catch (err) {
			this.type = Move.TYPE.BAD_FORMAT;
		}
	}

	isValid(grid: number) {
		if (
			this.type == Move.TYPE.INVALID ||
			this.type == Move.TYPE.BAD_FORMAT
		) {
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

namespace Move {
	export enum TYPE {
		SOLO = "solo",
		SALVO = "salvo",
		EXPLOSIVE = "explosive",
		INVALID = "invalid",
		BAD_FORMAT = "bad_format",
	}
	export function isInstance(object: any) {
		if (
			"c" in object &&
			"r" in object &&
			"at" in object &&
			"type" in object
		) {
			if (!isNaN(object.c) && !isNaN(object.r)) {
				if (
					object.type === Move.TYPE.SOLO ||
					object.type === Move.TYPE.SALVO ||
					object.type === Move.TYPE.EXPLOSIVE
				) {
					return true;
				}
			}
		}
		return false;
	}
}

export default Move;
