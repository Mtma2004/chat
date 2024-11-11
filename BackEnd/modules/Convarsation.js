// const mongoose = require("mongoose");
import mongoose from "mongoose";

const convasationSchema = mongoose.Schema({
  members: {
    type: Array,
    required: true,
  },
});

const Convasation = mongoose.model("Convasation", convasationSchema);
// module.exports = Convasation;
export default Convasation;
