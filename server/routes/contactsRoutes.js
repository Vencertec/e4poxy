const express = require("express");
const dbClient = require("../client/dbClient");

const router = express.Router();

router.get("/all", async (req, res) => {
  try {
    const files = await dbClient.getProductsData();
    res.status(200).json({ data: files });
  } catch (err) {
    console.error("Error saving user:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/add", async (req, res) => {
  const productObject=req.body.productObject;
  try {
      const result = await dbClient.addProduct(productObject);
      if(result){
          res.status(200).json({ status: "success",message:"Inserted Successfully" });
      }
      else{
          res.status(200).json({ status:"fail",message:"unable to insert." });
      } 
  }catch(err){
      console.log(err);
      res.status(200).json({ status:"fail",message:"DB server error. unknown reason" });
  }
});
router.post("/update", async (req, res) => {
  const productName=req.body.productName;
  const productUpdateObject=req.body.updateObject;
  try {
      const result = await dbClient.updateProduct(productName,productUpdateObject);
      if(result){
        res.status(200).json({ status: "success",message:"Updated Successfully" });
    }
    else{
        res.status(200).json({ status:"fail",message:"unable to update." });
    } 
  }catch(err){
      console.log(err);
      res.status(200).json({ status:"fail",message:"DB server error. unknown reason" });
  }
});
router.post("/delete", async (req, res) => {
  const productName=req.body.productName;
  try {
      const result = await dbClient.deleteProduct(productName);
      if(result){
        res.status(200).json({ status: "success",message:`${productName} Deleted` });
    }
    else{
        res.status(200).json({ status:"fail",message:"unable to delete." });
    } 
  }catch(err){
      console.log(err);
      res.status(200).json({ status:"fail",message:"DB server error. unknown reason" });
  }
});

module.exports = router;