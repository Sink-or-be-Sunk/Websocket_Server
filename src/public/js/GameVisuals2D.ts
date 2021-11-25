interface sizeIF {
	w: number;
	h: number;
	r: number;
	c: number;
	snap: number;
}

class GameVisuals2D {
	private attackBoard: JQuery<HTMLElement>;
	private positionBoard: JQuery<HTMLElement>;

	private config: sizeIF;

	private Draggable: any;
	constructor(Draggable) {
		this.Draggable = Draggable;
		this.attackBoard = $("#attack-board");
		this.positionBoard = $("#position-board");
		this.config = {
			w: 50,
			h: 50,
			r: 8,
			c: 8,
			snap: 50,
		};

		this.Draggable.create("boat2", {
			bounds: "container",
			onDrag: "onDrag",
			onClick: "rotateShip",
		});
	}
}
