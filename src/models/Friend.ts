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

friendSchema.pre(/[d,D]elete/, function remove(next) {
	const query = this as unknown as mongoose.Query<any, FriendDocument>;
	const str = query.getFilter()["_id"] as any;
	const id = str._id;
	console.log(id);
	User.updateMany(
		{ friends: id },
		{ $pull: { friends: id } },
		undefined,
		(err, res) => {
			console.log("pre delete");
			console.log(err);
			console.log(res);
			next(err);
		},
	);
});
export const Friend = mongoose.model<FriendDocument>("Friend", friendSchema);
