import mongoose from "mongoose";
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  username: String,
  password: String,
});

//in the front-end, Posts.js, add method
//the keys in the data object must match the mongoose schema keys
const PostSchema = new Schema({
  name: String,
  text: String,
  dateTime: String,
});

export const User = mongoose.model('User', UserSchema);
export const Post = mongoose.model('Post', PostSchema);
const db = "mongodb://localhost:27017";
export default db; //need one default export