const dotenv = require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const userRoute = require("./routes/userRoute");
const errorHandler = require("./middleWare/errorMiddleware")

const app = express();



// Middlewares
app.use(express.json());
app.use(express.urlencoded({extended:false}));
app.use(bodyParser.json());
app.use(cookieParser());


// Routes Middleware
app.use("/api/users",userRoute);



// Routes
app.get("/",(req,res) => {
  res.send("Home Page");
})


// Error Middleware
app.use(errorHandler);
 


// Connect to DB and start server
const PORT = process.env.PORT || 5000;
const connect = async () => {
  try {
      await mongoose.connect(process.env.MONGO_URI);
      console.log("Connected to mongoDB");
  } catch (error) {
      throw error;
  }
};

mongoose.connection.on("disconnected", () => {
  console.log("mongoDB disconnected");
})

app.listen(PORT, () => {
  connect();
  console.log(`Server listening on port ${PORT}`);
})