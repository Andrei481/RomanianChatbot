const express = require("express");
const mongoose = require("mongoose");

const app = express();

// mongoose
//     .connect(secret.mongoDbUrl, { useNewUrlParser: true, useUnifiedTopology: true, })
//     .then(() => { console.log("Connected to MongoDB"); })
//     .catch((err) => { console.log("Error Connecting to MongoDB"); });

const serverPort = 3000;
app.listen(serverPort, () => {
    console.log(`Server is running on port: ${serverPort}`);
});