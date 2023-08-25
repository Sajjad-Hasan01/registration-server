//  Create Server
const express = require('express')
const app = express()

//  Cors Package fixes connection errors
const cors = require('cors')
app.use(cors())

//  Body-Parser Package to fix => "req.body is undefined in Express" Error
const bodyParser = require('body-parser')

//  Import Cryptography Package
const bcrypt = require('bcrypt')
//  JsonWebToken Package to get user token after login succesfully
const jwt = require('jsonwebtoken')
require('dotenv').config();

//  Make DB Connection
const mongoose = require('mongoose')
const PORT = 3000;
mongoose.connect(process.env.DB_URI);

//  Import User Model
const UserModel = require('./models/Users')

//  Get Request => Display All Users
app.get('/users', bodyParser.json(), async (req, res) => {
    const users = await UserModel.find();
    res.json(users)
})

// Post Request => Register
app.post('/register', bodyParser.json(), async (req, res) => {
    const {username, password} = req.body
    const user = await UserModel.findOne({username})
    
    //if there is a user, statement will excute
    if (user) return res.json({message:'username already exist'})

    const hashedPassword = bcrypt.hashSync(password,1)
    const newUser = new UserModel({username,password:hashedPassword})
    await newUser.save()

    const getUser = await UserModel.findOne({username}) /*  Get the ID of user from DB  */
    const userId = getUser._id;

    const token = jwt.sign({id: user._id}, process.env.SECRET)
    
    return res.json({message:'Registration succeed', username, token, userId})
})

// Post Request => Login
app.post('/login', bodyParser.json(), async (req, res) => {
    const {username, password} = req.body
    const user = await UserModel.findOne({username})
    
    // if there isn`t a user, statement will excute
    if (!user) return res.json({message:`user dosen't exist`})

    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) return res.json({message:'Username or Password is not correct'})
    
    const token = jwt.sign({id: user._id}, process.env.SECRET)
    
    return res.json({message:'Logging succeed', username:user.username, token, userId:user._id})
})

app.listen(PORT, ()=>{
    console.log("Server is live !");
})