import { Schema, model, connect, Mongoose } from "mongoose";

interface Account {
	id: string; //esp32 mac address
	email: string;
	displayName: string;
}

const accountSchema = new Schema<Account>({
	id: { type: String, required: true },
	email: { type: String, required: true },
	displayName: String,
});

export default model("Account", accountSchema);
