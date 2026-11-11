const { reviewSchema } = require("../schema.js");

module.exports.validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);

    if (error) {
        return res.status(400).send(
            error.details.map(el => el.message).join(", ")
        );
    }

    next();
};