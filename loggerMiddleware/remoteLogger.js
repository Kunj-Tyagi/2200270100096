const axios = require("axios");
require("dotenv").config();

const log = async (stack, level, pkg, message) => {
  try {
    await axios.post("http://20.244.56.144/log", {
      stack,
      level,
      package: pkg,
      message,
    }, {
      headers: {
        Authorization: `Bearer ${process.env.ACCESS_TOKEN}`,
      },
    });
  } catch (err) {
    console.error("Failed to send log:", err.message);
  }
};

module.exports = log;
