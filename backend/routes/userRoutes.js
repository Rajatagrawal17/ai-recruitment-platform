const authorizeRoles = require("../middleware/roleMiddleware");

const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");

router.get("/profile", protect, (req, res) => {
  res.json({
    message: "Profile data fetched successfully",
    user: req.user
  });
});
router.get(
  "/admin",
  protect,
  authorizeRoles("admin"),
  (req, res) => {
    res.json({
      success: true,
      message: "Welcome Admin 👑",
    });
  }
);


module.exports = router;
