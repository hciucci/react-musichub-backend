const express = require("express");
const Joi = require("joi");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();

app.use(express.json());

// setup cors
const corsOptions = {
  origin: "https://hciucci.github.io",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

// connect to mongodb
mongoose
  .connect("mongodb+srv://hadenmciucci:lZXBXflUn1iFDrhm@cluster0.2zwpk.mongodb.net/reviews?retryWrites=true&w=majority", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// define the review schema
const reviewSchema = new mongoose.Schema({
  title: { type: String, required: true },
  artist: { type: String, required: true },
  reviewer: { type: String, required: true },
  rating: { type: Number, min: 1, max: 5, required: true },
  review: { type: String, required: true },
  picture: { type: String }, // optional field for picture URLs
  date: { type: Date, default: Date.now }, // add a timestamp
});

// create the review model
const Review = mongoose.model("Review", reviewSchema);

// validation schema for Joi
const reviewValidationSchema = Joi.object({
  title: Joi.string().required(),
  artist: Joi.string().required(),
  reviewer: Joi.string().required(),
  rating: Joi.number().min(1).max(5).required(),
  review: Joi.string().required(),
  picture: Joi.string().optional(),
});

// get all reviews
app.get("/reviews", async (req, res) => {
  try {
    const reviews = await Review.find();
    res.send(reviews);
  } catch (err) {
    res.status(500).send({ message: "Error retrieving reviews." });
  }
});

// add a new review
app.post("/reviews", async (req, res) => {
  const { error } = reviewValidationSchema.validate(req.body);
  if (error) {
    return res.status(400).send({ message: error.details[0].message });
  }

  try {
    const newReview = new Review(req.body);
    await newReview.save();
    res.status(201).send(newReview);
  } catch (err) {
    res.status(500).send({ message: "Error saving the review." });
  }
});

// update an existing review
app.put("/reviews/:id", async (req, res) => {
  const { id } = req.params;

  const { error } = reviewValidationSchema.validate(req.body);
  if (error) {
    return res.status(400).send({ message: error.details[0].message });
  }

  try {
    const updatedReview = await Review.findByIdAndUpdate(
      id,
      { $set: req.body },
      { new: true }
    );
    if (!updatedReview) {
      return res.status(404).send({ message: "Review not found" });
    }
    res.send(updatedReview);
  } catch (err) {
    res.status(500).send({ message: "Error updating the review." });
  }
});

// delete a review
app.delete("/reviews/:id", async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).send({ message: "Invalid ID." });
  }

  try {
    const reviewIndex = reviews.findIndex((review) => review.id == id);
    if (reviewIndex === -1) {
      return res.status(404).send({ message: "Review not found." });
    }
    const deletedReview = reviews.splice(reviewIndex, 1);
    res.status(200).send(deletedReview[0]);
  } catch (err) {
    res.status(500).send({ message: "Error deleting the review." });
  }
});

// setup server port
const PORT = process.env.PORT || 3001;

if (!PORT) {
  throw new Error("Environment variable PORT is not set. The server cannot start.");
}

// start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});