import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import sgMail from "@sendgrid/mail";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

app.use(cors());
app.use(express.json());

let otps = {};

// إرسال OTP
app.post("/api/send-otp", async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ success: false, message: "Email is required" });

  const otp = Math.floor(1000 + Math.random() * 9000).toString();
  otps[email] = { code: otp, expires: Date.now() + 5 * 60 * 1000 }; // 5 دقائق

  const msg = {
    to: email,
    from: "abaqkingdom@gmail.com", // تأكد أنه مفعل في SendGrid
    subject: "رمز التحقق OTP",
    text: `رمز التحقق الخاص بك هو: ${otp}`,
    html: `<strong>رمز التحقق الخاص بك هو: ${otp}</strong>`,
  };

  try {
    await sgMail.send(msg);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: "فشل الإرسال" });
  }
});

// التحقق من OTP
app.post("/api/verify-otp", (req, res) => {
  const { email, otp } = req.body;
  const record = otps[email];

  if (record && record.code === otp && Date.now() < record.expires) {
    delete otps[email];
    return res.json({ success: true });
  }
  res.status(400).json({ success: false, message: "OTP غير صالح أو منتهي" });
});

app.listen(PORT, () => console.log("Server running on port", PORT));