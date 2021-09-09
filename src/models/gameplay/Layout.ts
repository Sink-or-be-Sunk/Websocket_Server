export class Layout {
	type: LAYOUT_TYPE;
	list: Position[];
	constructor(raw: any) {
		this.list = [];
		try {
			if (Array.isArray(raw)) {
				for (let i = 0; i < raw.length; i++) {
					const el = raw[i];
					if (Position.isInstance(el)) {
						this.list.push(new Position(el.c, el.r, el.t));
					} else {
						this.list = [];
						this.type = LAYOUT_TYPE.BAD_POSITION_OBJ;
						return;
					}
				}
				this.type = LAYOUT_TYPE.VALID;
			} else {
				this.type = LAYOUT_TYPE.BAD_ARRAY;
			}
		} catch (err) {
			this.type = LAYOUT_TYPE.BAD_JSON;
		}
	}
}

export enum LAYOUT_TYPE {
	BAD_JSON = "BAD JSON",
	BAD_ARRAY = "BAD ARRAY",
	BAD_POSITION_OBJ = "BAD POSITION OBJ",
	VALID = "VALID",
}

export enum LAYOUT_TYPE {
	PATROL = "P",
	DESTROYER = "D",
	SUBMARINE = "S",
	BATTLESHIP = "B",
	CARRIER = "C",
}
export class Position {
	c: number;
	r: number;
	t: LAYOUT_TYPE;

	constructor(c: number, r: number, t: LAYOUT_TYPE) {
		this.c = +c; //+ is shorthand for converting string to number
		this.r = +r;
		this.t = t;
	}

	static isInstance(obj: any): boolean {
		if ("r" in obj && "c" in obj && "t" in obj) {
			if (!isNaN(obj.c) && !isNaN(obj.r)) {
				if (
					obj.t === LAYOUT_TYPE.PATROL ||
					obj.t === LAYOUT_TYPE.DESTROYER ||
					obj.t === LAYOUT_TYPE.SUBMARINE ||
					obj.t === LAYOUT_TYPE.BATTLESHIP ||
					obj.t === LAYOUT_TYPE.CARRIER
				) {
					return true;
				}
			}
		}
		return false;
	}
}
