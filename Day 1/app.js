//import the express library
const express = require("express");

const app = express();

const PORT = 3030;

app.get("/", (req, res) => {
    res.send(["hello from express"])
})

app.get("/home", (req, res) => {
    res.send('hiii from home ')
})

app.listen(PORT, ()=>{
    console.log("PORT - ",PORT);
});