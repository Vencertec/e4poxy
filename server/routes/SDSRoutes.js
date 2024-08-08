const express = require("express");
const dbClient = require("../client/dbClient");

const router = express.Router();

router.get("/all", async (req, res) => {
  try {
    const files = await dbClient.getSDSData();
    console.log("SDS :", JSON.stringify(files));
    res.status(200).json({ SDS: files });
  } catch (err) {
    console.error("Error saving user:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;