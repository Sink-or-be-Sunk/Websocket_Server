class Move {
	type: Move.TYPE;
	x: number;
	y: number;

	constructor(raw: string) {
		this.x = -1;
		this.y = -1;

		try {
			const parse = JSON.parse(raw) as Move;
			if (Move.isInstance(parse)) {
				this.type = parse.type;
				this.x = +parse.x; //+str provides shorthand for converting "1" to 1
				this.y = +parse.y;
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
		if (this.x >= grid || this.y >= grid) {
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
		if ("x" in object && "y" in object && "type" in object) {
			if (!isNaN(object.x) && !isNaN(object.y)) {
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
