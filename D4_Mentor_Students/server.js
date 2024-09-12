const express = require("express")
const bodyParser = require("body-parser")
const mongoose = require("mongoose")

//importing models
const Mentor = require("./Models/Mentor");
const Student = require("./Models/Student");

require("dotenv").config();

const app =  express()
const PORT = process.env.PORT;
const DB_URL = process.env.DB_URL;

app.use(bodyParser.json());

mongoose.connect(DB_URL)
    .then(()=>console.log("Connected to mongodb"))
    .catch((err)=>console.log("Error to Connect mongodb: ",err))

const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch((err) => {
        res.status(500).json({ error: err.message });
    });
};

//create mentor
app.post("/create_mentor", asyncHandler( async (req, res) => {
    const mentor = new Mentor(req.body) 
    await mentor.save();
    res.status(200).send(mentor)
}))

//create Student
app.post("/create_student", asyncHandler( async (req, res) => {
    const student = new Student(req.body) 
    await student.save();
    res.status(200).send(student)
}))


//assign mentor to multiple students
app.post("/assign_mentor", asyncHandler( async (req, res) => {
    const mentor_id = req.body.    id;
    const student_ids = req.body.student_ids;
    if(mentor_id < 1) return res.status(400).send("Mentor ID must be given")
    if(student_ids.length < 1) return res.status(400).send("Student ID must be given")
    
    const mentor = await Mentor.findById(mentor_id)
    if (!mentor) return res.status(404).send("Mentor not found");

    const students = await Student.find({_id: { $in : student_ids}})

    students.forEach((student) => {
        student.cMentor = mentor._id;
        student.save();
    });

    mentor.students = [
        ...mentor.students,
        ...students.map((student) => student._id)
    ]
    await mentor.save();
    res.status(200).json(mentor);
}))

//update mentor to perticular student
app.post("/update_mentor", asyncHandler( async (req, res) => {
    const mentor_id = req.body.mentor_id;
    const student_id = req.body.student_id;

    if(mentor_id < 1) return res.status(400).send("Mentor ID must be given")
    if(student_id.length < 1) return res.status(400).send("Student ID must be given")
    
    const nMentor = await Mentor.findById(mentor_id)
    const student = await Student.findById(student_id)

    if( student.cMentor ){
        student.pMentor.push(student.cMentor)
    }

    student.cMentor = nMentor._id;
    await student.save();
    res.status(200).json(student);
}))

//get all students of perticuler mentor
app.get("/get_students/:mentor_id", asyncHandler( async (req, res) => {
    const mentor_id = req.params.mentor_id;
    
    if(mentor_id < 1) return res.status(400).send("Id must be given")

    const mentor = await Mentor.findById(mentor_id).populate("students")

    if(!mentor) return res.send("mentor not found")

    mentor.save();
    res.status(200).json(mentor.students);
}))

//get all prev mentors of perticuler student
app.get("/prev_mentor/:student_id", asyncHandler( async (req, res) => {
    const student_id = req.params.student_id;
    
    if(student_id < 1) return res.status(400).send("Id must be given")

    const student = await Student.findById(student_id).populate("pMentor")

    if(!student) return res.send("Student not found")

    student.save();
    res.status(200).json(student.pMentor);
}))

app.listen(PORT, ()=>{
    console.log("Successfully running in PORT: ",PORT);
})