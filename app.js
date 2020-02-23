var express = require("express"),
    bodyParser = require("body-parser"),
    expressSanitizer = require("express-sanitizer"),
    mongoose = require("mongoose"),
    app = express(),
    methodOverride = require("method-override");


// APP CONFIG
mongoose.connect("mongodb://localhost:27017/restful_blog_app", {useNewUrlParser: true, useUnifiedTopology: true});
app.set("view engine", "ejs");
app.use(express.static("public")); // to serve our custom stylesheet
app.use(bodyParser.urlencoded({extended: true}));
app.use(expressSanitizer());
app.use(methodOverride("_method")); // what it should look like in url. it can be anything. (parameter)

// MONGOOSE / MODEL CONFIG
var blogSchema = new mongoose.Schema({
    title: String,
    image: String, //{type:String, default: "placeholder.jpg"},
    body: String,
    created: {type: Date, default: Date.now}
});

var Blog = mongoose.model("Blog",blogSchema)

//RESTFUL ROUTES

app.get("/", (req, res) => {
    res.redirect("/blogs");
})

//INDEX ROUTE
app.get("/blogs", (req, res) => {
    Blog.find({}, (err, blogs) => {
        if(err){
            console.log(err);
        } else {
            res.render("index", {blogs: blogs});
        }
    });
});

//NEW ROUTE
app.get("/blogs/new", (req,res)=> {
    res.render("new");
})
//CREATE ROUTE
app.post("/blogs", (req, res)=>{
    //create blog
    req.body.blog.body = req.sanitize(req.body.blog.body);
    Blog.create(req.body.blog, (err, newBlog)=>{
        if(err){
            res.render("new");
        } else{
            //then, redirect to the index
            res.redirect("/blogs")
        }
    });
});

//SHOW ROUTE
app.get("/blogs/:id", (req, res)=>{
    Blog.findById(req.params.id, function(err, foundBlog){
        if(err){
            res.redirect("/blogs");
        } else {
            res.render("show", {blog: foundBlog});
        }
    })
});

//EDIT ROUTE
app.get("/blogs/:id/edit", (req, res)=> {
    Blog.findById(req.params.id, (err, foundBlog) =>{
        if(err){
            res.redirect("/blogs");
        } else {
            res.render("edit", {blog:foundBlog});
        }
    });
});

//UPDATE ROUTE
app.put("/blogs/:id", (req, res) => {
    req.body.blog.body = req.sanitize(req.body.blog.body)
    Blog.findByIdAndUpdate(req.params.id, req.body.blog, (err, updatedBlog)=>{
        if(err){
            res.redirect("/blogs");
        } else{
            res.redirect("/blogs/"+ req.params.id)
        }
    })
})

//DELETE ROUTE
app.delete("/blogs/:id", (req,res)=>{
    //destroy blog
    Blog.findByIdAndRemove(req.params.id, (err)=>{
        if(err){
            res.redirect("/blogs");
        } else{
            res.redirect("/blogs");
        }
    });
    //redirect somewhere
});

app.listen(3000, () => {console.log("server is running!")})