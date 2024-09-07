const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express()

const outputFolder = "./output";

if(!fs.existsSync(outputFolder)){
  fs.mkdirSync(outputFolder);
}

app.get("/create_file", (req, res)=>{
  const currentDate = new Date();
  const year = currentDate.getFullYear().toString()
  const month = (currentDate.getMonth()+1).toString()
  const date = currentDate.getDate().toString()
  const hrs = currentDate.getHours().toString()
  const mins = currentDate.getMinutes().toString()
  const secs = currentDate.getSeconds().toString()

  const datetimeFilename = `${year}-${month}-${date}-${hrs}-${mins}-${secs}.txt`;

  const filePath = path.join(outputFolder, datetimeFilename);

  fs.writeFile(filePath, currentDate.toISOString(), (err)=>{
    if(err){
      res.status(500).send(`error - `, err);
      return;
    }
    res.send(`File create succesfully ${filePath}`);
  })
});

app.get("/get_files", (req, res) =>{
  fs.readdir(outputFolder, (err, files)=>{
    if(err){
      res.status(500).send("error - ", err);
    } 
    const textFile = files.filter(file=>path.extname(file) === ".txt");
    res.send(textFile);
  })
})

const PORT = 3000;

app.listen(PORT, ()=>{
  console.log(`Server runing on PORT-`+PORT);
})
