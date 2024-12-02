const express = require("express");
const Joi = require("joi");
const cors = require("cors");

const app = express();

// Middleware for parsing JSON
app.use(express.json());

// Enable CORS with specific origin and additional methods
const corsOptions = {
  origin: "https://hciucci.github.io", // Your GitHub Pages URL
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

app.use(cors(corsOptions));

// Handle preflight requests properly (important for PUT/DELETE)
app.options('*', cors(corsOptions));

// Hardcoded reviews
const originalReviews = [
  {
    id: 1,
    title: "Dreams",
    artist: "Benjamin Tissot",
    reviewer: "Jane Doe",
    rating: 4,
    review:
      '"Dreams" is a relaxing, chill-out track perfect for unwinding after a long day. The laid-back mood and calming melodies are a hit!',
  },
  {
    id: 2,
    title: "Slow Life",
    artist: "Benjamin Lazzarus",
    reviewer: "John Smith",
    rating: 4,
    review:
      '"Slow Life" offers an intriguing blend of epic royalty-free music, featuring piano and strings for a serene atmosphere. Perfect for videos!',
  },
  {
    id: 3,
    title: "Fireside Chat",
    artist: "Yunior Arronte",
    reviewer: "Alice Johnson",
    rating: 4,
    review:
      '"Fireside Chat" has a warm, jazzy vibe with soothing instruments that create the perfect backdrop for a cozy evening. Highly recommended!',
  },
  {
    id: 4,
    title: "Dawn of Change",
    artist: "Roman Senyk",
    reviewer: "Mark Wilson",
    rating: 3,
    review:
      '"Dawn of Change" brings emotional cinematic royalty-free music with strings and percussion that evoke powerful feelings of transformation.',
  },
  {
    id: 5,
    title: "Hope",
    artist: "Hugo Dujardin",
    reviewer: "Sarah Clark",
    rating: 4,
    review:
      '"Hope" is a beautiful, touching piano track that will resonate with anyone who enjoys calming piano solos. It\'s short but very sweet.',
  },
  {
    id: 6,
    title: "Yesterday",
    artist: "Aventure",
    reviewer: "Chris Thompson",
    rating: 5,
    review:
      '"Yesterday" is a standout! The relaxing synths and drums make it a great choice for unwinding and creating a serene atmosphere. A must-listen.',
  },
  {
    id: 7,
    title: "Hearty",
    artist: "Aventure",
    reviewer: "Rachel Evans",
    rating: 3,
    review:
      '"Hearty" has a touching, soft feel, with relaxing synths and drums that fit perfectly for emotional scenes. Aventure delivers again.',
  },
  {
    id: 8,
    title: "Floating Garden",
    artist: "Aventure",
    reviewer: "Michael Brown",
    rating: 4,
    review:
      '"Floating Garden" is a dreamy lo-fi track that features bass and electric guitar. Its mellow vibes are perfect for chilling out.',
  },
  {
    id: 9,
    title: "Angels By My Side",
    artist: "Lunar Years",
    reviewer: "Laura Green",
    rating: 4,
    review:
      '"Angels By My Side" is a beautiful, touching folk track featuring acoustic guitar and heartfelt melodies. It\'s a deeply emotional song.',
  },
  {
    id: 10,
    title: "Moonlight Drive",
    artist: "Yunior Arronte",
    reviewer: "Tom Harris",
    rating: 5,
    review:
      '"Moonlight Drive" is a slow, lo-fi relaxing track with calming piano, synth, drums, and bass. Perfect for a late-night drive or chill session.',
  },
];

let reviews = [...originalReviews];

const reviewSchema = Joi.object({
  title: Joi.string().required(),
  artist: Joi.string().required(),
  reviewer: Joi.string().required(),
  rating: Joi.number().min(1).max(5).required(),
  review: Joi.string().required(),
});

// GET to fetch reviews
app.get("/reviews", (req, res) => {
  res.send(reviews);
});

// POST to add a review
app.post("/reviews", (req, res) => {
  console.log("Received data:", req.body);
  const { error } = reviewSchema.validate(req.body);
  if (error) {
    return res.status(400).send({ message: error.details[0].message });
  }

  const newReview = { id: reviews.length + 1, ...req.body };
  reviews.push(newReview);
  res.status(201).send(newReview);
});

// PUT to update a review
app.put("/reviews/:id", (req, res) => {
  const { id } = req.params;
  const { error } = reviewSchema.validate(req.body);
  if (error) {
    return res.status(400).send({ message: error.details[0].message });
  }

  const reviewIndex = reviews.findIndex((review) => review.id == id);
  if (reviewIndex === -1) {
    return res.status(404).send({ message: "Review not found" });
  }

  reviews[reviewIndex] = { id: parseInt(id), ...req.body };
  res.status(200).send(reviews[reviewIndex]);
});

// DELETE to remove a review
app.delete("/reviews/:id", (req, res) => {
  const { id } = req.params;
  const reviewIndex = reviews.findIndex((review) => review.id == id);
  if (reviewIndex === -1) {
    return res.status(404).send({ message: "Review not found" });
  }

  const deletedReview = reviews.splice(reviewIndex, 1);
  res.status(200).send(deletedReview[0]);
});

const PORT = process.env.PORT || 3001;

if (!PORT) {
  throw new Error("Environment variable PORT is not set. The server cannot start.");
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});