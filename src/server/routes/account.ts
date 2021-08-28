import express from "express";
const router = express.Router();
import { User, UserDocument, AuthToken } from "../models/User";
import { CallbackError, NativeError } from "mongoose";

import Account from "../models/Account";

const id = "mitchid"; //TODO: NEED TO REMOVE THIS
let auth = false; //TODO: ADD AUTH CHECK

router.get("/", async (req, res) => {
	if (auth) {
		res.redirect(`account/${id}`);
	} else {
		res.redirect("account/register");
	}
});

router.get("/register", async (req, res) => {
	if (req.user) {
		return res.redirect("/");
	}
	res.render("account/register", { account: new Account() });
});

router.post("/register", async (req, res, next) => {
	try {
		const account = {
			id: req.body.id,
			displayName: req.body.displayName,
			email: req.body.email,
		};
		res.send(account);
		// res.redirect(`account/${account.id}`);
		auth = true;
	} catch {
		res.redirect("account/register");
	}

	//TODO: ADD FORM FIELD VALIDATION

	const user = new User({
		email: req.body.email,
		password: req.body.password,
	});

	User.findOne(
		{ email: req.body.email },
		(err: NativeError, existingUser: UserDocument) => {
			if (err) {
				return next(err);
			}
			if (existingUser) {
				req.flash(
					"errors",
					"Account with that email address already exists.",
				);
				return res.redirect("account/register");
			}
			user.save((err) => {
				if (err) {
					return next(err);
				}
				req.logIn(user, (err) => {
					if (err) {
						return next(err);
					}
					res.redirect("account/");
				});
			});
		},
	);
});

router.get("/:id", async (req, res) => {
	// try {
	// 	const account = await Account.find({ id: id });
	// 	console.log(account);
	// } catch {
	// 	res.send("Error getting account info from db"); //FIXME: CHANGE THIS
	// 	// res.redirect("/");
	// }

	const temp = {
		id: req.params.id,
		displayName: req.params.id,
		email: "mitch@something.com",
	};
	res.render("account/index", {
		account: temp,
	});
});

router.put("/:id", async (req, res) => {
	let account;
	try {
		console.log(req.params.id);
		account = await Account.findById(req.params.id);
		console.log(account);
		account.displayName = req.body.displayName;
		account.email = req.body.email;
		await account.save();
		res.redirect(`account`);
	} catch {
		if (account == null) {
			res.send("account is null");
		} else {
			res.send("account creation error");
			// res.render("account/", {
			// 	account: account,
			// 	errorMessage: "Error updating Account Info",
			// });
		}
	}
});

export default router;
