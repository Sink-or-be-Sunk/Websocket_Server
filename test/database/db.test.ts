import mongoose from "mongoose";
import { DBManager } from "../../src/models/database/DBManager";
import { MONGODB_URI } from "../../src/util/secrets";

beforeAll(() => {
	mongoose
		.connect(MONGODB_URI, {
			useNewUrlParser: true,
			useCreateIndex: true,
			useUnifiedTopology: true,
		})
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

describe("Validate Mongoose DB calls", () => {
	const manager = new DBManager();

	it("Get Friends List", async () => {
		await manager.getFriends("mitchaarndt");
		expect(true).toBe(true);
	});
});
