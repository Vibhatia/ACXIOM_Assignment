import express from "express";
import Book from "../models/Book.js";
import BookCategory from "../models/BookCategory.js";

const router = express.Router();

// Get all books in the db
router.get("/allbooks", async (req, res) => {
  try {
    const books = await Book.find({})
      .populate("transactions")
      .sort({ _id: -1 });
    res.status(200).json(books);
  } catch (err) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Get Book by book Id
router.get("/getbook/:id", async (req, res) => {
  try {
    const book = await Book.findById(req.params.id).populate("transactions");
    res.status(200).json(book);
  } catch (err) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Get books by category name
router.get("/", async (req, res) => {
  const category = req.query.category;
  try {
    const books = await BookCategory.findOne({ categoryName: category }).populate("books");
    res.status(200).json(books);
  } catch (err) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Adding book
router.post("/addbook", async (req, res) => {
  if (req.body.isAdmin) {
    try {
      const newBook = await Book.create({
        bookName: req.body.bookName,
        alternateTitle: req.body.alternateTitle,
        author: req.body.author,
        bookCountAvailable: req.body.bookCountAvailable,
        language: req.body.language,
        publisher: req.body.publisher,
        bookStatus: req.body.bookStatus,
        categories: req.body.categories,
      });

      await BookCategory.updateMany({ '_id': newBook.categories }, { $push: { books: newBook._id } });

      res.status(200).json(newBook);
    } catch (err) {
      res.status(500).json({ error: "Internal Server Error" });
    }
  } else {
    res.status(403).json({ error: "You don't have permission to add a book!" });
  }
});

// Updating book
router.put("/updatebook/:id", async (req, res) => {
  if (req.body.isAdmin) {
    try {
      await Book.findByIdAndUpdate(req.params.id, { $set: req.body });
      res.status(200).json("Book details updated successfully");
    } catch (err) {
      res.status(500).json({ error: "Internal Server Error" });
    }
  } else {
    res.status(403).json({ error: "You don't have permission to update a book!" });
  }
});

// Remove book
router.delete("/removebook/:id", async (req, res) => {
  if (req.body.isAdmin) {
    try {
      const book = await Book.findByIdAndRemove(req.params.id);
      await BookCategory.updateMany({ '_id': book.categories }, { $pull: { books: book._id } });
      res.status(200).json("Book has been deleted");
    } catch (err) {
      res.status(500).json({ error: "Internal Server Error" });
    }
  } else {
    res.status(403).json({ error: "You don't have permission to delete a book!" });
  }
});

export default router;
