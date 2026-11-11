
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review=require("./review.js");

const listingSchema = new Schema({
    title: {
        type: String,
        required: [true, "Title is required"],
        trim: true,
        minlength: [3, "Title must be at least 3 characters"]
    },

    description: {
        type: String,
        required: [true, "Description is required"],
        trim: true,
        minlength: [20, "Description must be at least 20 characters"]
    },

    // image: {
    //     filename: {
    //         type: String,
    //         default: "listingimage"
    //     },
    //     url: {
    //         type: String,
    //         default: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b"
    //     }
    // },
    image:{
        url:String,
        filename:String,
    },

    price: {
        type: Number,
        required: [true, "Price is required"],
        min: [1, "Price must be greater than 0"]
    },

    location: {
        type: String,
        required: [true, "Location is required"],
        trim: true,
        validate: {
            validator: value => /^[a-zA-Z\s,.-]+$/.test(value),
            message: "Location is invalid"
        }
    },

    country: {
        type: String,
        required: [true, "Country is required"],
        trim: true
    },
    reviews:[{
        type:Schema.Types.ObjectId,
        ref:"Review"
    }
    ],
    owner:{
        type:Schema.Types.ObjectId,
        ref:"User",
    },
    geometry:{
        type: {
            type: String, // Don't do `{ location: { type: String } }`
            enum: ['Point'], // 'location.type' must be 'Point'
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    } 
});
//agr mene kis listing ko delete kr tho uske reviews bhi delet ho jyenge database se
listingSchema.post("findOneAndDelete",async (listing) =>{
   if(listing){
    await Review.deleteMany({_id:{$in: listing.reviews}});
   }
})

const Listing = mongoose.model("Listing", listingSchema);

module.exports = Listing;
