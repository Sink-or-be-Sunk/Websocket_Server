import mongoose from "mongoose";
import { UserDocument, User } from "../../src/models/User";
import { FriendDocument, Friend } from "../../src/models/Friend";
import { DBManager, DBFriend } from "../../src/models/database/DBManager";
import { DB_REQ_TYPE } from "../../src/models/database/DBRequest";
import { MONGODB_URI } from "../../src/util/secrets";
import { REQ_TYPE, WSClientMessage } from "../../src/util/WSClientMessage";
import {
	SERVER_HEADERS,
	WSServerMessage,
} from "../../src/util/WSServerMessage";

const fakeID = new mongoose.Types.ObjectId();

beforeAll(() => {
	mongoose
		.connect(MONGODB_URI)
		.then(async () => {
			//empty
		})
		.catch((err) => {
			console.log(
				`MongoDB connection error. Please make sure MongoDB is running. ${err}`,
			);
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
		const response = [
			new WSServerMessage({
				header: SERVER_HEADERS.DATABASE_SUCCESS,
				at: obj.id,
				payload: [
					new DBFriend("m", "m"),
					new DBFriend("test", "test display name"),
				],
			}),
		];
		expect(friends).toEqual(response);
	});
});
