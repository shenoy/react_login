const express = require("express");
const Parser = require("rss-parser");
const cors = require("cors")({ origin: true });

const app = express();

const path = require("path");

const mysql = require("mysql");

const session = require("express-session");

const MySQLStore = require("express-mysql-session")(session);

const Router = require("./Router");

app.use(express.static(path.join(__dirname, "build")));

app.use(express.json());

const db = mysql.createConnection({
  host: "sql2.freemysqlhosting.net",
  user: "sql2339567",
  password: "xB2!dD8%",
  database: "sql2339567",
});

db.connect(function (err) {
  if (err) {
    console.log("DB error");
    throw err;
    return false;
  }
});

const sessionStore = new MySQLStore(
  {
    expiration: 1825 * 86400 * 1000,
    endConnectionOnClose: false,
  },
  db
);

app.use(
  session({
    key: "sdfsfdsfsdfadfdsf",
    secret: "rwerwretwrtwtwtrwt",
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1825 * 86400 * 1000,
      httpOnly: false,
    },
  })
);

new Router(app, db);

app.get("/", function (req, res) {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});

app.get("/signup", function (req, res) {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});

app.get("/rss", async (req, res) => {
  console.log(req);
  const parser = new Parser();
  const feed = await parser.parseURL("http://feeds.bbci.co.uk/news/rss.xml");
  console.log(feed, "feed at backend");
  res.send({ data: feed });
});

const port = process.env.PORT || 3000;

app.listen(port);
