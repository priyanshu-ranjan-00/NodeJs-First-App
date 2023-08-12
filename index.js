// // const http = require ("http")
// import http from "http";


// // import * as myObj from "./features.js";
// // console.log(myObj);
// import  {percentgenerator} from "./features.js";
// console.log(percentgenerator())


// import fs from "fs"
// const home = fs.readFileSync("./index.html")
// // console.log(home.toString())


// const server =http.createServer((req,res)=> {
//     // console.log(req.url);
//     if (req.url == "/about"){
//             res.end( `<h1> It's about Page and You got ${percentgenerator()} </h1>` );
//     }
//     else if (req.url == "/"){
//         // console.log(home.toString())
//         console.log("If you will refresh  i will be printing in the terminal also")
//         res.end(home);
//     }
//     else if (req.url == "/"){
//         res.end(" <h1> Home Page </h1> ")
//     }
//     else {
//         res.end("Page Not Found")
//     }
// }) 

// server.listen(5000,()=>{
//     console.log("Server is working")
// })

// console.log("You are at the last point ")



/*Express JS*/


// import express from "express";
// import path from 'path';

// const app = express();

// // app.get("/getproducts",(req,res)=>{
// //     // res.sendStatus(400);
// //     // res.send("Hi");
// //     // res.status(400).send("Meri Marzi")
// //     // res.json({
// //     //     success:true,
// //     //     products:[],
// //     // });
// // })

// app.get("/",(req,res)=>{
//     // console.log(path.resolve());
//     const pathlocation=path.resolve();
//     // console.log(path.join(pathlocation,"./index.html"))
//     res.sendFile(path.join(pathlocation,"./index.html"))
// })


// app.listen(5000,()=>{
//     console.log("Server is working");
// })




/*------------------------------------------------------*/
/*            Express JS              27/06/2023   */
/*------------------------------------------------------*/

// import express from "express";
// import path from "path";
// import mongoose from "mongoose";
// import e from "express";

// mongoose.connect("mongodb://127.0.0.1:27017/?directConnection=true&serverSelectionTimeoutMS=2000&appName=mongosh+1.10.1", {
//     dbName: "backend",
// }).then(()=>console.log("Database Connected"))
// .catch((e)=> console.log(e));

// const messageSchema= new mongoose.Schema({
//     name: String,
//     email: String,
// });

// // creating collection or model in the database
// const message = mongoose.model("Message",messageSchema);

// const app = express();

// const users = []; //declaring array for storing data (before mongodb)

// //using middlewares
// app.use(express.static(path.join(path.resolve(), "./public")))
// app.use(express.urlencoded({ extended: true }))

// // //setting up View Engine,(just write as it is)
// app.set("view engine", "ejs");
// // //either set or give extension as ejs(as done index.ejs)

// app.get("/", (req, res) => {
//     res.render("index.ejs", { name: "Priyanshu" });
//     // res.sendFile("index"); // public==>index वाला है ये। (for example)
// })

// // adding data in the collections or model
// app.get ("/add", async(req, res) => {
//     await message.create({name:"anshu2",email:"haha473@hmail.com"});
//     res.send("Nice");
// })

// app.get("/success", (req, res) => {
//     res.render("success");
// })

// app.post("/contact", async(req, res) => {
//     // console.log(req.body);

//     // users.push({ username: req.body.name, email: req.body.email });  //storing data inside the array //destructuring req.body.name & req.body.email..
// ..which will remove extra of next 2 lines
//     // const messageData=({ username: req.body.name, email: req.body.email });  //storing data in mongodb
//     // console.log(messageData);  //it will just print the items filled in the form made using html and css, but won't send to data

//     const{name,email} = req.body;
//     // await message.create({name: req.body.name, email: req.body.email});
//     await message.create({name: name, email: email});

//     // res.render("success.ejs");
//     res.redirect("/success");
// })

// app.get("/users", (req, res) => {
//     res.json({
//         users,
//     })
// })
// app.listen(5000, () => {
//     console.log("Server is working");
// })






/*-----------------------------------------------------------*/
/*            Authentication         22/07/2023   */
/*           timestamp--> 02:00:00   */
/*    copied from 79 to 147 and removed comments & useless code lines */
/*------------------------------------------------------------------------*/

import express from "express";
import path from "path";
import mongoose from "mongoose";
import e from "express";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

mongoose.connect("mongodb://127.0.0.1:27017/?directConnection=true&serverSelectionTimeoutMS=2000&appName=mongosh+1.10.1", {
    dbName: "backend",
}).then(() => console.log("Database Connected"))
    .catch((e) => console.log(e));

const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
});

const User = mongoose.model("User", userSchema);

const app = express();

//using middlewares
app.use(express.static(path.join(path.resolve(), "./public")))
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser());

app.set("view engine", "ejs");

// creating a function/middleware isAuthenticated

const isAuthenticated = async (req, res, next) => {
    const { token } = req.cookies;
    if (token) {
        const decoded=jwt.verify(token,"sdufhbsdumfsud");
        
        req.user = await User.findById(decoded._id)
        next();
    }
    else { 
        res.redirect("/login");
    }
};

app.get("/", isAuthenticated, (req, res, next) => {
    // const {token} =req.cookies;   //destructuring next line "console.log(req.cookies);"
    // // console.log(req.cookies);
    // if (token){
    //     res.render("logout");
    // }
    // else{
    //     res.render("login");
    // }
    console.log(req.user); 
    res.render("logout",{name: req.user.name});
});

app.get("/login", (req,res)=>{
    res.render("login");
})

app.get("/register", (req,res)=>{
    res.render("register");
});

app.post("/login", async (req,res)=>{
    const {email, password} = req.body;
    let user = await User.findOne({email});
    if (!user){
        return res.redirect("/register");
    }

    // const isPassMatch = user.password===password;
    const isPassMatch = await bcrypt.compare(password,user.password); //comparing stored,hashed password in database with the password being given on login page
    if(!isPassMatch){
        return res.render("login",{email, message: "Incorrect Password"});
    }

    const token = jwt.sign({_id: user._id}, "sdufhbsdumfsud");

    res.cookie("token",token, {
        httpOnly: true,
        expires: new Date(Date.now() + 60 * 1000)
    });

    res.redirect("/");
})

app.post("/register", async (req, res) => {
    const { name, email, password} = req.body;

    let user = await User.findOne({email});
    if (user){
       return res.redirect("/login");
    }

    //creating varible and storing hashed password in it for not showing passwords directly in the database
    const hashedPassword = await bcrypt.hash(password,10)

    user = await User.create({
        name,
        email,
        password: hashedPassword,
    });

    const token = jwt.sign({_id: user._id}, "sdufhbsdumfsud");

    res.cookie("token",token, {
        httpOnly: true,
        expires: new Date(Date.now() + 60 * 1000)
    });

    res.redirect("/");
});

app.get("/logout", (req, res) => {
    res.cookie("token", null, {
        httpOnly: true,
        expires: new Date(Date.now())
    });
    res.redirect("/");
});

app.listen(5000, () => {
    console.log("Server is working");
})
