import mongoose, { ObjectId } from "mongoose";
import { User } from "./User";

export enum FriendStatus {
	REQUESTED,
	PENDING,
	FRIENDS,
}
export type FriendDocument = mongoose.Document & {
	requester: mongoose.Schema.Types.ObjectId;
	recipient: mongoose.Schema.Types.ObjectId;

	requesterStatus: FriendStatus;
	recipientStatus: FriendStatus;
};

const friendSchema = new mongoose.Schema<FriendDocument>(
	{
		requester: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
		recipient: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
		recipientStatus: {
			type: Number,
			enums: FriendStatus,
		},
		requesterStatus: {
			type: Number,
			enums: FriendStatus,
		},
	},
	{ timestamps: true },
);
export const Friend = mongoose.model<FriendDocument>("Friend", friendSchema);
