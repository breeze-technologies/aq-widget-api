import express from "express";
const router = express.Router();

router.get("/", (req, res, next) => {
    res.json({ Hello: "World" });
});

export default router;
