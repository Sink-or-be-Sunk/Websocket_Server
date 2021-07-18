import WSClientMessage from "../models/WSClientMessage";

for (const req in WSClientMessage.REQUESTS) {
	console.log(req);
}
