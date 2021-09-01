import Positioner, { PositionTransition } from "./Positioner";
import * as TWEEN from "@tweenjs/tween.js";

enum ArrowDirection {
	UP = "up",
	DOWN = "down",
}

export default class Arrows {
	container: HTMLElement;
	up: SVGSVGElement;
	down: SVGSVGElement;
	camera: THREE.Camera;
	positioner: Positioner;

	constructor(
		container: HTMLElement,
		camera: THREE.Camera,
		positioner: Positioner,
	) {
		this.camera = camera;
		this.container = container;
		this.positioner = positioner;
		this.up = this.createArrow(
			ArrowDirection.UP,
			"M8.5 33.5L95.5 8.5L184 33.5",
		);

		this.down = this.createArrow(
			ArrowDirection.DOWN,
			"M184 8.5L97 33.5L8.5 8.5",
		);
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

	private clickEvent(direction: ArrowDirection) {
		if (direction == ArrowDirection.UP) {
			this.transition(this.positioner.transitionAttack());
		} else if (direction == ArrowDirection.DOWN) {
			this.transition(this.positioner.transitionShips());
		} else {
			throw Error("Invalid Arrow Direction");
		}
	}

	private createArrow(dir: ArrowDirection, pathStr: string): SVGSVGElement {
		const svg = document.createElementNS(
			"http://www.w3.org/2000/svg",
			"svg",
		);
		svg.classList.add(`arrow-${dir}`);
		svg.setAttribute("viewBox", "0 0 192 42");
		if (dir == ArrowDirection.UP) {
			svg.style.top = "10px";
		} else if (dir == ArrowDirection.DOWN) {
			svg.style.bottom = "10px";
		}

		svg.addEventListener("click", () => {
			this.clickEvent(dir);
		});

		const path = document.createElementNS(
			"http://www.w3.org/2000/svg",
			"path",
		);
		path.setAttribute("d", pathStr);

		svg.appendChild(path);

		this.container.appendChild(svg);

		return svg;
	}

	private updatePos(arrow: SVGSVGElement) {
		let offset = -this.up.getBoundingClientRect().width / 2;
		offset += this.container.offsetLeft;
		offset += this.container.clientWidth / 2;

		arrow.style.left = `${offset}px`;
	}

	update() {
		this.updatePos(this.up);
		this.updatePos(this.down);
	}
}
