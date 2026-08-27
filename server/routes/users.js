const express = require("express");
const requireAuth = require("../middleware/auth");
const User = require("../models/User");

const router = express.Router();

router.get("/me", requireAuth, async (req, res) => {
  const user = await User.findById(req.userId).select("-passwordHash");
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }
  res.json({ user });
});

module.exports = router;
