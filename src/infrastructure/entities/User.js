import mongoose from "mongoose";

const addressSchema = new mongoose.Schema({
  line_1: {
    type: String,
    required: true,
  },
  line_2: {
    type: String,
  },
  city: {
    type: String,
    required: true,
  },
  state: {
    type: String,
  },
  country: {
    type: String,
    required: true,
  },
  zip: {
    type: String,
    required: true,
  },
});

const userSchema = new mongoose.Schema({
  fname: {
    type: String,
    required: true,
  },
  lname: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  address: {
    type: addressSchema,
    required: true,
  },
});

const User = mongoose.model("User", userSchema);

export default User;
