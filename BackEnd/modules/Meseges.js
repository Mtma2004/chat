// const mongoose = require("mongoose");
import mongoose from "mongoose";

const messegesSchema = mongoose.Schema({
  conversationId: {
    type: String,
  },
  senderId: {
    type: String,
  },
  message: {
    type: String,
  },
});

const Messeges = mongoose.model("Messeges", messegesSchema);
// module.exports = Messeges;
export default Messeges;
