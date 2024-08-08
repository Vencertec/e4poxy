const { MongoClient, ObjectId } = require("mongodb");
const path = require("path");
const config = require("../config");
const { warn } = require("console");
const bcrypt = require("bcrypt");
const fs = require('fs');

const caFilePath = path.join(__dirname, "..", "global-bundle.pem");

var docDbInstance;
const dbName = config.getMongoDbName();

/**
 * Create AWS Document DB connection
 */
async function createDocDBConnection() {
  if (docDbInstance) return docDbInstance;

  var client = MongoClient.connect(config.getMongoDbUrl(), {
    tlsCAFile: [caFilePath],
  });

  docDbInstance = client;
  return client;
}
/**
 *
 * @param {Save user details} userDetails
 * @returns
 */
async function saveUser(userDetails) {
  const client = await createDocDBConnection();

  try {
    await client.connect();

    const db = client.db(dbName);
    const col = db.collection("user");
    const existingUser = await col.findOne({ email: userDetails.email });
    if (existingUser) {
      existingUser.isNewUser = false;
      console.log("User already exists:", existingUser);
      return existingUser;
    } else {
      if (userDetails.password) {
        const hashedPassword = await bcrypt.hash(userDetails.password, 10);
        userDetails.password = hashedPassword;
      }
      const result = await col.insertOne(userDetails);
      result.isNewUser = result.acknowledged;
      console.log("User inserted successfully:", result);
      return result;
    }
  } catch (err) {
    console.error("Error saving user:", err);
    throw err;
  }
}

/**
 *
 * @param {Validate the login users} loginDetails
 * @returns
 */
async function loginUser(loginDetails) {
  const client = await createDocDBConnection();

  try {
    await client.connect();

    const db = client.db(dbName);
    const col = db.collection("user");

    // const user = await col.findOne({ email: loginDetails.username });
    const user = await col.findOne({
      $or: [
        { email: loginDetails.email },
        { email: loginDetails.email.toLowerCase() }
      ]
    });
    if (!user) {
      return { message: "User not found" };
    }
    // const hash = await bcrypt.hash(loginDetails.password, 10);
    const result = await bcrypt.compare(loginDetails.password, user.password);
    console.log("login user user : ", user.password);
    console.log("login user loginDetails : ", loginDetails.password);
    console.log("login user result : ", result);
    if (loginDetails.password !== user.password && !result) {
      return { message: "Invalid password" };
    }
    console.log("login user: ", user);

    return { message: "Login successful", userId: user._id.toString(), user: user };
  } catch (err) {
    console.error("Error during login:", err);
    throw err;
  }
}
async function updateUserAccount(userDetails, operation) {
  const client = await createDocDBConnection();

  try {
    await client.connect();
    const db = client.db(dbName);

    const col = db.collection("user");

    if (operation === "reset-password") {
      const user = await col.findOne({ email: userDetails.email });

      let msg = { status: "warn", message: "User not found" };
      if (!user) {
        console.log(msg);
        return msg;
      }
      const hashedPassword = await bcrypt.hash(userDetails.password, 10);
      userDetails.password = hashedPassword;
      const result = await col.updateOne(
        { email: userDetails.email },
        {
          $set: {
            password: userDetails.password,
          },
        }
      );
      if (result.modifiedCount === 1) {
        msg = { status: "success", message: "Password updated successfully" };
        console.log(msg);
      } else {
        msg = {
          status: "warn",
          message: "Kindly enter the new password. Do not use old password.",
        };
        console.log("Password update failed");
      }
      return msg;
    }
  } catch (err) {
    console.error("Error saving the edited user:", err);
    throw err;
  }
}

async function getSDSData() {
  const client = await createDocDBConnection();

  try {
    await client.connect();
    const db = client.db(dbName);
    const col = db.collection("SDS");
    const data = await col.find({}).project({ name: 1 }).toArray();;
    return data
  } catch (err) {
    console.error("Error SDS:", err);
    throw err;
  }
}
async function getTDSData() {
  const client = await createDocDBConnection();

  try {
    await client.connect();

    const db = client.db(dbName);
    const col = db.collection("TDS");
    const data = await col.find({}).toArray();;
    return data
  } catch (err) {
    console.error("Error TDS:", err);
    throw err;
  }
}

async function addTDSData(fileName, base64String, oldFileName, newTDSData = true) {
  //process base64String
  const base64Data = base64String.replace('data:', '').replace(/^.+,/, '');
  //file targetpath
  const filePath = path.join(__dirname, '../Documents', fileName);


  if (newTDSData) {
    const client = await createDocDBConnection();
    try {
      await client.connect();
      const db = client.db(dbName);
      const col = db.collection("TDS");
      //check for existing colorchart
      const colorCharts = await col.find({ filename: fileName }).toArray();
      if (colorCharts && colorCharts.length > 0) {
        return "TDS document exists already";
      }
      else {
        const fileUploadResult = saveFile(base64Data, filePath);
        if (fileUploadResult) {
          try {
            const insertResult = await col.insertOne({ name: fileName, filename: fileName });
            return insertResult.insertedId ? "success" : "File Saved. Doc not inserted. DB Insert Failed";
          } catch (err) {
            console.error("DB Error Insert TDS:", err);
            return "File saved. Doc not inserted-dbConnectionFailure";
          }
        }
        else {
          return "Unable to Save File. Doc not inserted";
        }
      }
    } catch {
      return "Unable to connect to Db. DB Error";
    }
  }
  else {
    console.log("filePath " + filePath)
    const client = await createDocDBConnection();
    await client.connect();
    const db = client.db(dbName);
    const col = db.collection("TDS");
    // const result = await col.updateOne({ filename: fileName });
    const data = await col.updateOne({ filename: oldFileName }, {
      $set: {
        name: fileName,
        filename: fileName
      }
    });
    const fileUploadResult = saveFile(base64Data, filePath);
    if (fileUploadResult) {
      return "success";
    }
    else {
      return "Unable to Save File.";
    }
  }
  // check for existing
  // const client = await createDocDBConnection();
  // await client.connect();
  // const db = client.db(dbName);
  // const col = db.collection("TDS");
  //check for existing data
  // const TDSData = await col.find({ filename: fileName }).toArray();
  // if (newTDSData && TDSData.length > 0) return "TDS Data exists already";
  // if (!newTDSData && TDSData.length == 0) return "TDS Data does not exist to edit.";
  //save the file
  // const fileUploadResult = saveFile(base64Data, filePath);
  // if (fileUploadResult) {
  //   if (newTDSData) {
  //     try {
  //       //insert into db
  //       const insertResult = await col.insertOne({ name: fileName, filename: fileName });
  //       return insertResult.insertedId ? "success" : "File Saved. DB Insert Failed";
  //     } catch (err) {
  //       console.log("Unable to insert new TDS to DB. DB Error", err);
  //       return "Unable to insert new TDS to DB. DB Error. File Saved";
  //     }
  //   }
  //   else {
  //     console.log("filePath " + filePath)
  //     const client = await createDocDBConnection();
  //     await client.connect();
  //     const db = client.db(dbName);
  //     const col = db.collection("TDS");
  //     // const result = await col.updateOne({ filename: fileName });
  //     const data = await col.updateOne({ filename: oldFileName }, {
  //       $set: {
  //         name: fileName,
  //         filename: fileName
  //       }
  //     });
  //     const fileUploadResult = saveFile(base64Data, filePath);
  //     if (fileUploadResult) {
  //       return "success";
  //     }
  //     else{
  //       return "Unable to Save File.";
  //     }
  //   }
  // }
  // else return "unable to save file. Document not inserted/modified.";
}

async function deleteTDSData(fileName) {
  const client = await createDocDBConnection();
  await client.connect();
  const db = client.db(dbName);
  const col = db.collection("TDS");
  const result = await col.deleteOne({ filename: fileName });
  if (result.deletedCount == 1) {
    const filePath = path.join(__dirname, '../Documents', fileName);
    try {
      fs.unlinkSync(filePath);
      return "success";
    } catch (err) {
      console.log(err);
      return "file deletion failed. document delected from DB";
    }
  }
  else {
    return "no such TDS Exists";
  }
}
async function getColorChartsData() {
  const client = await createDocDBConnection();

  try {
    await client.connect();
    const db = client.db(dbName);
    const col = db.collection("ColorCharts");
    const data = await col.find({}).toArray();;
    return data
  } catch (err) {
    console.error("Error ColorCharts:", err);
    throw err;
  }
}

async function saveFile(base64Data, targetPath) {
  const buffer = Buffer.from(base64Data, 'base64');
  try {
    fs.writeFileSync(targetPath, buffer);
    return true
  } catch (err) {
    console.log(err);
    return false;
  }
}
//for adding or editing color chart
async function addColorChart(fileName, base64String, name, oldFileName, newColorChart = true) {

  //process base64String
  const base64Data = base64String.replace('data:', '').replace(/^.+,/, '');
  //file targetpath
  const filePath = path.join(__dirname, '../color-charts', fileName);
  if (newColorChart) {
    const client = await createDocDBConnection();
    try {
      await client.connect();
      const db = client.db(dbName);
      const col = db.collection("ColorCharts");
      //check for existing colorchart
      const colorCharts = await col.find({ filename: fileName }).toArray();
      if (colorCharts && colorCharts.length > 0) {
        return "colorChart exists already";
      }
      else {
        const fileUploadResult = saveFile(base64Data, filePath);
        if (fileUploadResult) {
          try {
            const insertResult = await col.insertOne({ name: name, filename: fileName });
            return insertResult.insertedId ? "success" : "File Saved. Doc not inserted. DB Insert Failed";
          } catch (err) {
            console.error("DB Error InsertColorCharts:", err);
            return "File saved. Doc not inserted-dbConnectionFailure";
          }
        }
        else {
          return "Unable to Save File. Doc not inserted";
        }
      }
    } catch {
      return "Unable to connect to Db. DB Error";
    }
  }
  else {
    console.log("filePath " + filePath)
    const client = await createDocDBConnection();
    await client.connect();
    const db = client.db(dbName);
    const col = db.collection("ColorCharts");
    // const result = await col.updateOne({ filename: fileName });
    const data = await col.updateOne({ filename: oldFileName }, {
      $set: {
        name: name,
        filename: fileName
      }
    });
    const fileUploadResult = saveFile(base64Data, filePath);
    if (fileUploadResult) {
      return "success";
    }
    else {
      return "Unable to Save File.";
    }
  }

}
async function deleteColorChart(fileName) {
  const client = await createDocDBConnection();
  await client.connect();
  const db = client.db(dbName);
  const col = db.collection("ColorCharts");
  const result = await col.deleteOne({ filename: fileName });
  if (result.deletedCount === 1) {
    const filePath = path.join(__dirname, '../color-charts', fileName);
    try {
      fs.unlinkSync(filePath);
      return "success";
    } catch (err) {
      console.log(err);
      return "file deletion failed. document delected from DB";
    }
  }
  else {
    return "no such colorChart exists";
  }
}
async function getProductsData() {
  const client = await createDocDBConnection();

  try {
    await client.connect();

    const db = client.db(dbName);
    const col = db.collection("Products");
    const data = await col.find({}).toArray();;
    return data
  } catch (err) {
    console.error("Error Products:", err);
    throw err;
  }
}
async function addProduct(productObject) {
  const client = await createDocDBConnection();
  try {
    await client.connect();
    const db = client.db(dbName);
    const col = db.collection("Products");
    const data = await col.insertOne(productObject);
    return data.acknowledged;
  } catch (err) {
    console.error("Error Products:", err);
    return false;
  }
}
async function updateProduct(productName, productUpdateObject) {
  const client = await createDocDBConnection();
  try {
    await client.connect();
    const db = client.db(dbName);
    const col = db.collection("Products");
    const data = await col.updateOne({ name: productName }, { $set: productUpdateObject });
    return data.acknowledged;
  } catch (err) {
    console.error("Error Products:", err);
    return false;
  }
}
async function deleteProduct(productName) {
  const client = await createDocDBConnection();
  try {
    await client.connect();
    const db = client.db(dbName);
    const col = db.collection("Products");
    const data = await col.deleteOne({ name: productName });
    return data.deletedCount == 1;
  } catch (err) {
    console.error("Error Products:", err);
    return false;
  }
}
async function getCalculationsConfigData() {
  const client = await createDocDBConnection();
  try {
    await client.connect();
    const db = client.db(dbName);
    const col = db.collection("calculationsConfig");
    const data = await col.find({}).toArray();;
    return data
  } catch (err) {
    console.error("Error calculationsConfig:", err);
    throw err;
  }
}
async function editCalculationsConfigData(type, name, costPerKit, sqftPerKit) {
  const client = await createDocDBConnection();
  try {
    await client.connect();
    const db = client.db(dbName);
    const col = db.collection("calculationsConfig");
    const data = await col.find({}).toArray();;
    console.log("data before config", data);
    if (type == "basepigments" || type == "pigmentForMetallics") {
      data[0][type][name]["costPerKit"] = costPerKit;
      // data[type][name]["sqftPerKit"] = sqftPerKit;
      console.log("data after basepigments config", data[0]);
      const replaceData = await col.replaceOne({ _id: data[0]._id }, data);;
    }
    else {
      var index = data[0][type].findIndex(x => x.name == name);
      if (index) {
        data[0][type][index]["costPerKit"] = costPerKit;
        data[0][type][index]["sqftPerKit"] = sqftPerKit;
        console.log("data after products config", data[0]);
        const replaceData = await col.replaceOne({ _id: data[0]._id }, data[0]);;
      }
      else {
        console.error("unable to find the name in edit calculationsConfig ", err);
        return "Unable to edit calculcation config"
      }
    }
    // return data
  } catch (err) {
    console.error("Error in edit calculationsConfig:", err);
    throw err;
  }
}
async function saveFloorWarRegistration(userDetails) {
  const client = await createDocDBConnection();

  try {
    await client.connect();

    const db = client.db(dbName);
    const col = db.collection("floorwars");

    const result = await col.insertOne(userDetails);
    console.log("Registration inserted successfully:", result);
    return result;
  } catch (err) {
    console.error("Error saving user:", err);
    throw err;
  }
}
async function saveSponserRegistration(userDetails) {
  const client = await createDocDBConnection();

  try {
    await client.connect();

    const db = client.db(dbName);
    const col = db.collection("sponsers");

    const result = await col.insertOne(userDetails);
    console.log("Registration inserted successfully:", result);
    return result;
  } catch (err) {
    console.error("Error saving user:", err);
    throw err;
  }
}
async function getLocationsData() {
  const client = await createDocDBConnection();

  try {
    await client.connect();
    const db = client.db(dbName);
    const col = db.collection("locations");
    const data = await col.find({}).toArray();;
    return data
  } catch (err) {
    console.error("Error Products:", err);
    throw err;
  }
}
async function addAddress(addressObject, addressType) {
  const client = await createDocDBConnection();
  try {
    await client.connect();
    const db = client.db(dbName);
    const col = db.collection("locations");
    const result = await col.find({ type: addressType }).toArray();
    if (result.length > 0) {
      try {
        const response = await col.updateOne({ type: addressType }, { $push: { addresses: addressObject } });
        return "success";
      } catch {
        console.log(error);
        return "unable to update."
      }
    }
    else {
      try {
        const response = await col.insertOne({ type: addressType, addresses: [{ addressObject }] });
        return "success";
      } catch {
        console.log(error);
        return "unable to insert"
      }
    }
  } catch (err) {
    console.error("Error Products:", err);
    return "unable to connect DB.";
  }
}
async function deleteAddress(addressName, addressType) {
  const client = await createDocDBConnection();
  try {
    await client.connect();
    const db = client.db(dbName);
    const col = db.collection("locations");
    try {
      const response = await col.updateOne({ type: addressType }, { $pull: { addresses: { name: addressName } } });
      if (response.modifiedCount > 0) return "success";
      else return "No such name matching for the addressType";
    } catch {
      console.log(error);
      return "unable to delete.";
    }
  } catch (err) {
    console.error("Error DB", err);
    return "unable to connect DB.";
  }
}
async function updateDiscountFlyer(base64String) {
  //process base64String
  const base64Data = base64String.replace('data:', '').replace(/^.+,/, '');
  //file targetpath
  const filePath = path.join(__dirname, '../discountFlyer', "discountFlyer.jpg");

  const fileUploadResult = saveFile(base64Data, filePath);
  if (fileUploadResult) {
    return "success";
  }
  else {
    return "Unable to Save File.";
  }
}
async function getTrainingsData() {
  const client = await createDocDBConnection();
  try {
    await client.connect();
    const db = client.db(dbName);
    const col = db.collection("trainings");
    const trainings = await col.find({}).toArray();;
    return trainings;
  } catch (err) {
    console.error("Error Products:", err);
    throw err;
  }
}
async function addTrainings(trainingObjectsArray) {
  const client = await createDocDBConnection();
  try {
    await client.connect();
    const db = client.db(dbName);
    const col = db.collection("trainings");
    const data = await col.insertMany(trainingObjectsArray);
    return data.acknowledged;
  } catch (err) {
    console.error("Error adding training:", err);
    return false;
  }
}
async function updateTraining(trainingTitle, trainingLocation, trainingUpdationObject) {
  const client = await createDocDBConnection();
  try {
    await client.connect();
    const db = client.db(dbName);
    const col = db.collection("trainings");
    const data = await col.updateOne({ title: trainingTitle, Location: trainingLocation }, { $set: trainingUpdationObject });
    if (data.modifiedCount > 0) return "success";
    else return "No such document with given Title and Location."
  } catch (err) {
    console.error("Error Training Updation", err);
    return "DB Server Error";
  }
}
module.exports = {
  saveUser,
  loginUser,
  updateUserAccount,
  getSDSData,
  getTDSData,
  addTDSData,
  deleteTDSData,
  getColorChartsData,
  addColorChart,
  deleteColorChart,
  getProductsData,
  addProduct,
  updateProduct,
  deleteProduct,
  getCalculationsConfigData,
  editCalculationsConfigData,
  saveFloorWarRegistration,
  saveSponserRegistration,
  getLocationsData,
  addAddress,
  deleteAddress,
  updateDiscountFlyer,
  getTrainingsData,
  addTrainings,
  updateTraining
};
