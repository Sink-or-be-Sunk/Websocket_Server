import express from "express";
const router = express.Router();

router.get("/", (req, res) => {
	res.render("logger/index", { header: true });
});

export default router;
