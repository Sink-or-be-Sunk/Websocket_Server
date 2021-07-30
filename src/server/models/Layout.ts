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
						this.list.push(el);
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

	export enum Orientation {
		HORIZONTAL = "H",
		VERTICAL = "V",
	}
	export class Position {
		c: number;
		r: number;
		o: Orientation;

		constructor(c: number, r: number, o: Orientation) {
			this.c = c;
			this.r = r;
			this.o = o;
		}

		static isInstance(obj: any): boolean {
			if ("r" in obj && "r" in obj && "o" in obj) {
				if (!isNaN(obj.c) && !isNaN(obj.r)) {
					if (
						obj.o === Layout.Orientation.HORIZONTAL ||
						obj.o === Layout.Orientation.VERTICAL
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
