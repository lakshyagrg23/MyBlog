import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import env from "dotenv";

const app = express();
const port = 5000;
env.config();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

const db = new pg.Client({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASSWORD,
  port: process.env.PG_PORT,
});

db.connect();

app.get("/", async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM posts ORDER BY date DESC");
    const posts = result.rows;

    res.render("index.ejs", {
      posts: posts,
      content: "",
    });
  } catch (err) {
    console.log(err);
    res.render("index.ejs", {
      posts: [],
      content: "You have not created any posts yet!",
    });
  }
});

app.get("/", (req, res) => {
  res.render("index.ejs", {
    content: "You have not created any posts yet!",
  });
});

app.post("/newPost", (req, res) => {
  res.render("newPost.ejs");
});

app.post("/", async (req, res) => {
  let title = req.body["title"];
  let content = req.body["content"];
  let author = req.body["author"];
  console.log(title, content, author);
  try {
    await db.query(
      "INSERT INTO posts (title, content, author) VALUES ($1, $2, $3)",
      [title, content, author],
      (err, result) => {
        if (err) {
          console.log(err);
        } else {
          console.log("Post added successfully");
        }
      }
    );
    res.redirect("/");
  } catch (err) {
    console.log(err);
  }
});

app.listen(port, () => {
  console.log(`Listening at port ${port}`);
});
