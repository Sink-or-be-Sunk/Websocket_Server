import Positioner from "./Positioner";
import * as TWEEN from "@tweenjs/tween.js";
import { PositionTransition } from "./Positioner";

enum ArrowDirection {
	UP,
	DOWN,
}

export default class OverlayManager {
	domElement: HTMLElement;
	positioner: Positioner;
	camera: THREE.Camera;

	constructor(
		domElement: HTMLElement,
		positioner: Positioner,
		camera: THREE.Camera,
	) {
		this.domElement = domElement;
		this.positioner = positioner;
		this.camera = camera;

		this.createOverlay();
	}

	private createOverlay() {
		this.positionUpArrow();
		this.positionDownArrow();
	}

	private clickEvent(direction: ArrowDirection) {
		if (direction == ArrowDirection.UP) {
			this.transition(this.positioner.transitionAttack());
		} else if (direction == ArrowDirection.DOWN) {
			this.transition(this.positioner.transitionShips());
		} else {
			throw Error("Invalid Arrow Direction");
		}
	}

	private transition(t: PositionTransition) {
		new TWEEN.Tween(t.from)
			.to(t.to)
			.easing(TWEEN.Easing.Quadratic.Out)
			.onUpdate(() => {
				this.camera.position.set(t.from.cx, t.from.cy, t.from.cz);
				this.camera.lookAt(t.from.lx, t.from.ly, t.from.lz);
			})
			.start();
	}

	private positionUpArrow() {
		const img = document.getElementById("arrow-up");

		if (img) {
			img.addEventListener("click", () => {
				this.clickEvent(ArrowDirection.UP);
			});
			let offset = -img.getBoundingClientRect().width / 2;
			offset += this.domElement.offsetLeft;
			offset += this.domElement.clientWidth / 2;

			img.style.position = "absolute";
			img.style.left = `${offset}px`;
			img.style.top = "10px";
		} else {
			console.error("Cannot Find Up Arrow");
		}
	}
	private positionDownArrow() {
		const img = document.getElementById("arrow-down");

		if (img) {
			let offset = -img.getBoundingClientRect().width / 2;
			img.addEventListener("click", () => {
				this.clickEvent(ArrowDirection.DOWN);
			});
			offset += this.domElement.offsetLeft;
			offset += this.domElement.clientWidth / 2;

			img.style.position = "absolute";
			img.style.left = `${offset}px`;
			img.style.bottom = "10px";
		} else {
			console.error("Cannot Find Up Arrow");
		}
	}
}
