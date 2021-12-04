declare const Draggable: any;
declare const TweenLite: any;
declare const Back: any;
class ShipPos {
	c: number;
	r: number;
	t: "P" | "S" | "B" | "C";
	constructor(c: number, r: number) {
		this.c = c;
		this.r = r;
	}
}

interface ShipPieceOptions {
	c: number;
	r: number;
	tag: string;
	len: number;
	snap: number;
	ships: ShipGamePieces;
}

class ShipGamePiece {
	tag: string;
	cur: ShipPos;
	prev: ShipPos;
	v: JQuery<HTMLDivElement>;
	h: JQuery<HTMLDivElement>;
	isVertical: boolean;
	len: number;
	positioner: JQuery<HTMLDivElement>;
	snap: number;
	constructor(options: ShipPieceOptions) {
		this.cur = new ShipPos(options.c, options.r);
		this.prev = new ShipPos(options.c, options.r);
		this.tag = options.tag;
		this.v = $(`#${this.tag}_v`);
		this.h = $(`#${this.tag}_h`);
		this.snap = options.snap;
		this.isVertical = false;
		this.len = options.len;

		this.positioner = jQuery("<div>", {
			id: `${this.tag}_pos`,
			class: "boat",
			style: `width: ${options.len * options.snap}px; height: ${
				options.snap
			}px;`,
		});
		$("#position-board").append(this.positioner);

		this.translate();
		this.render();

		Draggable.create(this.positioner, {
			bounds: $("#position-board"),
			onDrag: () => {
				this.onDrag();
			},
			onClick: () => {
				if (options.ships.validRotate(this)) {
					this.rotate();
					if (options.ships.checkIntersections(this)) {
						this.rotate(); //flip back
						this.signalError();
					}
				} else {
					console.log("Invalid Rotate");
					this.signalError();
				}
			},
			onDragEnd: () => {
				if (options.ships.checkIntersections(this)) {
					console.log("Invalid Translate");
					this.signalError();
					this.cur.c = this.prev.c;
					this.cur.r = this.prev.r;

					this.translate();
				} else {
					this.prev.c = this.cur.c;
					this.prev.r = this.cur.r;
				}
			},
		});
	}

	private signalError() {
		this.positioner.css({ border: "3px solid red" });
		setTimeout(() => {
			this.positioner.css({ border: "none" });
		}, 150);
	}
	private translate() {
		const duration = 0.75;
		TweenLite.to(this.positioner, duration, {
			x: this.cur.c,
			y: this.cur.r,
			ease: Back.easeOut.config(2),
		});
		TweenLite.to(this.v, duration, {
			x: this.cur.c,
			y: this.cur.r,
			ease: Back.easeOut.config(2),
		});
		TweenLite.to(this.h, duration, {
			x: this.cur.c,
			y: this.cur.r,
			ease: Back.easeOut.config(2),
		});
	}

	setPosition(position: ShipPos, isVertical: boolean) {
		this.cur.c = position.c * this.snap;
		this.cur.r = position.r * this.snap;
		this.translate();

		if (isVertical && !this.isVertical) {
			this.rotate();
		}
		Draggable.get(this.positioner).disable();
	}

	onDrag() {
		const childPos = this.positioner.offset();
		const parentPos = this.positioner.parent().offset();
		const childOffset = {
			y: childPos.top - parentPos.top,
			x: childPos.left - parentPos.left,
		};

		this.cur.c = Math.round(childOffset.x / this.snap) * this.snap;
		this.cur.r = Math.round(childOffset.y / this.snap) * this.snap;
		this.translate();
	}

	render() {
		if (this.isVertical) {
			this.v.css({ display: "unset" });
			this.h.css({ display: "none" });
		} else {
			this.v.css({ display: "none" });
			this.h.css({ display: "unset" });
		}
	}
	rotate() {
		this.isVertical = !this.isVertical;
		const prevW = this.positioner.css("width");
		const prevH = this.positioner.css("height");
		this.positioner.css({ height: prevW });
		this.positioner.css({ width: prevH });

		this.render();
	}

	getTypeString() {
		if (this.len === 2) {
			return "P";
		} else if (this.len === 3) {
			return "S";
		} else if (this.len === 4) {
			return "B";
		} else if (this.len === 5) {
			return "C";
		} else {
			throw new Error(`Invalid Ship Size: ${this.len}`);
		}
	}

	coordsToShip() {
		const list = [];

		const type = this.getTypeString();

		list.push({
			c: this.cur.c / this.snap,
			r: this.cur.r / this.snap,
			t: type,
		});

		if (this.isVertical) {
			list.push({
				c: this.cur.c / this.snap,
				r: this.cur.r / this.snap + this.len - 1,
				t: type,
			});
		} else {
			list.push({
				c: this.cur.c / this.snap + this.len - 1,
				r: this.cur.r / this.snap,
				t: type,
			});
		}
		return list;
	}
}

interface ShipElement {
	tag: string;
	len: number;
}

class ShipGamePieces {
	ships: ShipGamePiece[];

	private static readonly grid = 8;

	constructor(snap: number, list: ShipElement[]) {
		this.ships = [];
		for (let i = 0; i < list.length; i++) {
			const el = list[i];
			this.ships.push(
				new ShipGamePiece({
					tag: el.tag,
					c: 0,
					r: i * snap,
					len: el.len,
					snap: snap,
					ships: this,
				}),
			);
		}
	}

	validRotate(ship: ShipGamePiece): boolean {
		// check board constraints
		if (ship.isVertical) {
			if (ship.cur.c / ship.snap + ship.len - 1 >= ShipGamePieces.grid) {
				return false;
			}
		} else if (
			ship.cur.r / ship.snap + ship.len - 1 >=
			ShipGamePieces.grid
		) {
			return false;
		}

		return true;
	}

	checkIntersections(ship: ShipGamePiece): boolean {
		for (let i = 0; i < this.ships.length; i++) {
			const s = this.ships[i];

			if (Draggable.hitTest(ship.positioner, s.positioner, 0.8)) {
				return true;
			}
		}
		return false;
	}

	getShipPositionList() {
		const list = [];
		for (let i = 0; i < this.ships.length; i++) {
			const ship = this.ships[i];
			list.push(...ship.coordsToShip());
		}

		return list;
	}

	setPositions(list: ShipPos[]): void {
		const typeMap = { P: 0, S: 1, B: 2, C: 3 };

		for (let i = 0; i < list.length; i++) {
			const pos = list[i];
			let pair: ShipPos = null;
			for (let j = i + 1; j < list.length; j++) {
				const search = list[j];
				if (search.t == pos.t) {
					pair = search;
					list.splice(j, 1);
					break;
				}
			}
			if (pair) {
				const ship = this.ships[typeMap[pos.t]];
				let first;
				let isVertical;
				console.log("pos", pos);
				console.log("pair", pair);
				if (pos.c == pair.c) {
					isVertical = true;
					if (pos.r < pair.r) {
						first = pos;
					} else {
						first = pair;
					}
				} else {
					isVertical = false;
					if (pos.c < pair.c) {
						first = pos;
					} else {
						first = pair;
					}
				}
				ship.setPosition(first, isVertical);
			} else {
				console.error(pos);
				throw new Error(`Couldn't find Pair for Ship Coordinate`);
			}
		}
	}
}
