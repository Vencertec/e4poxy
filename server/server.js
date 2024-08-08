const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const cors = require("cors");
const https = require("https");
const fs = require("fs");
// const dbClient = require("./client/dbClient");

const app = express();

// Serve the static files (HTML, CSS, JS) from the public folder
app.use(express.static("public"));
// app.use(express.json());
// app.use(bodyParser.json());
// app.use(express.json({
//   limit: '50mb',
//   // Because Stripe needs the raw body, we compute it but only when hitting the Stripe callback URL.
//   verify: function(req,res,buf) {
//       var url = req.originalUrl;
//       if (url.startsWith('/payment/stripePaymentWebhook')) {
//           req.rawBody = buf.toString()
//       }
//   }}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cors());
app.options("*", cors());
app.use('/Documents', express.static("Documents"));
app.use('/color-charts', express.static("color-charts"));
app.use('/discountFlyer', express.static("discountFlyer"));

const accountRoutes = require("./routes/accountRoutes");
app.use("/account", accountRoutes);
const productsRoutes = require("./routes/productsRoutes");
app.use("/products", productsRoutes);
const SDSRoutes = require("./routes/SDSRoutes");
app.use("/SDS", SDSRoutes);
const TDSRoutes = require("./routes/TDSRoutes");
app.use("/TDS", TDSRoutes);
const colorChartsRoutes = require("./routes/colorChartsRoutes");
app.use("/colorCharts", colorChartsRoutes);
const calculationsRoutes = require("./routes/calculationsRoutes");
app.use("/calculationsConfig", calculationsRoutes);
const floorWarsRoutes = require("./routes/floorWarsRoutes");
app.use("/floorWars", floorWarsRoutes);
const sponserRoutes = require("./routes/sponserRoutes");
app.use("/sponser", sponserRoutes);
const locationsRoutes=require("./routes/locationsRoutes");
app.use("/locations",locationsRoutes);
const discountFlyerRoutes=require("./routes/discountFlyerRoutes");
app.use("/discountFlyer",discountFlyerRoutes);
const trainingsRoutes=require("./routes/trainingsRoutes");
app.use("/trainings",trainingsRoutes);

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "./public/index.html"));
});

// Load the SSL certificate and private key
// const privateKey = fs.readFileSync("./cert/key.pem", "utf8");
// const certificate = fs.readFileSync("./cert/cert.pem", "utf8");

// // Create an HTTPS server
const server = https.createServer(
  // {
  //   key: privateKey,
  //   cert: certificate,
  // },
  app
);
const port = 3000;
app.get("/test", async (req, res) => {
  try {
    res.status(200).json({ message: "Test Successful" });
  } catch (err) {
    console.error("Error saving user:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
// Start the server
app.listen(port, () => {
  console.log(`Server is running on https://localhost:${port}`);
});
