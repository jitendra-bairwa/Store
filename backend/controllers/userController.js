const asyncHandler = require('express-async-handler');
const User = require("../models/userModel")
const jwt = require("jsonwebtoken")

// Generate Token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "1d" });
};


// Register User
const registerUser = asyncHandler(async (req, res) => {

    const { name, email, password } = req.body

    // Validation
    if (!name || !email || !password) {
        res.status(400);
        throw new Error("Please fill all required fields");
    }

    if (password.length < 6) {
        res.status(400);
        throw new Error("password must be 6 characters");
    }

    // check if user email is already exists
    const userExists = await User.findOne({ email })
    if (userExists) {
        res.status(400);
        throw new Error("Email already exists");
    }


    // create new user
    const user = await User.create({
        name,
        email,
        password,

    })

    //   Generate Token
    const token = generateToken(user._id);

//  Send HTTP-only cookie
   res.cookie("TOKEN_GENETATED",token,{
    path:"/",
    httpOnly:true,
    expires:new Date(Date.now() + 1000*86400), //1 day
    sameSite:"none",
    secure:true,

   });

    if (user) {
        const { _id, name, email, password, photo, phone, bio } = user;
        res.status(201).json({
            _id, name, email, password, photo, phone, bio, token,
        })
    }
    else {
        
        res.status(400);
        throw new Error("Invalid user data");
    }

});


module.exports = {
    registerUser,
}