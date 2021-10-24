import mongoose from "mongoose";
import { DBManager, DBFriend } from "../../src/models/database/DBManager";
import { DB_REQ_TYPE } from "../../src/models/database/DBRequest";
import { MONGODB_URI } from "../../src/util/secrets";
import { REQ_TYPE, WSClientMessage } from "../../src/util/WSClientMessage";
import {
	SERVER_HEADERS,
	WSServerMessage,
} from "../../src/util/WSServerMessage";

beforeAll(() => {
	mongoose
		.connect(MONGODB_URI)
		.then(() => {
			/** ready to use. The `mongoose.connect()` promise resolves to undefined. */
		})
		.catch((err) => {
			console.log(
				`MongoDB connection error. Please make sure MongoDB is running. ${err}`,
			);
			// process.exit();
		});
});

afterAll(async () => {
	await mongoose.connection.close();
});

describe("Handle Database Requests", () => {
	const manager = new DBManager();
	it("Get Friends List", async () => {
		const req = { type: DB_REQ_TYPE.GET_FRIENDS };
		const obj = { id: "mitchaarndt", req: REQ_TYPE.DATABASE, data: req };
		const str = JSON.stringify(obj);
		const msg = new WSClientMessage(str);
		const friends = await manager.handleReq(msg);
		const response = new WSServerMessage({
			header: SERVER_HEADERS.DATABASE_SUCCESS,
			at: obj.id,
			payload: [new DBFriend("m", "m"), new DBFriend("test", "test")],
		});
		expect(friends).toBe(response);
	});
});
