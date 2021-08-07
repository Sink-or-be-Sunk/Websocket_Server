import { createImportClause } from "typescript";

export default class Menu {
	container: HTMLElement;
	menu: SVGSVGElement;

	constructor(container: HTMLElement) {
		this.container = container;
		this.menu = this.createMenu();
	}

	private clickEvent() {
		console.log("menu click");
	}

	private createMenu(): SVGSVGElement {
		const path = document.createElementNS(
			"http://www.w3.org/2000/svg",
			"path",
		);
		path.setAttribute("d", "M16 41H46M16 21H46M16 31H46");
		path.classList.add("menu-icon");

		const circle = document.createElementNS(
			"http://www.w3.org/2000/svg",
			"circle",
		);
		circle.setAttribute("cx", "31");
		circle.setAttribute("cy", "31");
		circle.setAttribute("r", "30");
		circle.classList.add("menu-background");

		const svg = document.createElementNS(
			"http://www.w3.org/2000/svg",
			"svg",
		);
		svg.setAttribute("viewBox", "0 0 62 62");
		svg.appendChild(circle);
		svg.appendChild(path);

		const svgContainer = document.createElement("div");
		svgContainer.classList.add("menu-container");
		svgContainer.addEventListener("click", () => {
			this.clickEvent();
		});
		svgContainer.append(svg);

		this.container.appendChild(svgContainer);

		return svg;
	}

	update() {
		console.log("no update ");
	}
}
