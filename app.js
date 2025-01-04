const express = require("express");
const { connectToDb, getDb } = require("./db");
// const { ObjectId } = require("mongodb");
const { ObjectId } = require("mongodb");

// init app & middleware
const app = express();
app.use(express.json());

// connect to database
let db;
connectToDb((err) => {
  console.log("Connected to database");
  if (err) {
    throw new Error("Failed to connect to database");
  }

  // listen to requests;
  app.listen(3001, () => {
    console.log("Server is running on port 3001");
  });
  db = getDb(); // this is do all CRUD operations
});

// routes
// get all books
app.get("/books", (req, res) => {
  // current page
  const page = parseInt(req.query.page) || 0;
  const booksPerPage = 2;

  let books = [];
  db.collection("books")
    .find()
    .sort({ author: 1 })
    .skip(page * booksPerPage)
    .limit(booksPerPage)
    .forEach((book) => books.push(book))
    .then(() => {
      res.status(200).json(books);
    })
    .catch((err) => {
      res.status(500).json({ error: "Failed to get books", err });
    });
});

// get by id
app.get("/books/:id", (req, res) => {
  const id = req.params.id;

  if (!ObjectId.isValid(id)) {
    return res.status(400).json({ error: `Invalid Id:${id} format` });
  }

  db.collection("books")
    .findOne({ _id: new ObjectId(id) })
    .then((book) => {
      if (!book) {
        return res.status(404).json({ error: "Book not found" });
      }
      res.status(200).json(book);
    })
    .catch((err) =>
      res.status(500).json({ error: "Failed to get book by ID", err })
    );
});

// insert a book into collection
app.post("/books", (req, res) => {
  /* to get this body we need app.use(express.json()) this from express */
  const body = req.body;
  console.log(body);

  db.collection("books")
    .insertOne(body)
    .then((result) => {
      res.status(201).json(result);
    })
    .catch((err) => {
      res.status(500).json({ error: "Failed to insert book", err });
    });
});

// delete a book by id
app.delete("/books/:id", (req, res) => {
  const id = req.params.id;

  if (!ObjectId.isValid(id)) {
    return res.status(404).json({ error: `Invalid ID:${id} format` });
  }

  db.collection("books")
    .deleteOne({ _id: new ObjectId(id) })
    .then((result) => {
      res.status(200).json(result);
    })
    .catch((err) => {
      res.status(500).json({ error: "Failed to delete book", err });
    });
});

// patch a book by id
app.patch("/books/:id", (req, res) => {
  const body = req.body;
  const id = req.params.id;

  if (!ObjectId.isValid(id)) {
    return res.status(404).json({ error: `Invalid ID:${id} format` });
  }

  db.collection("books")
    .updateOne({ _id: new ObjectId(id) }, { $set: body })
    .then((result) => {
      if (result.modifiedCount === 0) {
        return res.status(404).json({ error: "Book not found" });
      }
      res.status(200).json(result);
    })
    .catch((err) => {
      res.status(500).json({ error: "Failed to update book", err });
    });
});
