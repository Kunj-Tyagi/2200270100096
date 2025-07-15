const express = require("express");
const router = express.Router();
const {
  createShortUrl,
  handleRedirect,
  getStats,
} = require("../controllers/urlController");

router.post("/shorturls", createShortUrl);
router.get("/shorturls/:shortcode", getStats);
router.get("/:shortcode", handleRedirect);

module.exports = router;
