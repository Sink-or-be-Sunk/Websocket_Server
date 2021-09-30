// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const client = { deviceID: profile.device, username: username }; //ts throws error because username is located in connect page script tag

// HEADERS
const REGISTRATION_HEADER = "REGISTRATION";
const INITIATE_HEADER = "INITIATE";
const SERVER_SUCCESS_RESPONSE = "WEB REQ SUCCESS";
const REGISTER_SUCCESS = "REGISTER SUCCESS";

console.info("client:");
console.info(client);

const protocol = location.protocol == "https" ? "wss" : "ws";
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
