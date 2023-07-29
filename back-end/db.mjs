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

//the first argument in mongoose.model is the collection name in the mongo server
//mongoose automatically changes the argument (example: 'User') to plural and lowercase (example: users) for the collection name
export const User = mongoose.model('User', UserSchema);
export const Post = mongoose.model('Post', PostSchema);
const db = "mongodb://localhost:27017";
export default db; //need one default export