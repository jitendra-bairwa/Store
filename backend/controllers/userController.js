const asyncHandler = require('express-async-handler');
const User = require("../models/userModel")
const jwt = require("jsonwebtoken")
const bcrypt = require('bcrypt');

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
    res.cookie("TOKEN_GENETATED", token, {
        path: "/",
        httpOnly: true,
        expires: new Date(Date.now() + 1000 * 86400), //1 day
        sameSite: "none",
        secure: true,
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

// Login User
const loginUser = asyncHandler(async (req, res) => {

    const { email, password } = req.body;

    // Validate Request
    if (!email || !password) {
        res.status(400);
        throw new Error("Please fill email and password");
    }

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
        res.status(400);
        throw new Error("User not Found");
    }

    // User exists , check if password is correct
    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    //   Generate Token
    const token = generateToken(user._id);

    //  Send HTTP-only cookie
    res.cookie("TOKEN_GENETATED", token, {
        path: "/",
        httpOnly: true,
        expires: new Date(Date.now() + 1000 * 86400), //1 day
        sameSite: "none",
        secure: true,

    });


    if (user && isPasswordCorrect) {
        const { _id, name, email, password, photo, phone, bio } = user;

        res.status(200).json({
            _id, name, email, password, photo, phone, bio, token,
        });
    }
    else {
        res.status(400);
        throw new Error("Invalid Email or Password");
    }

});

const logout = asyncHandler(async (req, res) => {
    res.cookie("TOKEN_GENETATED", "", {
        path: "/",
        httpOnly: true,
        expires: new Date(0),
        sameSite: "none",
        secure: true,
    });
    return res.status(200).json({ message: "Successfully Logged out" });
});


// Get User Data
const getUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
        const { _id, name, email, photo, phone, bio } = user;
        res.status(200).json({
            _id,
            name,
            email,
            photo,
            phone,
            bio,
        });
    } else {
        res.status(400);
        throw new Error("User Not Found");
    }
});


// Get Login Status
const loginStatus = asyncHandler(async (req, res) => {
    const token = req.cookies.TOKEN_GENETATED;
    if(!token)
    {
        return res.json(false);
    }

    // Verify Token
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    if(verified)
    {
        return res.json(true);
    }
    return res.json(false);

});


module.exports = {
    registerUser,
    loginUser,
    logout,
    getUser,
    loginStatus,
}