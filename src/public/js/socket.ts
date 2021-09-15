//FIXME: CHANGE THIS TO BE THE SOCKET FOR CLIENT WEB GAME PLAY WITH THREEJS
// // HEADERS
// const REGISTRATION_HEADER = "REGISTRATION";
// const INITIATE_HEADER = "INITIATE";

// const protocol = location.protocol == "https" ? "wss" : "ws";
// // const uri = protocol + "//" + location.hostname + ":3000/"
// const uri = protocol + "://" + location.hostname + ":" + location.port;

// console.log(uri);

// // eslint-disable-next-line @typescript-eslint/ban-ts-comment
// // @ts-ignore
// const client = { id: username }; //ts throws error because username is located in connect page script tag
// console.log(client.id);

// const socket = new WebSocket(uri);
// socket.onopen = function (event) {
// 	console.log(event);
// };
// socket.onmessage = function (event: any) {
// 	const data = JSON.parse(event.data);
// 	console.log(data);
// };
// socket.onopen = function (event) {
// 	const msg = {
// 		req: REGISTRATION_HEADER,
// 		id: client.id,
// 		data: {
// 			type: "GET_LIST",
// 			ssid: "unknown",
// 		},
// 	};
// 	socket.send(JSON.stringify(msg));
// };

// /** ----------- Web Client Message Functions --------------------*/

// // FUNCTIONS
// function initiateDevicePairing(targetID: string, ssid: string) {
// 	const msg = {
// 		req: REGISTRATION_HEADER,
// 		id: "WEB",
// 		data: { type: INITIATE_HEADER, ssid: ssid, data: targetID },
// 	};
// }
