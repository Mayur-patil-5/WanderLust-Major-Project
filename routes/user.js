const express=require("express");
const router=express.Router();
const User=require("../models/user");
const wrapAsync=require("../utils/WrapAsync");
const passport=require("passport");
const {saveRedirectUrl}=require("../middleware.js");


router.get("/signup",(req,res)=>{
    res.render("users/signup.ejs");
});

router.post("/signup", wrapAsync(async (req, res, next) => {
    try {
        let { username, email, password } = req.body;
        const newUser = new User({ email, username });
        const registerUser = await User.register(newUser, password);
        console.log(registerUser);
        req.login(registerUser,(err)=>{
            if(err){
                return next(err);
            }
            req.flash("success", "Welcome to Wander!");
            res.redirect("/listings");
        });
    } catch (e) {
        req.flash("error", "User is already registered!");
        res.redirect("/signup");
    }
}));

router.get("/login", (req, res) => {
    res.render("users/login.ejs");
});

// router.post("/login",saveredirectUrl,passport.authenticate("local",{failureRedirect:'/login',failureFlash:true}),async(req,res)=>{
//     req.flash("success","welcome to wander you are logged in!!");
//     res.redirect(req.session.redirectUrl);
// });

router.post(
    "/login",
    saveRedirectUrl,
    passport.authenticate("local", {
        failureRedirect:"/login",
        failureFlash:true,
    }),
    async(req,res)=>{
        // req.flash("success","welcome back to wander");
        // res.redirect(req.session.redirecturl);
        req.flash("success", "Welcome to Wander!");
        res.redirect(res.locals.redirectUrl || "/listings");
    }
);

router.get("/logout",(req,res)=>{
    req.logout((err)=>{
        if(err){
            next(err);
        }
        req.flash("success","you are logged out");
        res.redirect("/listings");
    })
})


module.exports=router;