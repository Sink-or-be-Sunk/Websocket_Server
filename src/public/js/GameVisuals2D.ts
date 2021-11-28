// import { Console } from "console";

// interface sizeIF {
// 	w: number;
// 	h: number;
// 	r: number;
// 	c: number;
// 	snap: number;
// }

// class GameVisuals2D {
// 	private attackBoard: JQuery<HTMLElement>;
// 	private positionBoard: JQuery<HTMLElement>;

// 	private config: sizeIF;

// 	private Draggable: any;
// 	private TweenLite: any;
// 	constructor(Draggable: any, TweenLite: any) {
// 		console.log("Game Visuals 2D");
// 		this.Draggable = Draggable;
// 		this.TweenLite = TweenLite;
// 		this.attackBoard = $("#attack-board");
// 		this.positionBoard = $("#position-board");
// 		this.config = {
// 			w: 50,
// 			h: 50,
// 			r: 8,
// 			c: 8,
// 			snap: 50,
// 		};

// 		this.Draggable.create("boat2", {
// 			bounds: "container",
// 			onDrag: "onDrag",
// 			onClick: "rotateShip",
// 		});
// 	}
// 	public onDrag() {
// 		this.TweenLite.to(this.target, 0.5, {
// 			x: Math.round(this.x / this.config.snap) * this.config.snap,
// 			y: Math.round(this.y / this.config.snap) * this.config.snap,
// 			ease: Back.easeOut.config(2),
// 		});
// 	}
// }
