import { Request, Response } from "express";
import { UserDocument } from "../models/User";
import { FriendDocument } from "../models/Friend";
import { DBManager } from "../models/database/DBManager";

/**
 * Game page.
 * @route GET /game
 */
export const getGame3D = (req: Request, res: Response) => {
	res.render("game/game3D", {
		title: "Game 3D",
	});
};

/**
 * game messenger page.
 * @route GET /messenger
 */
export const getGame2D = (req: Request, res: Response) => {
	const user = req.user as UserDocument;

	const friendsList = [];
	for (let i = 0; i < user.friends.length; i++) {
		const friend = user.friends[i] as unknown as FriendDocument;
		const friendUserDoc = DBManager.chooseUserDoc(friend, user.username);
		friendsList.push({
			username: friendUserDoc.username,
			displayName: friendUserDoc.profile.name
				? friendUserDoc.profile.name
				: friendUserDoc.username,
		});
	}
	res.render("game/game2D", {
		title: "Game 2D",
		friendsList: friendsList,
	});
};
