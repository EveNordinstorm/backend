const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const nodemailer = require("nodemailer");
require("dotenv").config();
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from the backend
app.use("/public", express.static(path.join(__dirname, "public")));

// Serve static files from the Angular app
app.use(
  express.static(path.join(__dirname, "dist", "portfolio-website", "browser"))
);

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error(err));

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

// Email endpoint
const ContactMessage = require("./models/ContactMessage");

app.post("/api/contact", async (req, res) => {
  const { name, email, message } = req.body;

  // Save the message to the database
  const newContactMessage = new ContactMessage({ name, email, message });

  try {
    await newContactMessage.save();

    // Create Nodemailer transporter using Gmail with OAuth2
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        type: "OAuth2",
        user: process.env.GMAIL_USER,
        clientId: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        refreshToken: process.env.REFRESH_TOKEN,
      },
    });

    // Email details
    const mailOptions = {
      from: email,
      to: process.env.GMAIL_USER,
      subject: `Portfolio Contact: ${name}`,
      text: `You have a new message from ${name} (${email}):\n\n${message}`,
    };

    // Send email
    await transporter.sendMail(mailOptions);

    res
      .status(200)
      .json({ message: "Message sent successfully and saved to database" });
  } catch (error) {
    console.error("Error in /api/contact:", error);
    res.status(500).json({ message: "Error sending message" });
  }
});

// Catch all other routes and return the index.html
app.get("*", (req, res) => {
  res.sendFile(
    path.join(__dirname, "dist", "portfolio-website", "browser", "index.html")
  );
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
