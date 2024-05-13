module.exports = (name, resetToken) => {
    const subject = `Romanian Chatbot - Reset Password`;
    const text = `
    Hello ${name},

    You have requested a password reset for your account.

    To reset your password, please use the following 6-digit reset code:
    
    Verification Code: ${resetToken}
    
    Please enter this code in the app to reset your password. If you did not request this action, please contact our support team immediately.
    
    
    Best regards,
    Romanian Chatbot Team`;
    return { subject, text };
};