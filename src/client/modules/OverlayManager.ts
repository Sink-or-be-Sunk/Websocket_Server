import Positioner from "./Positioner";
import Arrows from "./Arrows";

export default class OverlayManager {
	canvas: HTMLElement;
	positioner: Positioner;
	camera: THREE.Camera;
	container: HTMLElement;
	arrows: Arrows;
	// menu: Menu;

	constructor(
		canvas: HTMLElement,
		positioner: Positioner,
		camera: THREE.Camera,
	) {
		this.container = document.getElementById(
			"hud-container",
		) as HTMLElement;

		this.canvas = canvas;
		this.positioner = positioner;
		this.camera = camera;

		this.update();
		this.arrows = new Arrows(this.container, this.camera, this.positioner);
		// this.menu = new Menu(this.container);
	}

	update() {
		// this.updateDownArrowPos();
		// this.updateUpArrowPos();
	}

	// private updateDownArrowPos() {
	// 	const img = document.getElementById("arrow-down");

	// 	if (img) {
	// 		let offset = -img.getBoundingClientRect().width / 2;
	// 		img.addEventListener("click", () => {
	// 			this.clickEvent(ArrowDirection.DOWN);
	// 		});
	// 		offset += this.canvas.offsetLeft;
	// 		offset += this.canvas.clientWidth / 2;

	// 		img.style.left = `${offset}px`;
	// 		img.style.bottom = "10px";
	// 	} else {
	// 		console.error("Cannot Find Up Arrow");
	// 	}
	// }
}
