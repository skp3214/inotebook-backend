const express = require('express');
const User = require('../models/User');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const JWT_SECRET = "Sachinisagood$boy";
var fetchuser=require('../middleware/fetchuser');


// Route 1
router.post('/createuser', [
    body('name', 'Enter a valid name').isLength({ min: 3 }),
    body('email', 'Enter a valid email').isEmail(),
    body('password', 'Password must be at least 5 characters').isLength({ min: 5 })
], async (req, res) => {
    let success=false;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({
            error: 'Validation failed',
            data: errors.array()
        });
    }
    try {
        let user = await User.findOne({ email: req.body.email });
        if (user) {
            return res.status(400).json( success,"User already exists");
        }
        const salt = await bcrypt.genSalt(10);
        const secPass = await bcrypt.hash(req.body.password, salt);
        user = await User.create({
            name: req.body.name,
            email: req.body.email,
            password: secPass,
        });
        //return json response of the created user
        const data = {
            user: {
                id: user.id,
            }
        }
        const authtoken = jwt.sign(data, JWT_SECRET);

        success=true;
        res.status(200).json({success, authtoken });
    }
    catch (err) {
        console.log(err);
        res.status(500).send('Server Error')
    }
})

// Route2

router.post('/login', [
    body('email', 'Enter a valid email').isEmail(),
    body('password', 'Password cannot be blank').exists()
], async (req, res) => {
    let success=false;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({
            error: 'Validation failed',
            data: errors.array()
        });
    }

    const { email, password } = req.body;

    try {
        let user = await User.findOne({ email });

        if (!user) {
            success=false;
            return res.status(400).json({ error: "Try to login with correct credentials." });
        }

        const passwordCompare = await bcrypt.compare(password, user.password);

        if (!passwordCompare) {
            success=false;
            return res.status(400).json({success, error: "Try to login with correct credentials." });
        }

        const payload = {
            user: {
                id: user.id
            }
        }

        const authtoken = jwt.sign(payload, JWT_SECRET);
        success=true;
        return res.json({success, authtoken });

    } catch (err) {
        console.log(err);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Route 3 : get logged in user details using post, login required
router.post('/getuser',fetchuser , async (req, res) => {
    try {
        userId=req.user.id;
        const user = await User.findById(userId).select("-password")
        res.send(user)
    }
    catch (err) {
        console.log(err.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
})

module.exports = router;
