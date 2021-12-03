declare const Draggable: any;
declare const TweenLite: any;
declare const Back: any;
class ShipPos {
	x: number;
	y: number;
	constructor(x, y) {
		this.x = x;
		this.y = y;
	}
}

interface ShipPieceOptions {
	x: number;
	y: number;
	tag: string;
	len: number;
	snap: number;
}

class ShipGamePiece {
	tag: string;
	cur: ShipPos;
	prev: ShipPos;
	v: JQuery<HTMLDivElement>;
	h: JQuery<HTMLDivElement>;
	isVertical: boolean;
	positioner: JQuery<HTMLDivElement>;
	snap: number;
	constructor(options: ShipPieceOptions) {
		this.cur = new ShipPos(options.x, options.y);
		this.prev = new ShipPos(options.x, options.y);
		this.tag = options.tag;
		this.v = $(`#${this.tag}_v`);
		this.h = $(`#${this.tag}_h`);
		this.snap = options.snap;
		this.isVertical = false;

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
				this.rotate();
			},
			onDragEnd: () => {
				this.onDragEnd();
			},
		});
	}
	private translate() {
		this.positioner.css({
			transform: `translate3d(${this.cur.x}px,${this.cur.y}px,0px)`,
		});
		this.v.css({
			transform: `translate3d(${this.cur.x}px,${this.cur.y}px,0px)`,
		});
		this.h.css({
			transform: `translate3d(${this.cur.x}px,${this.cur.y}px,0px)`,
		});
	}

	onDrag() {
		const childPos = this.positioner.offset();
		const parentPos = this.positioner.parent().offset();
		const childOffset = {
			y: childPos.top - parentPos.top,
			x: childPos.left - parentPos.left,
		};

		this.cur.x = Math.round(childOffset.x / this.snap) * this.snap;
		this.cur.y = Math.round(childOffset.y / this.snap) * this.snap;
		TweenLite.to(this.positioner, 0.5, {
			x: this.cur.x,
			y: this.cur.y,
			ease: Back.easeOut.config(2),
		});
		TweenLite.to(this.v, 0.5, {
			x: this.cur.x,
			y: this.cur.y,
			ease: Back.easeOut.config(2),
		});
		TweenLite.to(this.h, 0.5, {
			x: this.cur.x,
			y: this.cur.y,
			ease: Back.easeOut.config(2),
		});
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
	onDragEnd() {
		console.log("target");
	}
}

interface ShipElement {
	tag: string;
	len: number;
}

class ShipGamePieces {
	ships: ShipGamePiece[];

	constructor(snap: number, list: ShipElement[]) {
		this.ships = [];
		for (let i = 0; i < list.length; i++) {
			const el = list[i];
			this.ships.push(
				new ShipGamePiece({
					tag: el.tag,
					x: 0,
					y: i,
					len: el.len,
					snap: snap,
				}),
			);
		}
	}
}
