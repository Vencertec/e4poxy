const express = require("express");
const dbClient = require("../client/dbClient");

const router = express.Router();

router.get("/all", async (req, res) => {
    try {
        const files = await dbClient.getColorChartsData();
        res.status(200).json({ data: files });
    } catch (err) {
        console.error("Error saving user:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

router.post("/add", async (req, res) => {
    const fileName=req.body.fileName;
    const base64String=req.body.base64String;
    const name=req.body.name;
    try {
        const result = await dbClient.addColorChart(fileName,base64String,name,null);
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
router.post("/edit", async (req, res) => {
    const oldFileName=req.body.oldFileName;
    const fileName=req.body.fileName;
    const base64String=req.body.base64String;
    const name=req.body.name;
    try {
        const result = await dbClient.addColorChart(fileName,base64String,name,oldFileName,false);
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
router.post("/delete", async (req, res) => {
    const fileName=req.body.fileName;
    try {
        const result = await dbClient.deleteColorChart(fileName);
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
