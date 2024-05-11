const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const User = require("./models/user");

const app = express();
const serverPort = 3000;
require('dotenv').config();
app.use(express.json());
const sendEmail = require('./email_utils/email_sender');


mongoose.connect(process.env.MONGO_CONNECTION_STRING)
.then(() => { 
    console.log("Connected to MongoDB");
    app.listen(serverPort, () => {
        console.log(`Server is running on port: ${serverPort}`);
    });
})
.catch((err) => { 
    console.log("Error Connecting to MongoDB"); 
});

app.post("/register", async (req, res) => {
    try {
        const { name, username, email, password } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(401).json({ message: "Email already registered" });
        }

        const existingUserByUsername = await User.findOne({ username });
        if (existingUserByUsername) {
            return res.status(402).json({ message: "Username already taken" });
        }

        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        const newUser = new User({ name, username, email, password: hashedPassword });

        newUser.verificationToken = Math.floor(100000 + Math.random() * 900000).toString();

        const emailTemplate = require('./email_utils/registration_message');
        const { subject, text } = emailTemplate(name, newUser.verificationToken);

        await sendEmail(email, subject, text);

        await newUser.save();

        res.status(200).json({ message: "Registration successful", userId: newUser._id });
    } catch (error) {
        console.log("error registering user", error);
        res.status(500).json({ message: "error registering user" });
    }
});

app.post("/verify", async (req, res) => {
    try {
        const { identifier, userCode } = req.body;

        const user = await User.findOne({
            $or: [{ email: identifier }, { username: identifier }],
        });

        if (user.verificationToken !== userCode) {
            return res.status(403).json({ message: "Invalid token" });
        }

        user.verified = true;
        user.verificationToken = undefined;
        await user.save();

        res.status(200).json({ message: "Email verified successfully", userId: user._id });
    } catch (error) {
        console.log("error getting token", error);
        res.status(500).json({ message: "Email verification failed" });
    }
});

app.post("/login", async (req, res) => {
    try {
        const { identifier, password } = req.body;

        const user = await User.findOne({
            $or: [{ email: identifier }, { username: identifier }],
        });

        if (!user) {
            return res.status(404).json({ message: "Invalid email or username" });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(405).json({ message: "Invalid password" });
        }

        // if (!user.verified) {
        //     return res.status(406).json({ message: "Email not verified" });
        // }

        res.status(200).json({ message: "Login successful", userId: user._id });
    } catch (error) {
        res.status(500).json({ message: "Login failed" });
    }
});
