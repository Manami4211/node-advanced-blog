//index.js

const express = require("express")
const app = express()
app.use(express.urlencoded({extended:true}))
const mongoose = require("mongoose")
const session = require("express-session")

app.set("view engine", "ejs")
app.use("/public",express.static("public"))

//Session
app.use(session({
    secret: "secretKey",
    resave: false, 
    saveUninitialized: false,
    cookie: {maxAge: 300000},
}))

//Connecting to MongoDB
mongoose.connect("mongodb+srv://manamana4211:75QSp5S7YKbXSpML@cluster0.vzonppa.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")
    .then(() => {
        console.log("Success: Connected to MongoDB")
    })
    .catch((_error) => {
        console.error("Failure: Unconnected to MongoDB")
    })

//Defining Schema and Model
const Schema = (mongoose.Schema)
const BlogSchema = new Schema({
    title:String,
    summary:String,
    image:String,
    textBody:String,
})

const UserSchema = new Schema({
    name:{
    type: String,
    required: true
    } ,
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    }
})

const BlogModel = mongoose.model("Blog",BlogSchema)
const UserModel = mongoose.model("User", UserSchema)

//BLOG function

// Create blog
app.get("/blog/create", (req, res) => {
    if(req.session.userId){
        res.render("blogCreate")
    }else{
        res.redirect("/user/login")
    }
})

app.post("/blog/create", async (req, res) => {
    try {
        const savedBlogData = await BlogModel.create(req.body);
        res.redirect("/");
    } catch (error) {
        console.error("エラーが発生しました:", error);
        res.render("error", { message: "/blog/createのエラー" });
    }
});

// Read All Blogs
app.get("/", async(req, res) => {
    const allBlogs = await BlogModel.find()
    res.render("index", {allBlogs: allBlogs, session: req.session.userId})  
})

// Read Single Blog
app.get("/blog/:id", async(req, res) => {
    const singleBlog = await BlogModel.findById(req.params.id) 
    res.render("blogRead", {singleBlog: singleBlog, session: req.session.userId})   
}) 

// Update Blog
app.get("/blog/update/:id", async(req, res) => {
    const singleBlog = await BlogModel.findById(req.params.id)  
    res.render("blogUpdate", {singleBlog})
})  

app.post("/blog/update/:id", async (req, res) => {
    try {
        await BlogModel.updateOne({ _id: req.params.id }, req.body);
        res.redirect("/");
    } catch (error) {
        console.error("エラーが発生しました:", error);
        res.render("error", { message: "/blog/updateのエラー" });
    }
});

// Delete Blog
app.get("/blog/delete/:id", async(req, res) => {
    const singleBlog = await BlogModel.findById(req.params.id)  
    res.render("blogDelete", {singleBlog})
})

app.post("/blog/delete/:id", async (req, res) => {
    try {
        await BlogModel.deleteOne({ _id: req.params.id });
        res.redirect("/");
    } catch (error) {
        console.error("エラーが発生しました:", error);
        res.render("error", { message: "/blog/deleteのエラー" });
    }
});

// User function
// Create user
app.get("/user/create", (req, res) => {
    res.render("userCreate")
})

app.post("/user/create", async (req, res) => {
    try {
        const savedUserData = await UserModel.create(req.body);
        res.redirect("/user/login");
    } catch (error) {
        console.error("エラーが発生しました:", error);
        res.render("error", { message: "/user/createのエラー" });
    }
});

// user Login
app.get("/user/login", (req, res) => {
    res.render("login")
})

app.post("/user/login", async (req, res) => {
    try {
        const savedUserData = await UserModel.findOne({ email: req.body.email });
        if (savedUserData) {
            // ユーザーが存在した場合の処理
            if (req.body.password === savedUserData.password) {
                // パスワードが正しい場合の処理
                req.session.userId = savedUserData._id;
                res.redirect("/");
            } else {
                // パスワードが間違っている場合の処理
                res.render("error", { message: "/user/loginのエラー: パスワードが間違っています" });
            }
        } else {
            // ユーザーが存在していない場合の処理
            res.render("error", { message: "/user/loginのエラー: ユーザーが存在していません" });
        }
    } catch (error) {
        // エラーハンドリング
        console.error("エラーが発生しました:", error);
        res.render("error", { message: "エラーが発生しました" });
    }
});

// Connecting to port
const port = process.env.PORT || 5050
app.listen(5050, () => {　　　
    console.log('Listening on ${port}')
})