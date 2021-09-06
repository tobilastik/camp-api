const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const Reviews = require("../models/Reviews");
const Bootcamps = require("../models/Bootcamps");

exports.getReviews = asyncHandler(async (req, res, next) => {
  if (req.params.bootcampId) {
    const reviews = await Reviews.find({ bootcamp: req.params.bootcampId });
    res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews,
    });
  } else {
    res.status(200).json(res.advancedResults);
  }
});

//get single review
exports.getReview = asyncHandler(async (req, res, next) => {
  const review = await Reviews.findById(req.params.id).populate({
    path: "bootcamp",
    select: "name description",
  });
  if (!review) {
    return next(
      new ErrorResponse(`Review of id ${req.params.id} not found`, 404)
    );
  }
  res.status(200).json({
    success: true,
    data: review,
  });
});

//add new review
exports.addReview = asyncHandler(async (req, res, next) => {
  req.body.bootcamp = req.params.bootcampId;
  req.body.user = req.user.id;
  const bootcamp = await Bootcamps.findById(req.params.bootcampId);
  if (!bootcamp) {
    return next(
      new ErrorResponse(`No Bootcamp of id ${req.params.bootcampId} exist`, 404)
    );
  }
  const review = await Reviews.create(req.body);
  res.status(201).json({
    success: true,
    data: review,
  });
});

//update review
exports.updateReview = asyncHandler(async (req, res, next) => {
  let review = await Reviews.findById(req.params.id);
  if (!review) {
    return next(
      new ErrorResponse(`No review of id ${req.params.id} exist`, 404)
    );
  }

  //make sure review belongs to user or it's an admin
  if (review.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(new ErrorResponse(`Not authorize to update review o`, 401));
  }
  review = await Reviews.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({
    success: true,
    data: review,
  });
});

//delete review
exports.deleteReview = asyncHandler(async (req, res, next) => {
  const review = await Reviews.findById(req.params.id);
  if (!review) {
    return next(
      new ErrorResponse(`No review of id ${req.params.id} exist`, 404)
    );
  }
  //make sure review belongs to user or it's an admin
  if (review.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(new ErrorResponse(`Not authorize to update review o`, 401));
  }
  await review.remove();

  res.status(200).json({
    success: true,
    data: {},
  });
});
