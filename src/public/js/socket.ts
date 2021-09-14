//FIXME: NEEDS IMPLEMENTATION
console.log("no implementation")

// const protocol = location.protocol == "https" ? "wss" : "ws";
// // const uri = protocol + "//" + location.hostname + ":3000/"
// const uri = protocol + "://" + location.hostname + ":" + location.port

// console.log(uri);

// const socket = new WebSocket(uri);
// socket.onopen = function (event) {
//     console.log(event);
// };
// socket.onmessage = this.handleServerMessage;

// socket.onopen = (event) => {
//     const newGame = {
//         req: "one",
//         id: this.id,
//     };
//     socket.send(JSON.stringify(newGame));
// };

// function handleServerMessage(event: any) {
//     const data = JSON.parse(event.data);
//     console.log(data);
// }