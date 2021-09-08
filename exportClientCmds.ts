import * as WSClientMessage from "./src/util/WSClientMessage";
import fs from "fs";

const dir = "./dist/export/";
const filename = "WSClientMessage.h";
const output = dir + filename;

console.log(`Writing to ${output} ...`);

if (!fs.existsSync(dir)) {
	fs.mkdirSync(dir);
}

fs.writeFileSync(output, "#pragma once\n"); //header
fs.appendFileSync(output, `\n`);
fs.appendFileSync(output, `#include "cJSON.h"\n`);
fs.appendFileSync(output, `#include "<string.h>"\n`);
fs.appendFileSync(output, `#include "<stdio.h>"\n`);
fs.appendFileSync(output, `#include "<esp_wifi.h>"\n`);
fs.appendFileSync(output, `\n`);

fs.appendFileSync(output, `namespace req_type\n`);
fs.appendFileSync(output, `{\n`);
for (const req in WSClientMessage.REQ_TYPE) {
	// const msg = JSON.stringify({
	// 	id: "Player_ID",
	// 	req: req,
	// 	data: "Optional_Data",
	// });
	fs.appendFileSync(output, `\tconstexpr char ${req}[] = "${WSClientMessage.REQ_TYPE[req]}";\n`);
}
fs.appendFileSync(output, `}\n`);

console.log('...commands exported');
