const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const nodemailer = require("nodemailer");
const app = express();

require("dotenv").config();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Get project info
const Project = require("./models/Project");

app.get("/api/projects", async (req, res) => {
  try {
    const projects = await Project.find();
    res.status(200).json(projects);
  } catch (error) {
    res.status(500).json({ error: "Error fetching projects" });
  }
});

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error(err));

// Email endpoint
app.post("/api/contact", async (req, res) => {
  const { name, email, message } = req.body;
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: email,
    to: process.env.EMAIL_USER,
    subject: `Portfolio Contact: ${name}`,
    text: message,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).send("Message sent");
  } catch (error) {
    res.status(500).send("Error sending message");
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
