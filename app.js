var bodyParser      = require("body-parser"),
    mongoose        = require("mongoose"),
    express         = require("express"),
    expressSanitizer= require("express-sanitizer"),
    app             = express(),
    methodOverride  = require("method-override");

app.use(bodyParser.urlencoded({extended: true}));
app.use(expressSanitizer()); // should be after body parser
app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(methodOverride("_method"));

//connecting to DB
mongoose.connect("mongodb://localhost:27017/blog_app",{useNewUrlParser: true});

var blogSchema= new mongoose.Schema({
    title: String,
    image: String,
    body: String,
    created: {type:Date, default: Date.now}
});

var Blog= mongoose.model("Blog", blogSchema);

/*Blog.create({
    title: "Test Blog", 
    image: "https://images.unsplash.com/photo-1533161167560-e48f8fc55dd3?ixlib=rb-0.3.5&ixid=eyJhcHBfaWQiOjEyMDd9&s=03d9de22036f9a949efb53cf8f06d516&auto=format&fit=crop&w=500&q=60",
    body: "Hello, this is a blog post"
    },function(err, blog){
        if(err){
            console.log(err);
        } else {
            console.log("New Blog Created");
            console.log(blog);
            
       }
    }); */
    
//Restful Routes

//Root Route
app.get("/", function(req, res){
    res.redirect("/blogs");
});


// Index Route
app.get("/blogs", function(req, res){
    
     //retrieve blogs fromm DB
        Blog.find({}, function(err, blogs){
            if(err){
                console.log(err);
            } else {
                //res.render("index", {blogs: blogs});
                res.render("index",{blogs: blogs});
            }
        });
    
});

//New Route
app.get("/blogs/new", function(req, res){
    res.render("new");
});

//Create Route
app.post("/blogs", function(req, res){
    
    req.body.blog.body = req.sanitize(req.body.blog.body); // removes script tags from the body
    Blog.create(req.body.blog, function(err, newBlog){
        
         if(err){
            console.log(err);
        } else {
            console.log("New Blog Created");
            console.log(newBlog);
            res.redirect("/blogs");
            
       }
        
    });
    
});


//show route
app.get("/blogs/:id",function(req, res){
    Blog.findById(req.params.id, function(err, foundBlog){
        if (err){
            res.redirect("/blogs");
        } else {
            //console.log(foundBlog);
            
            res.render("show", {blog: foundBlog});
        }
    });
});


//edit route
app.get("/blogs/:id/edit",function(req,res){
    Blog.findById(req.params.id, function(err, foundBlog){
        if (err){
            res.redirect("/blogs");
        } else {
            //console.log(foundBlog);
            
            res.render("edit", {blog: foundBlog});
        }
    });
});

//update route

app.put("/blogs/:id", function(req,res){
    console.log(req.body);
     req.body.blog.body = req.sanitize(req.body.blog.body); // removes script tags from the body
    console.log(req.body);
     Blog.findByIdAndUpdate(req.params.id, req.body.blog, function(err, UpdatedBlog){
        if (err){
            res.redirect("/blogs");
        } else {
            //console.log(foundBlog);
            
            res.redirect("/blogs/"+req.params.id);
        }
    });
});

app.delete("/blogs/:id", function(req,res){
    Blog.findByIdAndRemove(req.params.id, function(err){
        if (err){
            res.redirect("/blogs");
        } else {
            //console.log(foundBlog);
           res.redirect("/blogs");
        }
    });
});

app.listen(process.env.PORT, process.env.IP, function(){
    console.log("Blog App Server Started.....")
});