const express = require("express");
const mongoose = require("mongoose");

const app = express();
const serverPort = 3000;
require('dotenv').config();


mongoose.connect(process.env.MONGO_CONNECTION_STRING)
.then(() => { 
    console.log("Connected to MongoDB"); 
})
.catch((err) => { 
    console.log("Error Connecting to MongoDB"); 
});

app.listen(serverPort, () => {
    console.log(`Server is running on port: ${serverPort}`);
});
