import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import db from './db.mjs'; //do not use {} for default export
import { User, Post } from './db.mjs'; //must use {} for non default exports

const app = express();

//necessary to pass data from front end to back end, otherwise will have cors error
app.use(cors({ origin: true, credentials: true })); 
//necessary to store form data into mongo, otherwise mongo will only have id and v fields
app.use(express.json({ extended: false })); // decode JSON-formatted incoming POST data
// app.use(express.urlencoded({ extended: true })) // decode url-encoded incoming POST data

//the location of this heroku block is very important, it must be after cors
//START: heroku only
import path from 'path';
//note: heroku does not use our .env file, heroku uses their own config variables on their website
//the .env is just here so the heroku version of the code can still run locally (.env is local)
import * as dotenv from 'dotenv' 
dotenv.config();
const heroku =  process.env.MONGO_URI; //MAKE SURE THIS VALUE MATCHES THE CONFIG VARIABLE VALUE ON THE HEROKU WEBSITE
if (process.env.NODE_ENV === 'production') {
  app.use(express.static('../front-end/build'));
  //some places use app.get('*'), that is dangerous and could break things
  app.get('/', (req, res) => {
    res.sendFile(path.resolve(__dirname, '..', 'front-end', 'build', 'index.html'));
  })
}
//END: heroku only

mongoose
  .connect(heroku) //heroku only
  //.connect(db) //localhost only
  .then(console.log(`Connected to MongoDB on ${heroku}`)) //heroku only
  // .then(console.log(`Connected to MongoDB on ${db}`)) //localhost only
  .catch(err => console.error(err));

//testing
app.get('/test', (req, res) => res.send('Hello world!'));

//NOTE: when not hosting on heroku, we can remove the heroku string on line 46, remember to change the front end route too
//we need app.get('/heroku') for heroku because it needs to use the app.get('/') route to host the front end
//called by axios.get in posts.js in front end
// app.get('/heroku', (req, res) => {
//   Post.find()
//     .then(posts => res.json(posts)) //posts is res.data in axios.get().then(res) in posts.js in front end, also is the data on localhost:4000/
//     .catch(err => res.json(err));
// });

app.get('/', (req, res) => {
  Post.find()
    .then(posts => res.json(posts)) //posts is res.data in axios.get().then(res) in posts.js in front end, also is the data on localhost:4000/
    .catch(err => res.json(err));
});

//called by axios.post in posts.js  in front end
app.post('/', (req, res) => {
  Post.create(req.body)
    .then(post => res.json(post)) //post is res.data in axios.post().then(res) in posts.js in front end
    .catch(err => res.json(err));
});

//called by axios.put in editbutton.js in front end
app.put('/:id', (req, res) => {
  Post.findByIdAndUpdate(req.params.id, req.body)
    .then(post => res.json(post)) //post is res.data in axios.put().then(res) in posts.js in front end
    .catch(err => res.json(err));
});

//called by axios.delete in posts.js in front end
app.delete('/:id', (req, res) => {
  Post.findByIdAndRemove(req.params.id, req.body)
    .then(post => res.json(post)) //post is res.data in axios.delete().then(res) in posts.js in front end
    .catch(err => res.json(err));
});

//-----------------------------------
//register and login after this point
//-----------------------------------

//not called on front end
app.get('/register', (req, res) => {
  User.find()
    .then(users => res.json(users)) //this is what displays on localhost:4000/register
    .catch(err => res.json(err));
});

//called by axios.post in handleRegister() in login.js in front end
app.post('/register', (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  const saltRounds = 10;
  //notice that there are 3 ways to get the result from the async mongo calls = callback parameters, then(), await

  //method 1 = callback parameters
  //User.findOne({username: username}, (err, user) => {}) and use "user"
  //User.findOne({username: username}).then(user => res.json({}) and use "user"

  //method 2 = then()
  // User.findOne({username: username})
  //   .then(user => res.json(user))
  //   .catch(err => res.json(err));
  // User.create({username: username, password: password})
  //   .then(user => res.json(user))
  //   .catch(err => res.json(err));

  //method 3 = async/await
  //make sure that everything with await is inside an async function
  //const userFind = await User.findOne({username: username})
  //const userCreate = await User.create({username: username, password: password})

  User.findOne({username: username}, (err, user) => {
    if (user) { //user already exists
      res.json(null); //null is res.data in axios.post().then(res) in handleRegister() in login.js in front end
    }
    else {
      bcrypt.hash(password, saltRounds, (err, hash) => { //hash is the hashed password generated by bcrypt
        User.create({username: username, password: hash})
          .then(user => res.json(user)) //user is res.data in axios.post().then(res) in handleRegister() in login.js in front end
          .catch(err => res.json(err));  
      });
    }
  });
});

//not called on front end
//ideally we would use res.json to send the user that just logged in
//but because the username and password come from app.post, we don't have the information needed to find the matching user
//app.post('/login') is all we need to validate the user and send a response to the front end
app.get('/login', (req, res) => res.send('This path is not in use'));

//called by axios.post in handleLogin() in login.js in front end
app.post('/login', (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  User.findOne({username: username}, (err, user) => {
    if (user) { //username is correct
      bcrypt.compare(password, user.password, (err, passwordMatch) => { //passwordMatch compares req.body.password (input) with user.password (in database)
        if (passwordMatch) { //username and password are correct
          res.json(user); //user is res.data in axios.post().then(res) in handleLogin() in login.js in front end
        }
        else { //username is correct but password is incorrect
          res.json(null); //null is res.data in axios.post().then(res) in handleLogin() in login.js in front end
        }
      });
    }
    else { //username is incorrect
      res.json(null);
    }
  });
  //implementation without bcrypt
  // User.findOne({username: username, password: password})
  //   .then(user => res.json(user)) //user is res.data in axios.post().then(res) in handleLogin() in login.js in front end
  //   .catch(err => res.json(err));
});

// const port = 4000;
const port = process.env.PORT || 4000; //heroku only line

app.listen(port, () => console.log(`Server running on port ${port}`));
