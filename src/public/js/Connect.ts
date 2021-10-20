class ConnectManager {
	deviceID: string;
	username: string;

	socket: WebSocket;

	// HEADERS
	private readonly REGISTRATION_HEADER = "REGISTRATION";
	private readonly SERVER_SUCCESS_RESPONSE = "WEB REQ SUCCESS";
	private readonly REGISTER_SUCCESS = "REGISTER SUCCESS";

	// MESSAGES
	private getDeviceList() {
		return {
			req: this.REGISTRATION_HEADER,
			id: this.username,
			data: {
				type: "GET_LIST",
				ssid: "unknown",
			},
		};
	}
	constructor(username: string, deviceID: string) {
		this.deviceID = deviceID;
		this.username = username;
		console.log("deviceID:", deviceID);
		console.log("username:", username);

		const protocol = location.protocol == "https:" ? "wss" : "ws";
		const uri = protocol + "://" + location.hostname + ":" + location.port;

		console.log(uri);

		this.socket = new WebSocket(uri);
		this.socket.onmessage = (event) => {
			this._onmessage(event);
		};

		this.socket.onopen = (event) => {
			this._onopen(event);
		};
	}

	private _onmessage(event: any) {
		const data = JSON.parse(event.data);
		console.log(data);

		if (data.header == this.SERVER_SUCCESS_RESPONSE) {
			this.updatePairingList(data.payload);
		} else if (data.header == this.REGISTER_SUCCESS) {
			this.socket.send(JSON.stringify(this.getDeviceList()));
			($("#mcuWait") as any).modal("hide");
			($("#mcuConnected") as any).modal("show");
		}
	}

	private _onopen(event: any) {
		console.log(event);
		this.socket.send(JSON.stringify(this.getDeviceList()));
	}

	/** Functions to Update Dom */
	private updatePairingList(
		list: {
			ssid: string;
			mcuID: string;
		}[],
	) {
		console.log("update");
		// const container = document.querySelector("#devices");
		const container = $("#devices");
		container.empty();

		for (let i = 0; i < list.length; i++) {
			const obj = list[i];

			const field = document.createElement("div");
			field.classList.add("col-sm-8", "form-control");
			field.innerHTML = obj.ssid;

			const icon = document.createElement("i");
			icon.classList.add("fa", "fa-link");

			const button = document.createElement("button");
			button.id = `pair-${i}`;
			button.classList.add("btn", "btn-primary");
			button.appendChild(icon);
			button.innerHTML += "Connect Device";
			button.addEventListener("click", () => {
				if (this.deviceID) {
					// $("#acceptPairing").on("click", (e) => {
					// 	console.log("accept pairing click");
					// 	client.deviceID = null;
					// 	$(`#pair-${i}`).trigger("click");
					// });
					// console.log($("#acceptPairing"));
					// ($("#startPairing") as any).modal("show");
					const resp = confirm(
						//TODO: REPLACE THIS WITH A MODAL
						`Are you sure you want to pair a new device?\nThis action will remove your old device!`,
					);
					if (!resp) {
						return;
					}
				}

				($("#mcuWait") as any).modal("show");
				const register = {
					type: "INITIATE",
					ssid: obj.ssid,
					data: obj.mcuID,
				};
				const msg = {
					req: "REGISTRATION",
					id: this.username,
					data: register,
				};
				console.log("sending msg:");
				console.log(msg);
				this.socket.send(JSON.stringify(msg));
			});

			const buttonDiv = document.createElement("div");
			buttonDiv.classList.add("col-sm-2", "text-right");
			buttonDiv.appendChild(button);

			const outer = document.createElement("li");
			outer.classList.add(
				"form-group",
				"row",
				"justify-content-md-center",
			);
			outer.appendChild(field);
			outer.appendChild(buttonDiv);
			outer.id = obj.ssid;

			container.append(outer);
		}
	}
}

/** ----------------- popup code ------------------- */
$("#mcuWait").on("hidden.bs.modal", function () {
	console.log("closed modal"); //TODO: ADD CODE TO CANCEL PAIRING HERE
});

/** ----------------- search bar code --------------- */
$("#search").on("keyup", function () {
	const value = ($(this).val() as string).toLowerCase();
	$("#devices li").filter(function () {
		const res = this.id.toLowerCase().indexOf(value) > -1;
		if (!res) {
			$(this).hide();
		} else {
			$(this).show();
		}
		return res;
	});
});
