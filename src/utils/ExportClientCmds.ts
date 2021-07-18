import WSClientMessage from "../models/WSClientMessage";
import fs from "fs";

const dir = "./Export/";
const filename = "WSClientMessage.c";

if (!fs.existsSync(dir)) {
	fs.mkdirSync(dir);
}

const header = "hello world\n";

fs.writeFileSync(dir + filename, header);

for (let i = 0; i < WSClientMessage.REQUESTS.length; i++) {
	const req = WSClientMessage.REQUESTS[i];

	const msg = JSON.stringify({
		id: "Player_ID",
		req: req,
		data: "Optional_Data",
	});
	console.log(msg);
	fs.appendFileSync(dir + filename, msg + "\n");
}
