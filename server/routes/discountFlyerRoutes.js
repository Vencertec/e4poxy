const express = require("express");
const dbClient = require("../client/dbClient");

const router = express.Router();

router.post("/update", async (req, res) => {
    const base64String=req.body.base64String;
    try {
        const result = await dbClient.updateDiscountFlyer(base64String);
        if(result=="success"){
            res.status(200).json({ status: "success",message:"request success" });
        }
        else{
            res.status(200).json({ status:"fail",message:result });
        } 
    }catch(err){
        console.log(err);
        res.status(200).json({ status:"fail",message:"server error. unknown reason" });
    }
});

module.exports = router;