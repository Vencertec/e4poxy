const express = require("express");
const dbClient = require("../client/dbClient");

const router = express.Router();

router.get("/all", async (req, res) => {
    try {
        const data = await dbClient.getLocationsData();
        res.status(200).json({ data: data });
    } catch (err) {
        console.error("Error saving user:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});
router.post("/add", async (req, res) => {
    const addressObject=req.body.address;
    const addressType=req.body.type;
    try {
        const result = await dbClient.addAddress(addressObject,addressType);
        if(result=="success"){
            res.status(200).json({ status: "success",message:"request success" });
        }
        else{
            res.status(200).json({ status:"fail",message:result});
        }
    }catch(err){
        console.log(err);
        res.status(200).json({ status:"fail",message:"server error. unknown reason" });
    }
});
// router.post("/edit", async (req, res) => {
//     const fileName=req.body.fileName;
//     const base64String=req.body.base64String;
//     try {
//         const result = await dbClient.addTDSData(fileName,base64String,false);
//         if(result=="success"){
//             res.status(200).json({ status: "success",message:"request success" });
//         }
//         else{
//             res.status(200).json({ status:"fail",message:result });
//         } 
//     }catch(err){
//         console.log(err);
//         res.status(200).json({ status:"fail",message:"server error. unknown reason" });
//     }
// });
router.post("/delete", async (req, res) => {
    const addressName=req.body.name;
    const addressType=req.body.type;
    try {
        const result = await dbClient.deleteAddress(addressName,addressType);
        if(result=="success"){
            res.status(200).json({ status: "success",message:"request success" });
        }
        else{
            res.status(200).json({ status:"fail",message:result});
        }
    }catch(err){
        console.log(err);
        res.status(200).json({ status:"fail",message:"server error. unknown reason" });
    }
});

module.exports = router;