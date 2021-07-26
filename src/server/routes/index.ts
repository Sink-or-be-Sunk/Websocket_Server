import express from "express";
const router = express.Router();

router.get("/", (req, res) => {
	res.render("index", { header: true });
});

export default router;
