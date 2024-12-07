const express = require("express");
const mongoose = require("mongoose");
const Joi = require("joi");
const cors = require("cors");

const app = express();
app.use(express.json());

// cors configuration
const corsOptions = {
  origin: "https://hciucci.github.io",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};
app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

// connect to mongodb
const mongoURI = "mongodb+srv://hadenmciucci:aVdwBFrOfjbEYLPF@cluster0.2zwpk.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
mongoose
  .connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("connected to mongodb"))
  .catch((err) => console.error("mongodb connection error:", err));

// define the review schema
const reviewSchema = new mongoose.Schema({
  title: { type: String, required: true },
  artist: { type: String, required: true },
  reviewer: { type: String, required: true },
  rating: { type: Number, min: 1, max: 5, required: true },
  review: { type: String, required: true },
  date: { type: Date, default: Date.now },
});

// create the review model
const Review = mongoose.model("Review", reviewSchema);

// get all reviews
app.get("/reviews", async (req, res) => {
  try {
    const reviews = await Review.find(); // Fetch only MongoDB reviews
    res.send(reviews);
  } catch (err) {
    res.status(500).send({ message: "Error fetching reviews." });
  }
});

// add a new review
app.post("/reviews", async (req, res) => {
  const { error } = Joi.object({
    title: Joi.string().required(),
    artist: Joi.string().required(),
    reviewer: Joi.string().required(),
    rating: Joi.number().min(1).max(5).required(),
    review: Joi.string().required(),
  }).validate(req.body, { allowUnknown: true }); // allow unknown fields like `_id`

  if (error) {
    return res.status(400).send({ message: error.details[0].message });
  }

  try {
    const newReview = new Review(req.body);
    await newReview.save();
    res.status(201).send(newReview);
  } catch (err) {
    res.status(500).send({ message: "error saving review." });
  }
});

// update a review
app.put("/reviews/:id", async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({ message: "invalid review id." });
  }

  const { error } = Joi.object({
    title: Joi.string().required(),
    artist: Joi.string().required(),
    reviewer: Joi.string().required(),
    rating: Joi.number().min(1).max(5).required(),
    review: Joi.string().required(),
  }).validate(req.body, { allowUnknown: true }); // allow unknown fields like `_id`

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
      return res.status(404).send({ message: "review not found." });
    }
    res.send(updatedReview);
  } catch (err) {
    res.status(500).send({ message: "error updating review." });
  }
});

// delete a review
app.delete("/reviews/:id", async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({ message: "invalid review id." });
  }

  try {
    const deletedReview = await Review.findByIdAndDelete(id);
    if (!deletedReview) {
      return res.status(404).send({ message: "review not found." });
    }
    res.send(deletedReview);
  } catch (err) {
    res.status(500).send({ message: "error deleting review." });
  }
});

// start the server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`server running on port ${PORT}`);
});