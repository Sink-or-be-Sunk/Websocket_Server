import mongoose from "mongoose";

export enum FriendStatus {
    ADD_FRIEND,
    REQUESTED,
    PENDING,
    FRIENDS
}
export type FriendDocument = mongoose.Document & {
    requester: mongoose.Schema.Types.ObjectId;
    recipient: mongoose.Schema.Types.ObjectId;

    status: FriendStatus;
};


const friendSchema = new mongoose.Schema<FriendDocument>({
	requester: { type: mongoose.Schema.Types.ObjectId, ref: "User"},
	recipient: { type: mongoose.Schema.Types.ObjectId, ref: "User"},
	status: {
		type: Number,
		enums: FriendStatus
	}
}, {timestamps: true});
module.exports = mongoose.model("Friend", friendSchema);

export const Friend = mongoose.model<FriendDocument>("Friend", friendSchema);
