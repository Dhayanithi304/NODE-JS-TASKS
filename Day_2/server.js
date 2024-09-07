const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();

const outputFolder = "./output";

if (!fs.existsSync(outputFolder)) {
  fs.mkdirSync(outputFolder);
}



app.get("/create_file", (req, res) => {
    const currentTime = new Date()
    const year = currentTime.getFullYear().toString();
    const month = (currentTime.getMonth() + 1).toString();
    const date = currentTime.getDate().toString();
    const hrs = currentTime.getHours().toString();
    const mins = currentTime.getMinutes().toString();
    const secs = currentTime.getSeconds().toString();

    const dateTimeFileName = `${year}-${month}-${date}-${hrs}-${mins}-${secs}.txt`;
    
    const filePath = path.join(outputFolder, dateTimeFileName)

    fs.writeFile(filePath, currentTime.toISOString(), (err) =>{
        if(err){
            res.status(500).send(`File creating error - ${err}`);
            return;
        }
        res.send(`File Created Successfully - ${dateTimeFileName}`)
    })
})

app.get("/get_files", (req, res)=>{
    
    // const textFile = 
})

const PORT = 3000;

app.listen(PORT, () => {    
  console.log("Server is running on PORT,", PORT);
});
