const express = require("express");
const dbClient = require("../client/dbClient");
const config = require("../config");
const jwt = require("jsonwebtoken");

const router = express.Router();
/**
 * Account registration
 */
router.post("/register", async (req, res) => {
  // try {
  //   const userDetails = req.body;
  //   console.log("body "+JSON.stringify(userDetails))
  //   res.status(200).json({ messasge: "User successfullly registered" });

  // } catch (err) {
  //   console.error("Error saving user:", err);
  //   res.status(500).json({ error: "Internal Server Error" });
  // }
  try {
    const userDetails = req.body;
    const savedUser = await dbClient.saveUser(userDetails);
    console.log("User: ", savedUser);
    if(!savedUser.isNewUser){
      res.status(200).json({
        "message": "User already exists",
        "status":"ERROR"
      });
    }

    const savedUserId = savedUser.insertedId
      ? savedUser.insertedId
      : savedUser._id.toString();

    if (savedUserId) {
      const token = jwt.sign({ userId: savedUserId }, config.getJwtSecret(), {
        expiresIn: config.getJwtExpiresTime(),
      });

      savedUser.token = token;
    }

    console.log("msg: ", savedUser);

    res.json({
      "message": "Registration successful",
      "user": savedUser
    });
  } catch (err) {
    console.error("Error saving user:", err);
    res.status(500).json({ "status":"ERROR", message: "Internal Server Error" });
  }
});

/**
 * login user
 */
router.post("/login", async (req, res) => {
  // try {
  //   const loginDetails = req.body;
  //   console.log("loginDetails "+JSON.stringify(loginDetails))
  //   res.status(200).json({ message: "User successfully logged in" });
  // } catch (err) {
  //   console.error("Error saving user:", err);
  //   res.status(500).json({ error: "Internal Server Error" });
  // }
  try {
    const loginDetails = req.body;
    const loggedUser = await dbClient.loginUser(loginDetails);
    console.log("Logged-in user: ", loggedUser);

    if (loggedUser.userId) {
      const token = jwt.sign(
        { userId: loggedUser.userId },
        config.getJwtSecret(),
        {
          expiresIn: config.getJwtExpiresTime(),
        }
      );

      loggedUser.token = token;
    }

    res.json(loggedUser);
  } catch (err) {
    console.error("Error saving user:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/test", async (req, res) => {
  try {
    // const loginDetails = req.body;
    // console.log("loginDetails "+JSON.stringify(loginDetails))
    res.status(200).json({ message: "User successfully logged in" });
  } catch (err) {
    console.error("Error saving user:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/reset-password", async (req, res) => {
  try {
    const updatedAccountDetails = req.body;
    const updatedDetails = await dbClient.updateUserAccount(
      updatedAccountDetails,
      "reset-password"
    );
    console.log("user password updated: ", updatedDetails);

    res.status(200).json(updatedDetails);
  } catch (err) {
    console.error("Error saving user:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;