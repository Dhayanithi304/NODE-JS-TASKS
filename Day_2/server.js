const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express()

// define folder path 
const outputFolder = "./output";

// check is the output folder was exists or not
if(!fs.existsSync(outputFolder)){
  fs.mkdirSync(outputFolder); // create a output folder 
}

app.get("/create_file", (req, res)=>{
  const currentDate = new Date();
  const year = currentDate.getFullYear().toString()
  const month = (currentDate.getMonth()+1).toString()
  const date = currentDate.getDate().toString()
  const hrs = currentDate.getHours().toString()
  const mins = currentDate.getMinutes().toString()
  const secs = currentDate.getSeconds().toString()

  // define text file name
  const datetimeFilename = `${year}-${month}-${date}-${hrs}-${mins}-${secs}.txt`; 

  // create a text file into a output folder
  const filePath = path.join(outputFolder, datetimeFilename); // ( folder path, file name )

  // write content into the text file path 
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
