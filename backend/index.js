var createError = require("http-errors");
var express = require("express");
var path = require("path");
//var logger = require("morgan");
var cors = require("cors");
var cookieParser = require('cookie-parser');
require("dotenv").config();
require("./helpers/mongodb");

const PORT = process.env.PORT;

const indexRouter = require('./routes/home.js')
const accountRouter = require('./routes/account.js')
const postRouter = require('./routes/post')
const deleteRouter = require('./routes/delete')
const avatarsRouter = require('./routes/avatars')
const communityRouter = require('./routes/community')
const userRouter = require('./routes/user')

var app = express();
app.set("view engine", "jade");

app.use(cors({ 
  origin: ["http://localhost:3000", "http://localhost:8080", "http://192.168.0.86", "http://192.168.0.86:8080", "https://maturita-forum.sk:8000", "https://maturita-forum.sk", "https://www.maturita-forum.sk"],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/", indexRouter);
app.use("/account", accountRouter);
app.use("/post", postRouter);
app.use("/delete", deleteRouter);
app.use("/avatars", avatarsRouter);
app.use("/community", communityRouter);
app.use("/user", userRouter);

app.use(function (req, res, next) {
    next(createError(404));
  });

app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get("env") === "development" ? err : {};
    //console.log(err)
    // render the error page
    res.status(err.status || 500);
    //err.message = err.message === "" ? err.name : err.message;

    err.message = err.status == 500 || err.status == undefined ? "Internal Server Error" : err.message;
    console.log(err.status + " " + req.path);
    //res.render("error");
    res.send({ error: { status: err.status, message: err.message } });
});

app.listen(PORT, () => console.log("server started"))

module.exports = app;