import express from "express";
const router = express.Router();

router.get("/", (req, res) => {
	res.render("game/index", { header: false });
});

export default router;
