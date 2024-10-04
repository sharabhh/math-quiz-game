import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  socketId: String,  // Unique identifier for each user
  name: String,
  highScore: { type: Number, default: 0 },  // User's high score
});

const User = mongoose.model("User", userSchema);

export default User;