const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT,
  secure: false,
  auth: {
    user: process.env.MAIL_USERNAME,
    pass: process.env.MAIL_PASSWORD
  }
});

const sendOTPEmail = async (email, otp) => {
  const mailOptions = {
    from: `${process.env.MAIL_FROM_NAME} <${process.env.MAIL_FROM_ADDRESS}>`,
    to: email,
    subject: 'OTP Verification - Reserve Fund Advisory',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>OTP Verification</h2>
        <p>Your OTP for account verification is:</p>
        <h1 style="color: #0066cc; font-size: 32px; letter-spacing: 5px;">${otp}</h1>
        <p>This OTP will expire in 10 minutes.</p>
        <p>If you didn't request this, please ignore this email.</p>
      </div>
    `
  };

  await transporter.sendMail(mailOptions);
};

const sendVerificationEmail = async (email, verificationLink, firstName) => {
  const mailOptions = {
    from: `${process.env.MAIL_FROM_NAME} <${process.env.MAIL_FROM_ADDRESS}>`,
    to: email,
    subject: 'Complete Your Advisory Profile - Reserve Fund Advisory',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #1f2937;">Welcome ${firstName}!</h2>
        <p>You've been invited to join Reserve Fund Advisory as an Advisory member.</p>
        <p>Please click the button below to complete your profile and set up your account:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationLink}" style="background: #3b82f6; color: white; padding: 12px 32px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600;">Complete Profile</a>
        </div>
        <p style="color: #6b7280; font-size: 14px;">Or copy and paste this link in your browser:</p>
        <p style="color: #3b82f6; word-break: break-all; font-size: 12px;">${verificationLink}</p>
        <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">This link will expire in 7 days.</p>
        <p style="color: #6b7280; font-size: 14px;">If you didn't expect this invitation, please ignore this email.</p>
      </div>
    `
  };

  await transporter.sendMail(mailOptions);
};

module.exports = { sendOTPEmail, sendVerificationEmail };
