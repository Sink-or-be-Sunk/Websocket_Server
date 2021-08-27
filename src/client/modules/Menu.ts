class MenuLink {
	path: string;
	text: string;
	icon: HTMLDivElement;

	constructor(path: string, text: string, icon: HTMLDivElement) {
		this.path = path;
		this.text = text;
		this.icon = icon;
	}
}

export default class Menu {
	container: HTMLElement;
	button: HTMLElement;
	links: MenuLink[];
	dropdown: HTMLElement;

	constructor(container: HTMLElement) {
		this.container = container;
		this.button = this.createMenuButton();
		this.links = [
			new MenuLink("/", "Home", this.createHome()),
			new MenuLink("/account", "Account", this.createAccount()),
		];
		this.dropdown = this.createDropdown();
	}

	private toggleMenuItems() {
		const showing = this.dropdown.style.display != "none";
		if (showing) {
			this.dropdown.style.display = "none";
		} else {
			this.dropdown.style.display = "block";
		}
	}

	private createMenuButton(): HTMLDivElement {
		const svg = `<svg viewBox="0 0 62 62" class="menu-svg">
			<circle cx="31" cy="31" r="30" class="menu-background"></circle>
			<path d="M16 41H46M16 21H46M16 31H46" class="menu-icon"></path>
		</svg>`;

		const div = this.str2SVG(svg);
		div.classList.add("menu-container");
		div.addEventListener("click", () => {
			this.toggleMenuItems();
		});

		this.container.appendChild(div);

		return div;
	}

	private createDropdown() {
		const menu = document.createElement("div");
		menu.classList.add("menu");

		for (let i = 0; i < this.links.length; i++) {
			const item = this.links[i];

			const span = document.createElement("span");
			span.classList.add("icon-button");
			span.appendChild(item.icon);

			const a = document.createElement("a");
			a.classList.add("menu-item");
			a.href = item.path;
			a.appendChild(span);
			a.innerHTML += item.text;

			menu.appendChild(a);
		}

		const dropdown = document.createElement("div");
		dropdown.classList.add("dropdown");
		dropdown.appendChild(menu);
		dropdown.style.display = "none"; //start with dropdown hidden

		this.container.appendChild(dropdown);

		return dropdown;
	}

	private createHome(): HTMLDivElement {
		const svg = `<svg viewBox="0 0 495.398 495.398">
			<path d="M487.083,225.514l-75.08-75.08V63.704c0-15.682-12.708-28.391-28.413-28.391c-15.669,0-28.377,12.709-28.377,28.391     v29.941L299.31,37.74c-27.639-27.624-75.694-27.575-103.27,0.05L8.312,225.514c-11.082,11.104-11.082,29.071,0,40.158     c11.087,11.101,29.089,11.101,40.172,0l187.71-187.729c6.115-6.083,16.893-6.083,22.976-0.018l187.742,187.747     c5.567,5.551,12.825,8.312,20.081,8.312c7.271,0,14.541-2.764,20.091-8.312C498.17,254.586,498.17,236.619,487.083,225.514z"></path>
			<path d="M257.561,131.836c-5.454-5.451-14.285-5.451-19.723,0L72.712,296.913c-2.607,2.606-4.085,6.164-4.085,9.877v120.401     c0,28.253,22.908,51.16,51.16,51.16h81.754v-126.61h92.299v126.61h81.755c28.251,0,51.159-22.907,51.159-51.159V306.79     c0-3.713-1.465-7.271-4.085-9.877L257.561,131.836z"></path>
		</svg>`;

		return this.str2SVG(svg);
	}

	private createAccount(): HTMLDivElement {
		const svg = `
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 119 110"
		>
			<path
				d="M59.5 64C26.6391 64 0 84.371 0 109.5H119C119 84.371 92.3609 64 59.5 64Z"
			/>
			<path
				d="M88.3002 29.5C88.3002 45.7924 75.0926 59 58.8002 59C42.5078 59 29.3002 45.7924 29.3002 29.5C29.3002 13.2076 42.5078 0 58.8002 0C75.0926 0 88.3002 13.2076 88.3002 29.5Z"
			/>
		</svg>`;

		return this.str2SVG(svg);
	}

	private str2SVG(elementStr: string): HTMLDivElement {
		const div = document.createElement("div");
		div.innerHTML = elementStr.trim();

		return div;
	}
}
