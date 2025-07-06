import express from "express";
import hotelsRouter from "./api/hotel.js";

const app = express();

// Convert HTTP payloads into JS objects
app.use(express.json());

app.use("/api/hotels", hotelsRouter);

// app.get("/api/hotels", (req, res) => {
//   res.status(200).json(hotels);
// });

// app.get("/api/hotels/:_id", (req, res) => {
//   //   console.log(req.params);
//   const _id = req.params._id;
//   //   console.log(_id);
//   const hotel = hotels.find((el) => el._id === _id);
//   if (!hotel) {
//     res.status(404).send();
//   }
//   res.status(200).json(hotel);
// });

// app.post("/api/hotels", (req, res) => {
//   const hotel = { ...req.body, _id: String(hotels.length + 1) };
//   if (!hotel.name || !hotel.image || !hotel.location) {
//     res.status(400).send();
//   }
//   hotels.push(hotel);
//   res.status(201).send();
// });

// app.put("/api/hotels/:_id", (req, res) => {
//   const _id = req.params._id;
//   const index = hotels.findIndex((el) => el._id === _id);
//   if (index === -1) {
//     res.status(404).send();
//   }

//   const data = req.body;
//   const updatedHotel = { ...hotels[index], ...data };
//   hotels.splice(index, 1);
//   hotels.push(updatedHotel);
//   res.status(200).send();
// });

// app.patch("/api/hotels/:_id", (req, res) => {
//   const _id = req.params._id;
//   const hotel = hotels.find((el) => el._id === _id);
//   if (!hotel) {
//     res.status(404).send();
//   }

//   const data = req.body;
//   hotel.price = data.price;
//   res.status(200).send();
// });

// app.delete("/api/hotels/:_id", (req, res) => {
//   const _id = req.params._id;
//   const index = hotels.findIndex((el) => el._id === _id);
//   if (index === -1) {
//     res.status(404).send();
//   }
//   hotels.splice(index, 1);
//   res.status(200).send();
// });

const PORT = 8000;
app.listen(PORT, () => {
  console.log("Server is listening on PORT: ", PORT);
});
