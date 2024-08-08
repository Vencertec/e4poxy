const express = require("express");
const dbClient = require("../client/dbClient");

const router = express.Router();

router.post("/register", async (req, res) => {
    try {
        const registerDetails = req.body;
        const savedUser = await dbClient.saveFloorWarRegistration(registerDetails);
        console.log("registerDetails: ", savedUser);
        res.json({
            "message": "Registration successful",
        });
    } catch (err) {
        console.error("Error saving registerDetails:", err);
        res.status(500).json({ "status": "ERROR", message: "Internal Server Error" });
    }
});

module.exports = router;