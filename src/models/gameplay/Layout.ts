import { Rules } from "./Game";

export class Layout {
	type: LAYOUT_TYPE;
	list: Position[];
	constructor(raw: any, rules: Rules) {
		this.list = [];
		const available = [...rules.ships, ...rules.ships]; //two positions per ship
		if (Array.isArray(raw)) {
			for (let i = 0; i < raw.length; i++) {
				const el = raw[i];
				if (Position.isInstance(el)) {
					const idx = available.indexOf(el.t);
					if (idx == -1) {
						this.list = [];
						this.type = LAYOUT_TYPE.BREAKS_RULES;
						return;
					} else {
						available.splice(idx, 1); //consume ship
						this.list.push(new Position(el.c, el.r, el.t));
					}
				} else {
					this.list = [];
					this.type = LAYOUT_TYPE.BAD_POSITION_OBJ;
					return;
				}
			}
			if (available.length > 0) {
				this.list = [];
				this.type = LAYOUT_TYPE.BREAKS_RULES;
				return;
			} else {
				this.type = LAYOUT_TYPE.VALID;
			}
		} else {
			this.type = LAYOUT_TYPE.BAD_ARRAY;
		}
	}

	isValid(): boolean {
		if (this.type == LAYOUT_TYPE.VALID) {
			return true;
		} else {
			return false;
		}
	}
}

export enum LAYOUT_TYPE {
	BAD_ARRAY = "BAD ARRAY",
	BAD_POSITION_OBJ = "BAD POSITION OBJ",
	VALID = "VALID",
	BREAKS_RULES = "BREAKS RULES",
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
