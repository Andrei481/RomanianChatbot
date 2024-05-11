module.exports = (name, verificationToken) => {
    const subject = `Welcome to Romanian Chatbot - Verify Your Account`;
    const text = `Dear ${name},

    Welcome to Romanian Chatbot! We're excited to have you onboard and help you explore the world of conversational AI.
    
    To complete your registration and ensure the security of your account, please use the following 6-digit verification code:
    
    Verification Code: [${verificationToken}]
    
    Please enter this code in the app to verify your account and gain access to all of our features. If you did not request this code or have any questions, please contact our support team immediately.
    
    We're committed to providing you with an exceptional experience, and we're here to support you every step of the way.
    
    Best regards,
    Romanian Chatbot`;
    return { subject, text };
};