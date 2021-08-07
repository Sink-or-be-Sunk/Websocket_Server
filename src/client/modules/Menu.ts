export class Menu {
	container: HTMLElement;
	menu: SVGSVGElement;

	constructor(container: HTMLElement) {
		this.container = container;
		this.menu = this.createMenu();
		console.log("menu run");
	}

	private createMenu(): SVGSVGElement {
		const svg = document.createElementNS(
			"http://www.w3.org/2000/svg",
			"svg",
		);
		svg.setAttribute("fill", "none");
		svg.setAttribute("viewBox", "0 0 36 26");
		svg.setAttribute("fill", "none");
		svg.classList.add("game-menu");

		const path = document.createElementNS(
			"http://www.w3.org/2000/svg",
			"path",
		);

		path.setAttribute("d", "M3 23H33M3 3H33M3 13H33");
		path.setAttribute("stroke-linecap", "round");

		svg.appendChild(path);

		console.log(this.container);

		this.container.appendChild(svg);

		return svg;
	}
}
