import User from "../infrastructure/entities/User.js";

export const createUser = async (req, res) => {
  try {
    const userData = req.body;
    if (
      !userData.fname ||
      !userData.lname ||
      !userData.email ||
      !userData.address.line_1 ||
      !userData.address.city ||
      !userData.address.country ||
      !userData.address.zip
    ) {
      res.status(400).send();
      return;
    }

    const user = await User.create(userData);
    res.status(201).json(user);
  } catch (error) {
    res.status(500).send();
  }
};
