// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const client = { deviceID: profile.device, username: username }; //ts throws error because username is located in connect page script tag

// HEADERS
const REGISTRATION_HEADER = "REGISTRATION";
const INITIATE_HEADER = "INITIATE";
const SERVER_SUCCESS_RESPONSE = "WEB REQ SUCCESS";
const REGISTER_SUCCESS = "REGISTER SUCCESS";

console.log("client:");
console.log(client);

// MESSAGES
const getDeviceList = {
	req: REGISTRATION_HEADER,
	id: client.username,
	data: {
		type: "GET_LIST",
		ssid: "unknown",
	},
};

const protocol = location.protocol == "https" ? "wss" : "ws";
// const uri = protocol + "//" + location.hostname + ":3000/"
const uri = protocol + "://" + location.hostname + ":" + location.port;

const socket = new WebSocket(uri);
socket.onmessage = function (event: any) {
	const data = JSON.parse(event.data);
	console.log(data);

	if (data.header == SERVER_SUCCESS_RESPONSE) {
		updatePairingList(data.payload);
	} else if (data.header == REGISTER_SUCCESS) {
		socket.send(JSON.stringify(getDeviceList));
		($("#mcuWait") as any).modal("hide");
		($("#mcuConnected") as any).modal("show");
	}
};
socket.onopen = function (event) {
	console.log(event);
	socket.send(JSON.stringify(getDeviceList));
};

/** Functions to Update Dom */
function updatePairingList(
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
			if (client.deviceID) {
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
				id: client.username,
				data: register,
			};
			console.log("sending msg:");
			console.log(msg);
			socket.send(JSON.stringify(msg));
		});

		const buttonDiv = document.createElement("div");
		buttonDiv.classList.add("col-sm-2", "text-right");
		buttonDiv.appendChild(button);

		const outer = document.createElement("div");
		outer.classList.add("form-group", "row", "justify-content-md-center");
		outer.appendChild(field);
		outer.appendChild(buttonDiv);
		outer.id = obj.mcuID;

		container.append(outer);
	}
}

/** ----------------- popup code ------------------- */
$("#mcuWait").on("hidden.bs.modal", function () {
	console.log("closed modal"); //TODO: ADD CODE TO CANCEL PAIRING HERE
});

export {};
