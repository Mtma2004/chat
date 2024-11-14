import mongoose from "mongoose";

const usersschema = mongoose.Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  age: {
    type: String,
    required: true,
  },
  photos: {
    type: String,
  },
  quite: {
    type: String,
  },
  token: {
    type: String,
  },
});

const Users = mongoose.model("User", usersschema);
// module.exports = Users;

export default Users;
