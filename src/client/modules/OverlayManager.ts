export default class OverlayManager {
	domElement: HTMLElement;

	constructor(domElement: HTMLElement) {
		this.domElement = domElement;

		this.createOverlay();
	}

	private createOverlay() {
		this.positionUpArrow();
		this.positionDownArrow();
	}

	private positionUpArrow() {
		const img = document.getElementById("arrow-up");

		if (img) {
			let offset = -img.getBoundingClientRect().width / 2;
			console.log(offset);
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
			console.log(offset);
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
