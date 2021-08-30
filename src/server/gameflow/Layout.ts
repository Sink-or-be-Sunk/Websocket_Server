class Layout {
	type: Layout.TYPE;
	list: Layout.Position[];
	constructor(raw: string) {
		this.list = [];
		try {
			const parse = JSON.parse(raw) as Array<Layout.Position>;

			if (Array.isArray(parse)) {
				for (let i = 0; i < parse.length; i++) {
					const el = parse[i];
					if (Layout.Position.isInstance(el)) {
						this.list.push(new Layout.Position(el.c, el.r, el.t));
					} else {
						this.list = [];
						this.type = Layout.TYPE.BAD_POSITION_OBJ;
						return;
					}
				}
				this.type = Layout.TYPE.VALID;
			} else {
				this.type = Layout.TYPE.BAD_ARRAY;
			}
		} catch (err) {
			this.type = Layout.TYPE.BAD_JSON;
		}
	}
}

namespace Layout {
	export enum TYPE {
		BAD_JSON = "BAD JSON",
		BAD_ARRAY = "BAD ARRAY",
		BAD_POSITION_OBJ = "BAD POSITION OBJ",
		VALID = "VALID",
	}

	export enum TYPE {
		PATROL = "P",
		DESTROYER = "D",
		SUBMARINE = "S",
		BATTLESHIP = "B",
		CARRIER = "C",
	}
	export class Position {
		c: number;
		r: number;
		t: TYPE;

		constructor(c: number, r: number, t: TYPE) {
			this.c = +c; //+ is shorthand for converting string to number
			this.r = +r;
			this.t = t;
		}

		static isInstance(obj: any): boolean {
			if ("r" in obj && "c" in obj && "t" in obj) {
				if (!isNaN(obj.c) && !isNaN(obj.r)) {
					if (
						obj.t === Layout.TYPE.PATROL ||
						obj.t === Layout.TYPE.DESTROYER ||
						obj.t === Layout.TYPE.SUBMARINE ||
						obj.t === Layout.TYPE.BATTLESHIP ||
						obj.t === Layout.TYPE.CARRIER
					) {
						return true;
					}
				}
			}
			return false;
		}
	}
}

export default Layout;
