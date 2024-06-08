const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const User = require("./models/user");
const Conversation = require("./models/conversation")

const app = express();
const serverPort = 3000;
require('dotenv').config();
app.use(express.json({limit: '20mb'}));
const sendEmail = require('./email_utils/email_sender');
const jwt = require('jsonwebtoken');
const verifyToken = require('./middleware/jwtAuth')


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

const saltRounds = 10;

const generateToken = (userId) => {
    return jwt.sign({ userId }, process.env.SECRET_KEY, { expiresIn: '1h' });
};

app.post("/register", async (req, res) => {
    try {
        const { name, username, email, password } = req.body;

        if (!name || !username || !email || !password) {
            return res.status(400).json({ message: "Invalid request data" });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ message: "Email already registered" });
        }

        const existingUserByUsername = await User.findOne({ username });
        if (existingUserByUsername) {
            return res.status(409).json({ message: "Username already taken" });
        }

        const hashedPassword = await bcrypt.hash(password, saltRounds);
        const newUser = new User({ name, username, email, password: hashedPassword });
        const verificationToken = Math.floor(100000 + Math.random() * 900000).toString();
        const verificationTokenHash = await bcrypt.hash(verificationToken, saltRounds)

        newUser.verificationToken = verificationTokenHash;

        const emailTemplate = require('./email_utils/registration_message');
        const { subject, text } = emailTemplate(name, verificationToken);

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
        const { identifier, userToken } = req.body;

        if (!identifier || !userToken) {
            return res.status(400).json({ message: "Invalid request data" });
        }
        const user = await User.findOne({
            $or: [{ email: identifier }, { username: identifier }],
        });

        if (!user) {
            return res.status(404).json({ message: "Invalid email or username" });
        }
        const isTokenValid = await bcrypt.compare(userToken.toString(), user.verificationToken);
        if (!isTokenValid) {
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

        if (!identifier || !password) {
            return res.status(400).json({ message: "Invalid request data" });
        }
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

        if (!user.verified) {
            return res.status(406).json({ message: "Email not verified" });
        }
        const token = generateToken(user._id);

        res.status(200).json({ message: "Login successful", userId: user._id, token });
    } catch (error) {
        res.status(500).json({ message: "Login failed" });
    }
});

app.post("/forgotpass", async (req, res) => {
    try {
        const { identifier } = req.body;

        if (!identifier) {
            return res.status(400).json({ message: "Invalid request data" });
        }

        const user = await User.findOne({
            $or: [{ email: identifier }, { username: identifier }],
        });

        if (!user) {
            return res.status(404).json({ message: "Invalid email or username" });
        }

        const passwordResetToken = Math.floor(100000 + Math.random() * 900000).toString();
        const passwordResetTokenHash = await bcrypt.hash(passwordResetToken, saltRounds);
        user.passwordResetToken = passwordResetTokenHash;

        const emailTemplate = require('./email_utils/reset_password_message');
        const { subject, text } = emailTemplate(user.name, passwordResetToken);

        await sendEmail(user.email, subject, text);

        await user.save();

        res.status(200).json({ message: "Email sent" });
    } catch (error) {
        res.status(500).json({ message: "Error sending mail" });
    }
});

app.post("/resetpass", async (req, res) => {
    try {
        const { identifier, resetToken, newPassword } = req.body;

        if (!identifier || !resetToken || !newPassword) {
            return res.status(400).json({ message: "Invalid request data" });
        }

        const user = await User.findOne({
            $or: [{ email: identifier }, { username: identifier }],
        });

        if (!user) {
            return res.status(404).json({ message: "Invalid email or username" });
        }

        const isValidToken = await bcrypt.compare(resetToken.toString(), user.passwordResetToken);
        if (!isValidToken) {
            return res.status(403).json({ message: "Invalid token" });
        }

        user.password = await bcrypt.hash(newPassword, 10);
        user.passwordResetToken = undefined;

        await user.save();

        res.status(200).json({ message: "Password changed successfully", userId: user._id });
    } catch (error) {
        res.status(500).json({ message: "Error changing password" });
    }
});

app.get('/user/:userId', verifyToken, async (req, res) => {
    try {
        const userId = req.params.userId;

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const userData = {
            name: user.name,
            username: user.username,
            email: user.email,
            joinedDate: user.joinedDate,
            profilePicture: user.profilePicture ? user.profilePicture.toString('base64') : undefined
        };

        res.status(200).json(userData);
    } catch (error) {
        console.error('Error fetching user data:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.delete("/user/:userId", verifyToken, async (req, res) => {
    try {
        const userId = req.params.userId;

        const deletedUser = await User.findByIdAndDelete(userId);

        if (!deletedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        await Conversation.deleteMany({ userId }); // delete all their conversations

        res.status(200).json({ message: "User deleted successfully", deletedUser });
    } catch (error) {
        console.error("Error deleting user", error);
        res.status(500).json({ message: "Error deleting user" });
    }
});

app.put("/user/:userId/profilePicture", verifyToken, async (req, res) => {
    try {
        const userId = req.params.userId;
        const { profilePicture } = req.body;

        if(!profilePicture) {
            return res.status(400).json({ message: 'Invalid request data' });
        }
        const user = await User.findById(userId);
        if(!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const imageBuffer = Buffer.from(profilePicture, 'base64');

        user.profilePicture = imageBuffer;
        await user.save();

        res.status(200).json({ message: "Profile picture saved successfully" });
    } catch(error) {
        console.error("Error updating profile picture: ", error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// app.post("/inference", async (req, res) => {
//     try {
//         const { prompt } = req.body;
//         if (!prompt) {
//             return res.status(400).json({ message: 'Invalid request data' });
//         }

//         const requestBody = {
//             prompt: prompt,
//             n: 1,
//             temperature: 0.95,
//             max_tokens: 1024
//         };

//         const response = await axios.post('http://10.198.110.23:8000/generate', requestBody);

//         const generatedText = response.data;

//         res.json({ generatedText });
//     } catch (error) {
//         console.error("Error at inference: ", error);
//         res.status(500).json({ message: 'Internal server error' });
//     }
// });

app.post("/user/:userId/newConversation", verifyToken, async (req, res) => {
    try {
        const { userId } = req.params;
        const { messages } = req.body;
        if(!messages) {
            return res.status(400).json({ message: 'Invalid request data' });
        }
        
        const newConversation = new Conversation({
            userId: userId,
            messages: messages
        });

        await newConversation.save();

        res.status(200).json({ message: "Conversation created successfully", conversation: newConversation });
    } catch(error) {
        console.error("Error creating conversation: ", error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.put("/conversation/:conversationId", verifyToken, async (req, res) => {
    try {
        const { conversationId } = req.params;
        const { messages } = req.body;

        if (!Array.isArray(messages)) {
            return res.status(400).json({ message: 'Invalid messages format: must be an array' });
        }

        const updateConversation = await Conversation.findById(conversationId);
        
        if (!updateConversation) {
            return res.status(404).json({ message: 'Conversation not found' });
        }

        for (const message of messages) {
            updateConversation.messages.push(message);
        }
        
        await updateConversation.save();

        res.status(200).json({ message: "Messages added successfully", conversation: updateConversation });
    } catch(error) {
        console.error("Error adding messages to conversation: ", error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.get("/conversation/:conversationId", verifyToken, async (req, res) => {
    try {
        const { conversationId } = req.params;
        
        const conversation = await Conversation.findById(conversationId);
        
        if (!conversation) {
            return res.status(404).json({ message: 'Conversation not found' });
        }

        res.status(200).json({ message: "Conversation retrieved successfully", conversation });
    } catch(error) {
        console.error("Error retrieving conversation: ", error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.get("/user/:userId/conversations", verifyToken, async (req, res) => {
    try {
        const { userId } = req.params;

        const conversations = await Conversation.find({ userId });

        res.status(200).json({ message: "Conversations retrieved successfully", conversations });
    } catch(error) {
        console.error("Error retrieving conversations: ", error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.delete("/conversation/:conversationId", verifyToken, async (req, res) => {
    try {
        const { conversationId } = req.params;

        const deletedConversation = await Conversation.findByIdAndDelete(conversationId);
        
        if (!deletedConversation) {
            return res.status(404).json({ message: 'Conversation not found' });
        }

        res.status(200).json({ message: 'Conversation deleted successfully', deletedConversation });
    } catch (error) {
        console.error("Error deleting conversation:", error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
