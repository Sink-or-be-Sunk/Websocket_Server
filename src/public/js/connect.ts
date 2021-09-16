// HEADERS
const REGISTRATION_HEADER = "REGISTRATION";
const INITIATE_HEADER = "INITIATE";
const SERVER_SUCCESS_RESPONSE = "WEB REQ SUCCESS";
const REGISTER_SUCCESS = "REGISTER SUCCESS";

const protocol = location.protocol == "https" ? "wss" : "ws";
// const uri = protocol + "//" + location.hostname + ":3000/"
const uri = protocol + "://" + location.hostname + ":" + location.port;

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const client = { id: username }; //ts throws error because username is located in connect page script tag

const socket = new WebSocket(uri);
socket.onopen = function (event) {
	console.log(event);
};
socket.onmessage = function (event: any) {
	const data = JSON.parse(event.data);
	console.log(data);

	if (data.header == SERVER_SUCCESS_RESPONSE) {
		updatePairingList(data.payload);
	} else if (data.header == REGISTER_SUCCESS) {
		//TODO: REMOVE DEVICE FROM DOM LIST
		($("#mcuWait") as any).modal("hide");
		($("#mcuConnected") as any).modal("show");

	}
};
socket.onopen = function (event) {
	const msg = {
		req: REGISTRATION_HEADER,
		id: client.id,
		data: {
			type: "GET_LIST",
			ssid: "unknown",
		},
	};
	socket.send(JSON.stringify(msg));
};

/** Functions to Update Dom */
function updatePairingList(
	list: {
		ssid: string;
		mcuID: string;
	}[],
) {
	const container = document.querySelector("#devices");

	for (let i = 0; i < list.length; i++) {
		const obj = list[i];

		const field = document.createElement("div");
		field.classList.add("col-sm-8", "form-control");
		field.innerHTML = obj.ssid;

		const icon = document.createElement("i");
		icon.classList.add("fa", "fa-link");

		const button = document.createElement("button");
		button.classList.add("btn", "btn-primary");
		button.appendChild(icon);
		button.innerHTML += "Connect Device";
		button.dataset.toggle = "modal";
		button.dataset.target = "#mcuWait";
		button.addEventListener("click", () => {
			const register = {
				type: "INITIATE",
				ssid: obj.ssid,
				data: obj.mcuID,
			};
			const msg = {
				req: "REGISTRATION",
				id: client.id,
				data: register,
			};
			socket.send(JSON.stringify(msg));
		});

		const buttonDiv = document.createElement("div");
		buttonDiv.classList.add("col-sm-2", "text-right");
		buttonDiv.appendChild(button);

		const outer = document.createElement("div");
		outer.classList.add("form-group", "row", "justify-content-md-center");
		outer.appendChild(field);
		outer.appendChild(buttonDiv);

		container.appendChild(outer);
	}
}

/** ----------- Web Client Message Functions --------------------*/

// FUNCTIONS
function initiateDevicePairing(targetID: string, ssid: string) {
	const msg = {
		req: REGISTRATION_HEADER,
		id: "WEB",
		data: { type: INITIATE_HEADER, ssid: ssid, data: targetID },
	};
}

/** ----------------- popup code ------------------- */
$("#mcuWait").on("shown.bs.modal", function () { //FIXME: REMOVE THIS AFTER TESTING
	setTimeout(function () {
		($("#mcuWait") as any).modal("hide");
		($("#mcuConnected") as any).modal("show");
	}, 1000);
});

$("#mcuWait").on("hidden.bs.modal", function () {
	console.log("closed modal"); //TODO: ADD CODE TO CANCEL PAIRING HERE
});
