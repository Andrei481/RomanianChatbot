const axios = require('axios');

// Replace with your server's IP and port
const SERVER_IP = '35.202.151.140'; // Use 'localhost' or '127.0.0.1' for local server
const SERVER_PORT = '3000';

const user = {
    name: "Test User",
    username: "diana.cernazanu",
    email: "diana.cernazanu@gmail.com",
    password: "password123"
};

// Function to test the server's /register endpoint
async function testRegisterEndpoint() {
    try {
        const response = await axios.post(`http://${SERVER_IP}:${SERVER_PORT}/register`, user, {
            headers: {
                'Content-Type': 'application/json'
            },
            timeout: 5000 // Set a timeout to avoid hanging indefinitely
        });
        console.log("Response from server:", response.data);
    } catch (error) {
        if (error.response) {
            console.error("Error response data:", error.response.data);
            console.error("Error response status:", error.response.status);
            console.error("Error response headers:", error.response.headers);
        } else if (error.request) {
            console.error("Error request data:", error.request);
        } else {
            console.error("Error message:", error.message);
        }
        console.error("Error config:", error.config);
    }
}

// Call the function to test the server
testRegisterEndpoint();