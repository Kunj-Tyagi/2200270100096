const Url = require("../models/Url");
const generateShortcode = require("../utils/generateShortcode");
const log = require("../../loggerMiddleware/remoteLogger.js");

exports.createShortUrl = async (req, res, next) => {
  try {
    const { url, validity = 30, shortcode } = req.body;
    if (!url || !/^https?:\/\/.+/.test(url)) {
      log("backend", "error", "url-controller", "Invalid URL provided");
      return res.status(400).json({ error: "Invalid or missing URL" });
    }

    let finalShortcode = shortcode || generateShortcode();
    const existing = await Url.findOne({ shortcode: finalShortcode });

    if (existing && shortcode) {
      log("backend", "error", "url-controller", "Shortcode already exists");
      return res.status(409).json({ error: "Shortcode already exists" });
    }
    if (existing && !shortcode) finalShortcode = generateShortcode();

    const expiry = new Date(Date.now() + validity * 60000);

    const newUrl = await Url.create({
      shortcode: finalShortcode,
      originalUrl: url,
      expiry,
    });

    log("backend", "info", "url-controller", "Short URL created successfully");
    res.status(201).json({
      shortLink: `https://${req.headers.host}/${finalShortcode}`,
      expiry: expiry.toISOString(),
    });
  } catch (err) {
    log("backend", "fatal", "url-controller", err.message);
    next(err);
  }
};


exports.handleRedirect = async (req, res) => {
  try {
    const shortcode = req.params.shortcode;

    const urlEntry = await Url.findOne({ shortcode });
    if (!urlEntry) {
      console.warn("Shortcode not found:", shortcode);
      return res.status(404).json({ error: "Shortcode not found" });
    }

    if (urlEntry.expiry && new Date() > urlEntry.expiry) {
      console.warn("URL expired:", urlEntry.expiry);
      return res.status(410).json({ error: "Short URL expired" });
    }

    if (!/^https?:\/\//.test(urlEntry.originalUrl)) {
      console.warn("Invalid URL format:", urlEntry.originalUrl);
      return res.status(400).json({ error: "Invalid original URL" });
    }

    urlEntry.visitHistory = urlEntry.visitHistory || [];
    urlEntry.visitHistory.push({ timestamp: Date.now() });

    await urlEntry.save();

    return res.redirect(urlEntry.originalUrl);
  } catch (err) {
    console.error("Redirect Error:", err.message);
    return res.status(500).json({ error: "Internal server error" });
  }
};



exports.getStats = async (req, res, next) => {
  try {
    const { shortcode } = req.params;
    const urlData = await Url.findOne({ shortcode });

    if (!urlData) return res.status(404).json({ error: "Shortcode not found" });

    log("backend", "info", "url-controller", `Stats fetched for ${shortcode}`);
    res.json({
      originalUrl: urlData.originalUrl,
      createdAt: urlData.createdAt,
      expiry: urlData.expiry,
      totalClicks: urlData.clickCount,
      clickLogs: urlData.clickLogs,
    });
  } catch (err) {
    log("backend", "error", "url-controller", err.message);
    next(err);
  }
};

