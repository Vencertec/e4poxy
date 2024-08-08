const express = require("express");
const dbClient = require("../client/dbClient");

const router = express.Router();

router.get("/all", async (req, res) => {
    try {
        const trainings = await dbClient.getTrainingsData();
        res.status(200).json({ data: trainings });
    } catch (err) {
        console.error("Error getting trainings Data:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});
router.post("/add", async (req, res) => {
    const trainingObject=req.body.training;
    try {
        const result = await dbClient.addTrainings([trainingObject]);
        if(result){
            res.status(200).json({ status: "success",message:"request success" });
        }
        else{
            res.status(200).json({ status:"fail",message:"unable to add training" });
        } 
    }catch(err){
        console.log(err);
        res.status(200).json({ status:"fail",message:"server error. unknown reason" });
    }
});
router.post("/addMultiple", async (req, res) => {
    const trainingsArray=req.body.trainings;
    try {
        const result = await dbClient.addTrainings(trainingsArray);
        if(result){
            res.status(200).json({ status: "success",message:"request success" });
        }
        else{
            res.status(200).json({ status:"fail",message:"unable to add training" });
        } 
    }catch(err){
        console.log(err);
        res.status(200).json({ status:"fail",message:"server error. unknown reason" });
    }
});
router.post("/update", async (req, res) => {
    const trainingTitle=req.body.title;
    const trainingLocation=req.body.location;
    const trainingUpdationObject=req.body.trainingUpdationObject;
    try {
        const result = await dbClient.updateTraining(trainingTitle,trainingLocation,trainingUpdationObject);
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
// router.post("/delete", async (req, res) => {
//     const fileName=req.body.fileName;
//     try {
//         const result = await dbClient.deleteTDSData(fileName);
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

module.exports = router;