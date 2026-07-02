import nodemailer from "nodemailer";

export const emailOtp = async (email, otp) => {
  try {

    // transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    // mail options
    const mailOptions = {
      from: `"Geswa Micro" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "OTP Verification - Geswa Micro",

      html: `
  <div style="
    margin:0;
    padding:0;
    background:#bfdbfe;
    font-family:Inter,sans-serif;
  ">

    <div style="
      max-width:600px;
      margin:40px auto;
      background:#ffffff;
      border-radius:20px;
      overflow:hidden;
      box-shadow:0 10px 30px rgba(0,0,0,0.1);
    ">

      <!-- Header -->
      <div style="
        background:linear-gradient(135deg,#1B6BFF,#155EEF);
        padding:40px 30px;
        text-align:center;
        color:white;
      ">
        <h1 style="
          margin:0;
          font-size:32px;
          font-weight:700;
        ">
          Geswa Micro
        </h1>

        <p style="
          margin-top:10px;
          color:#dbeafe;
          font-size:15px;
        ">
          Secure OTP Verification
        </p>
      </div>

      <!-- Body -->
      <div style="padding:40px 30px;">

        <h2 style="
          margin-top:0;
          color:#1e2758;
          font-size:24px;
        ">
          Verify Your Account
        </h2>

        <p style="
          color:#4b5563;
          line-height:1.7;
          font-size:15px;
        ">
          Use the OTP below to continue your verification process.
          This OTP is valid for only 5 minutes.
        </p>

        <!-- OTP Box -->
        <div style="
          margin:35px 0;
          text-align:center;
        ">
          <div style="
            display:inline-block;
            background:#bfdbfe;
            color:#155EEF;
            padding:18px 40px;
            border-radius:16px;
            font-size:36px;
            font-weight:700;
            letter-spacing:8px;
          ">
            ${otp}
          </div>
        </div>

        <p style="
          color:#6b7280;
          font-size:14px;
          line-height:1.6;
        ">
          If you did not request this OTP, you can safely ignore this email.
        </p>

      </div>

      <!-- Footer -->
      <div style="
        background:#f8fafc;
        padding:20px;
        text-align:center;
        border-top:1px solid #e5e7eb;
      ">
        <p style="
          margin:0;
          color:#6b7280;
          font-size:13px;
        ">
          © 2026 Geswa Micro. All rights reserved.
        </p>
      </div>

    </div>
  </div>
  `,
    };

    // send mail
    const info = await transporter.sendMail(mailOptions);

    console.log("Email sent:", info.response);

    return true;

  } catch (error) {

    console.log(error);

    return false;

  }
};