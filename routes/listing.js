const express=require("express");
const router=express.Router();
const WrapAsync = require("../utils/WrapAsync.js");
const Listing = require("../models/listing.js");
const {isLoggedIn, isOwner ,validateListing}=require("../middleware.js");
const multer=require('multer');
const {storage}=require("../cloudconfig.js");
const upload=multer({storage});
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapToken=process.env.MAP_TOKEN;
const geocodingClient=mbxGeocoding({accessToken:mapToken});



// listings se related sb routes isme honge

router.get(
    "/",
    WrapAsync(async (req, res) => {
        const allListings = await Listing.find({});

        res.render("listings/index.ejs", {
            allListings
        });
    })
);

router.get("/new", isLoggedIn,(req, res) => {
    res.render("listings/new.ejs");
});


router.get(
    "/:id",
    WrapAsync(async (req, res) => {
        const { id } = req.params;
        const listing = await Listing.findById(id)
        .populate({
            path:"reviews",
            populate:{
                path:"author",
            }
        })
        .populate("owner");
        if (!listing) {
            throw new ExpressError(404, "Listing not found");
        }
        res.render("listings/show.ejs", {
            listing
        });
    })
);
router.post(
    "/",
    isLoggedIn,
    upload.single("listing[image]"),
    WrapAsync(async (req, res) => {
        const response =await geocodingClient.forwardGeocode({
            query:req.body.listing.location,
            limit: 1,
        }).send();
        const newListing = new Listing(req.body.listing);
        newListing.owner = req.user._id;
        newListing.image = {
            url: req.file.path,
            filename: req.file.filename
        };
        if (response.body.features.length === 0) {
            throw new ExpressError(400, "Invalid location");
        }
        newListing.geometry=response.body.features[0].geometry;
        console.log("GEOMETRY:", newListing.geometry);
        let savedListing=await newListing.save();
        console.log("SAVED GEOMETRY:", savedListing.geometry);
        req.flash("success","New Listing Created");
        res.redirect("/listings");
    })
);

router.get(
    "/:id/edit",
    isOwner,
    WrapAsync(async (req, res) => {
        const { id } = req.params;

        const listing = await Listing.findById(id);

        if (!listing) {
            throw new ExpressError(404, "Listing not found");
        }

        let originalImageurl=listing.image.url;
        originalImageurl=originalImageurl.replace("/upload","/upload/w_250");

        res.render("listings/edit.ejs", {
            listing,originalImageurl
        });
    })
);
router.put(
    "/:id",
    isLoggedIn,
    isOwner,
    upload.single("listing[image]"),
    WrapAsync(async (req, res) => {
        let { id } = req.params;
        let listing = await Listing.findById(id);
        // Update normal fields
        listing.title = req.body.listing.title;
        listing.description = req.body.listing.description;
        listing.price = req.body.listing.price;
        listing.country = req.body.listing.country;
        listing.location = req.body.listing.location;
        // Update image if new image is uploaded
        if (req.file) {
            listing.image = {
                url: req.file.path,
                filename: req.file.filename
            };
        }
        await listing.save();
        req.flash("success", "Listing Updated!");
        res.redirect(`/listings/${id}`);
    })
);
router.delete(
    "/:id",
    isLoggedIn,
    isOwner,
    WrapAsync(async (req, res) => {
        const { id } = req.params;

        const deletedListing = await Listing.findByIdAndDelete(id);

        if (!deletedListing) {
            throw new ExpressError(404, "Listing not found");
        }

        req.flash("success", "Listing Deleted!");
        res.redirect("/listings");
    })
);


module.exports=router;

