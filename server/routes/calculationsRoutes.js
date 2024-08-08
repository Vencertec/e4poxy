const express = require("express");
const dbClient = require("../client/dbClient");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const files = await dbClient.getCalculationsConfigData();
    res.status(200).json({ data: files });
  } catch (err) {
    console.error("Error getCalculationsConfigData:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
router.post("/edit", async (req, res) => {
  const type=req.body.type;
  const name=req.body.name;
  const costPerKit=req.body.costPerKit;
  const sqftPerKit=req.body.sqftPerKit;
  try {
      const result = await dbClient.editCalculationsConfigData(type,name,costPerKit,sqftPerKit);
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