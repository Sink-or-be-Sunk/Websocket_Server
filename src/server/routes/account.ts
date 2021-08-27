import express from "express";
import Account from "../models/Account";
const router = express.Router();

const id = "mitchid"; //TODO: NEED TO REMOVE THIS

router.get("/", async (req, res) => {
	const auth = true; //TODO: ADD AUTH CHECK
	if (auth) {
		res.redirect(`account/${id}`);
	} else {
		res.send("login page"); //TODO: ADD AUTH/LOGIN PAGE
	}
});

router.get("/:id", async (req, res) => {
	const account = {
		id: req.params.id,
		displayName: req.params.id,
		email: "mitch@something.com",
	};
	res.render("account/index", {
		account: account,
	});

	// try {
	// 	const account = await Account.find({ id: id });
	// 	console.log(account);
	// } catch {
	// 	res.send("Error getting account info from db"); //FIXME: CHANGE THIS
	// 	// res.redirect("/");
	// }
});

router.put("/:id", async (req, res) => {
	res.send(req.body);
});

export default router;
