import * as WSClientMessage from "./src/util/WSClientMessage";
import fs from "fs";

const dir = "./dist/export/";
const filename = "WSClientMessage.c";

if (!fs.existsSync(dir)) {
	fs.mkdirSync(dir);
}

const header = "hello world\n";

fs.writeFileSync(dir + filename, header);

for (const req in WSClientMessage.REQ_TYPE) {
	const msg = JSON.stringify({
		id: "Player_ID",
		req: req,
		data: "Optional_Data",
	});
	console.log(msg);
	fs.appendFileSync(dir + filename, msg + "\n");
}
