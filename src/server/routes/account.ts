import express from "express";
import Account from "../models/Account";
import bcryptjs from "bcryptjs";
const router = express.Router();

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
	const account = { id: null, displayName: null, email: null };
	res.render("account/register", { account: account });
});

router.post("/register", async (req, res) => {
	try {
		const hashedPass = await bcryptjs.hash(req.body.password, 10);
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
