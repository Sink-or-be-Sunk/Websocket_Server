import { REGISTER_TYPE } from "./src/models/registration/RegisterRequest";
import { REQ_TYPE } from "./src/util/WSClientMessage";
import fs from "fs";

function generate(name: string, e: any) {
	fs.appendFileSync(output, `namespace ${name}\n`);
	fs.appendFileSync(output, "{\n");

	for (const req in e) {
		fs.appendFileSync(output, `\tconstexpr char ${req}[] = "${e[req]}";\n`);
	}
	fs.appendFileSync(output, "}\n");
}

const dir = "./dist/export/";
const filename = "WSClientMessage.h";
const output = dir + filename;

console.log(`Writing to ${output} ...`);

if (!fs.existsSync(dir)) {
	fs.mkdirSync(dir);
}

fs.writeFileSync(output, "#pragma once\n"); //header
fs.appendFileSync(output, "\n");
fs.appendFileSync(output, '#include "cJSON.h"\n');
fs.appendFileSync(output, '#include "<string.h>"\n');
fs.appendFileSync(output, '#include "<stdio.h>"\n');
fs.appendFileSync(output, '#include "<esp_wifi.h>"\n');
fs.appendFileSync(output, "\n");

generate(Object.keys({ REQ_TYPE })[0], REQ_TYPE); //Websocket Requests
generate(Object.keys({ REGISTER_TYPE })[0], REGISTER_TYPE); //Websocket Requests

console.log("...commands exported");
