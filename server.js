if(process.env.NODE_ENV !="production"){
    require("dotenv").config();
}
const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);
const express = require("express");
const app = express();

const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const Review = require("./models/review.js");
// const cleareview=require("cleareeview,js");
const { validateReview } = require("./utils/middleware.js");
const Joi = require("joi");
const { reviewSchema } = require("./schema.js");
const listings=require("./routes/listing.js");
const reviews=require("./routes/review.js");
const flash=require("connect-flash");
const passport=require("passport");
const LocalStrategy=require("passport-local").Strategy;
const User=require("./models/user.js");
const userRouter=require("./routes/user.js");

const Listing = require("./models/listing.js");
const WrapAsync = require("./utils/WrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
const cookieParser=require("cookie-parser");
const session = require("express-session");
const MongoStore = require("connect-mongo").default;
console.log("MongoStore:", MongoStore);
console.log("Create:", typeof MongoStore.create);
// const session=require(session);

app.use(cookieParser());
//learning cookies
app.get("/getcookies",(req,res)=>{
    res.cookie("greet","namaste");
    res.cookie("madein","india");
    res.send("sent your cookies");
});
app.get("/greet",(req,res)=>{
     let {name="anonymous"}=req.cookies;
     res.send(`hi,${name}`);
})

//signed cookies
//cookies ke sath ko chedkani nha hona value uske correct hona 
//isliye hum signed cookies use krte hai aur uss verify krte hai 
app.use(cookieParser("secretcode"));
app.get("/getsignedcookie",(req,res)=>{
    res.cookie("color","red",{signed:true});
    res.send("done");
});
//verify the cookie
app.get("/verify",(req,res)=>{
    res.send(req.signedCookies);
});
// ==================================================
// DATABASE CONNECTION
// ==================================================

// const MONGO_URL = "mongodb://127.0.0.1:27017/wanderLust";
const dbUrl=process.env.ATLASDB_URL;

async function main() {
    await mongoose.connect(dbUrl);
    console.log("Connected to MongoDB");
}

main().catch((err) => {
    console.error("Database connection error:", err);
});

// ==================================================
// MIDDLEWARE AND APP CONFIGURATION
// ==================================================

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.engine("ejs", ejsMate);

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));
const store = MongoStore.create({
    mongoUrl: dbUrl,
    crypto: {
        secret: process.env.SESSION_SECRET
    },
    touchAfter: 24 * 3600,
});

store.on("error",(err)=>{
    console.log("error in mongo session store",err);
});

const sessionOptions={
    store,
    secret: process.env.SESSION_SECRET,
    resave:false,
    saveUninitialized:true,
    cookie:{
        expires:Date.now() + 7*24*60*60*1000,  //login info kitne time ke liye save rhenga time khtm tho phir se login karo
        maxAge:7*24*60*60*1000,
        httpOnly:true,
    },
};

app.use(session(sessionOptions));
app.use(flash());  //using for review one time msg


//.....passport middlewares

// Passport middlewares
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser=req.user;
    next();
});


//fakeuser login
// app.get("/demouser",async (req,res)=>{
//     let fakeuser=new User({
//         email:"student@gmail.com",
//         username:"solo-student"
//     });
//     let reguser=await User.register(fakeuser,"hello L");
//     res.send(reguser);
// });



// app.get(
//     "/listings",
//     WrapAsync(async (req, res) => {
//         const allListings = await Listing.find({});

//         res.render("listings/index.ejs", {
//             allListings
//         });
//     })
// );

app.use("/listings", listings);
app.use("/reviews", reviews);
app.use("/", userRouter);

// ==================================================
// API 3: NEW LISTING FORM
// METHOD: GET
// URL: /listings/new
// PURPOSE: Displays the form used to create a listing.
// ==================================================

app.get("/listings/new", (req, res) => {
    res.render("listings/new.ejs");
});

// ==================================================
// API 4: CREATE A NEW LISTING
// METHOD: POST
// URL: /listings
// PURPOSE: Reads form data, creates a Mongoose document,
//          saves it to MongoDB, and redirects to index.
// ==================================================

app.post(
    "/listings",
    WrapAsync(async (req, res) => {
        const newListing = new Listing(req.body.listing);

        await newListing.save();

        res.redirect("/listings");
    })
);

// ==================================================
// API 5: SHOW ONE LISTING
// METHOD: GET
// URL: /listings/:id
// PURPOSE: Finds a listing using its MongoDB ID and
//          displays its details.
// ==================================================

app.get(
    "/listings/:id",
    WrapAsync(async (req, res) => {
        const { id } = req.params;

        const listing = await Listing.findById(id).populate("reviews");

        if (!listing) {
            throw new ExpressError(404, "Listing not found");
        }

        res.render("listings/show.ejs", {
            listing
        });
    })
);

// ==================================================
// API 6: EDIT LISTING FORM
// METHOD: GET
// URL: /listings/:id/edit
// PURPOSE: Finds the listing and displays its existing
//          values in the edit form.
// ==================================================

app.get(
    "/listings/:id/edit",
    WrapAsync(async (req, res) => {
        const { id } = req.params;

        const listing = await Listing.findById(id);

        if (!listing) {
            throw new ExpressError(404, "Listing not found");
        }

        res.render("listings/edit.ejs", {
            listing
        });
    })
);

// ==================================================
// API 7: UPDATE AN EXISTING LISTING
// METHOD: PUT
// URL: /listings/:id
// PURPOSE: Updates a listing using submitted form data.
//          runValidators checks the schema validations.
// ==================================================

app.put(
    "/listings/:id",
    WrapAsync(async (req, res) => {
        const { id } = req.params;

        const updatedListing = await Listing.findByIdAndUpdate(
            id,
            { ...req.body.listing },
            { runValidators: true }
        );

        if (!updatedListing) {
            throw new ExpressError(404, "Listing not found");
        }

        res.redirect(`/ listings / ${ id } `);
    })
);

// ==================================================
// API 8: DELETE A LISTING
// METHOD: DELETE
// URL: /listings/:id
// PURPOSE: Deletes the listing from MongoDB and
//          redirects to the listings index page.
// ==================================================

app.delete(
    "/listings/:id",
    WrapAsync(async (req, res) => {
        const { id } = req.params;

        const deletedListing = await Listing.findByIdAndDelete(id);

        if (!deletedListing) {
            throw new ExpressError(404, "Listing not found");
        }

        res.redirect("/listings");
    })
);

app.use("/listings",listings);
app.use("/listings/:id/reviews",reviews);
app.post(
    "/listings/:id/reviews",
    validateReview,
    WrapAsync(async (req, res) => {
        let listing = await Listing.findById(req.params.id);

        if (!listing) {
            throw new ExpressError(404, "Listing not found");
        }

        let newReview = new Review(req.body.review);

        listing.reviews.push(newReview);

        await newReview.save();
        await listing.save();

        res.redirect(`/listings/${listing._id}`);
    })
);

//delete review route
//$pull operator is used
app.delete(
    "/listings/:id/reviews/:reviewId",
    WrapAsync(async (req,res) =>{
        let{id,reviewId}=req.params;
        await Listing.findByIdAndUpdate(id,{$pull:{reviews:reviewId}});
        await Review.findByIdAndDelete(reviewId);
        res.redirect(`/listings/${id}`);
    })
)


// HOME ROUTE
app.get("/", (req, res) => {
    res.redirect("/listings");
});


// ==================================================
// API 9: CATCH-ALL / 404 ROUTE
// METHOD: ALL
// URL: Any unmatched URL
// PURPOSE: Creates a 404 error when no registered
//          route matches the incoming request.
// NOTE: Express 5 requires a named wildcard.
// ==================================================

app.all("/{*splat}", (req, res, next) => {
    next(new ExpressError(404, "Page not found"));
});

// ==================================================
// ERROR-HANDLING MIDDLEWARE
// PURPOSE: Sends an appropriate HTTP status and error
//          message whenever an error reaches this point.
// NOTE: Must be registered after the routes.
// ==================================================

app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || "Something went wrong";

    res.status(statusCode).send(message);
});

// ==================================================
// START SERVER
// ==================================================

app.listen(8080, () => {
    console.log("Server started on port 8080");
});