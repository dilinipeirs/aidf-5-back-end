import Hotel from "../infrastructure/entities/Hotel.js";

export const getAllHotels = async (req, res) => {
  try {
    const hotels = await Hotel.find();
    res.status(200).json(hotels);
  } catch (error) {
    res.status(500).send();
  }
};

export const createHotel = async (req, res) => {
  try {
    const hotelData = req.body;
    if (
      !hotelData.name ||
      !hotelData.image ||
      !hotelData.location ||
      !hotelData.price ||
      !hotelData.description
    ) {
      res.status(400).send();
      return;
    }
    await Hotel.create(hotelData);
    res.status(201).send();
  } catch (error) {
    res.status(500).send();
  }
};

export const getHotelById = async (req, res) => {
  try {
    const _id = req.params._id;
    const hotel = await Hotel.findById(_id);
    if (!hotel) {
      res.status(404).send();
      return;
    }
    res.status(200).json(hotel);
  } catch (error) {
    res.status(500).send();
  }
};

export const updateHotel = async (req, res) => {
  try {
    const _id = req.params._id;
    const hotelData = req.body;
    if (
      !hotelData.name ||
      !hotelData.image ||
      !hotelData.location ||
      !hotelData.price ||
      !hotelData.description
    ) {
      res.status(400).send();
      return;
    }

    const hotel = await Hotel.findById(_id);
    if (!hotel) {
      res.status(404).send();
      return;
    }

    await Hotel.findByIdAndUpdate(_id, hotelData);
    res.status(200).send;
  } catch (error) {
    res.status(500).send();
  }
};

export const patchHotel = async (req, res) => {
  try {
    const _id = req.params._id;
    const hotelData = req.body;
    if (!hotelData.price) {
      res.status(400).send();
      return;
    }
    const hotel = await Hotel.findById(_id);
    if (!hotel) {
      res.status(404).send();
      return;
    }
    await Hotel.findByIdAndUpdate(_id, { price: hotelData.price });
    res.status(200).send();
  } catch (error) {
    res.status(500).send();
  }
};

export const deleteHotel = async (req, res) => {
  try {
    const _id = req.params._id;
    const hotel = await Hotel.findById(_id);
    if (!hotel) {
      res.status(404).send();
      return;
    }
    await Hotel.findByIdAndDelete(_id);
    res.status(200).send();
  } catch (error) {
    res.status(500).send();
  }
};
