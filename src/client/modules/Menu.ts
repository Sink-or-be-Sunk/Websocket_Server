class MenuLink {
	path: string;
	text: string;

	constructor(path: string, text: string) {
		this.path = path;
		this.text = text;
	}
}

export default class Menu {
	container: HTMLElement;
	menu: SVGSVGElement;
	items: MenuLink[];

	constructor(container: HTMLElement) {
		this.container = container;
		this.menu = this.createMenu();
		this.items = [new MenuLink("/", "Home")];
		this.createMenuItems();
	}

	private clickEvent() {
		console.log("menu click");
	}

	private createNavItem() {
		const a = document.createElement("a");
		a.href = "#";
		a.classList.add("menu-icon-button");

		const li = document.createElement("li");
		li.classList.add("menu-nav-item");
		li.appendChild(a);
	}

	private createMenu(): SVGSVGElement {
		const path = document.createElementNS(
			"http://www.w3.org/2000/svg",
			"path",
		);
		path.setAttribute("d", "M16 41H46M16 21H46M16 31H46");
		path.classList.add("menu-icon");

		const bg = document.createElementNS(
			"http://www.w3.org/2000/svg",
			"circle",
		);
		bg.setAttribute("cx", "30");
		bg.setAttribute("cy", "30");
		bg.setAttribute("r", "30");
		bg.classList.add("menu-background");

		const svg = document.createElementNS(
			"http://www.w3.org/2000/svg",
			"svg",
		);
		svg.setAttribute("viewBox", "0 0 62 62");
		svg.classList.add("menu-svg");
		svg.appendChild(bg);
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

	private createMenuItems() {
		for (let i = 0; i < this.items.length; i++) {
			const item = this.items[i];
		}
	}

	update() {
		console.log("no update ");
	}
}
