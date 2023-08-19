var createError = require("http-errors");
var express = require("express");
var path = require("path");
//var logger = require("morgan");
var cors = require("cors");
require("dotenv").config();
require("./helpers/mongodb");

const PORT = 8080;

indexRouter = require('./routes/home.js')
accountRouter = require('./routes/account.js')

var app = express();
app.set("view engine", "jade");



app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/", indexRouter);
app.use("/account", accountRouter);

app.use(function (req, res, next) {
    next(createError(404));
  });

app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get("env") === "development" ? err : {};
  
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