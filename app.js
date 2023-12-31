//todo manager pass and manager sales

const express = require("express");
const app = express();
const path = require("path");
const mysql = require("mysql2");
const port = 80;

const recepRouter = require("./routes/recep");
const managerRouter = require("./routes/manager")


app.use("/manager", managerRouter);
app.use("/recep", recepRouter);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({extended: true}));


app.get("/", (req,res)=>{
    res.redirect("/recep");
});




app.listen(port, () => {
    console.log(`App running on port ${port}`);
});
