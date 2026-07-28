const express = require('express');
const mongoose = require('mongoose');
const cors =require('cors');

const User = require("./User");

const app  =  express();
app.use(express.json());
app.use(cors());

//Connect to Mongoose
mongoose.connect(process.env.MONGODB_URI,{
    // useNewUrlOarser: true,
    // useUnifiedTopology:true,
}).then(()=> {
    console.log("Connected to MongoDB")
});

// API routes for get user data
app.get("/api/users", async (req, res) => {
  try {
    const users = await User.find();
    res
      .status(200)
      .json({ message: "Users fetched successfully", data: users });
  } catch (err) {
    res.status(500).json({ error: err });
  }
});

// API routes for create user
app.post("/api/users", async (req, res) => {
  try {
    const user = new User(req.body);
    const result = await user.save();
    res
      .status(201)
      .json({ message: "User created successfully", data: result });
  } catch (err) {
    res.status(500).json({ error: err });
  }
});

// Listen to port 5000
app.listen(5000, () => {
  console.log("Server is running on port 5000");
});
