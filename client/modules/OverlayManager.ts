import Positioner from "./Positioner";
import Arrows from "./Arrows";
import Menu from "./Menu";

export default class OverlayManager {
	canvas: HTMLElement;
	positioner: Positioner;
	camera: THREE.Camera;
	container: HTMLElement;
	arrows: Arrows;
	menu: Menu;

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

		this.arrows = new Arrows(this.container, this.camera, this.positioner);
		this.menu = new Menu(this.container);
		this.update();
	}

	update() {
		this.arrows.update();
		// this.updateUpArrowPos();
	}
}
