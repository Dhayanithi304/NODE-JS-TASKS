const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const app = express()
const PORT = 3000;
const DB_URL = "mongodb://localhost:27017/hall_booking"

app.use(bodyParser.json());

const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch((err) => {
        res.status(500).json({ error: err.message });
    });
};

//Room collection schema
const RoomSchema = new mongoose.Schema({
    id          : { type: Number, unique: true },
    room_name   : String,
    seats_count : Number,
    amenities   : String,
    hour_price       : String
})

const Rooms = mongoose.model("Rooms", RoomSchema);

//Customer collection schema
const CustomersSchema = new mongoose.Schema({
    id              : { type: Number, unique: true },
    customer_name   : String,
    date            : Date,
    start_time      : String,
    end_time        : String,
    room_id         : Number,
    booked_status   : String
})

const Customers = mongoose.model("Customers", CustomersSchema);

mongoose
  .connect(DB_URL)
  .then(()=> console.log("Successfully connect to Mongodb"))
  .catch((err)=> console.log("Error to connect Mongodb :", err))
 
app.post("/create_room", asyncHandler( async (req, res)=>{
    const {id, room_name, seats_count, amenities, hour_price} = req.body;

    if ( id < 1 || !room_name || seats_count < 1 || !amenities || !hour_price) {
        return res.status(500).json({error: (
            id < 1           ? "id should be given" :
            !room_name       ? "Room Name should be given" :
            seats_count < 1  ? "Seats of should be given" :
            !amenities       ? "Amenities of room should be given" :
            !hour_price      ? "Price of room should be given" : ""
        )});  
    }
    const Room = new Rooms(req.body);
    const saveRes = await Room.save();
    res.status(201).json(saveRes);
}))

app.post("/book_room", asyncHandler( async (req, res)=>{
    const { id, customer_name, date, start_time, end_time, room_id } = req.body;

    if ( id < 1 || !customer_name || !date || !start_time  || !end_time || room_id < 1) {
        return res.status(500).json({ error: (
            id < 1          ? "id should be given" :
            !customer_name  ? "Customer should be given" :
            !date           ? "Date of the room should be given" :
            room_id < 1     ? "ID of the room should be given" :
            (!start_time || !end_time)  ? "Start time and end time should be given" : ""
        )});  
    }
    const Customer = new Customers({...req.body, booked_status: "Pending"});
    const saveRes = await Customer.save();
    res.status(201).json(saveRes);
}));


app.get("/get_rooms/:id", asyncHandler( async (req, res)=>{
    const id = parseInt(req.params.id)
    const Room = await Rooms.aggregate([
        { $match: { id: id } },
        { $lookup: {
                from: "customers",          
                localField: "id",
                foreignField: "room_id",
                as: "customers"
            }
        },
    ])
    const lastRoom = await Rooms.findOne().sort({ id: -1 }).exec();
    const newRoomId = lastRoom ? lastRoom.id + 1 : 1; // If no room exists, start with ID 1

    if(!Room) return res.status(500).json({error: "Room not found"})
    res.status(200).json(Room);
}));


app.get("/get_customer/:id", asyncHandler( async (req, res)=>{
    const id = parseInt(req.params.id)
    const Customer = await Customers.aggregate([
        { $match:  { id: id } },
        { $lookup: {
                from: "rooms",          
                localField: "room_id",
                foreignField: "id",
                as: "rooms"
            }
        },
    ])
    if(!Customer) return res.status(500).json({error: "Customer not found"})
    res.status(201).json(Customer);
}));


app.listen(PORT, ()=>{
    console.log("Successfully running in Port: ", PORT);
}) 