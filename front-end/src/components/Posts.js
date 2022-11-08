import React, { useState, useEffect } from 'react';
import '../App.css';
import axios from 'axios';
import Post from './Post';
import './Components.css';
import { useLocation, useNavigate } from 'react-router-dom';
import { server } from '../App.js';

function Posts() {
  const [search, setSearch] = useState('');
  const [posts, setPosts] = useState([]);
  const [postsFiltered, setPostsFiltered] = useState([]);
  const [text, setText] = useState('');
  const date = new Date();
  const dateTime = date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  const admin = 'admin'; //username for admin, so if an unwanted user creates an unwanted post, we can edit or delete it 
  const [select, setSelect] = useState('');
  const [status, setStatus] = useState('');

  //if we did not come from the login page, force the user back to login
  //when we do npm start or manually go to localhost:3000/, redirect to login
  //this also ensures people who are not logged in can't manually bypass the login page
  useEffect(() => {
    const location = useLocation(); //eslint rule that we should declare this locally instead of globally if we only use it inside useEffect
    const navigate = useNavigate(); //eslint rule that we should declare this locally instead of globally if we only use it inside useEffect
    if (location.state === null) {
      navigate('login');
    }
  }, []);

  //the keys must match the mongoose schema keys
  //the values must match the state variables at the top of this function (except for name because that comes from Login.js)
  const data = {
    name: location.state ? location.state.name: null, //*
    text: text, 
    dateTime: dateTime,
  };
  //* name will never be null because if location.state is null we will redirect to the login page
  //we just need this ternary operator because useEffect is async, so it happens after the data object is created
  //that means if we just do "name: location.state.name", it will say location.state is null because useEffect's navigate did not run yet

  useEffect(() => {
    getData();
  }, []);

  //NOTE: when not hosting on heroku, we can remove the heroku string on line 50, remember to change the back end route too
  //we need app.get('/heroku') for heroku because it needs to use the app.get('/') route in the back end 
  function getData() {
    axios
      .get(server+'heroku') //calls app.get(/) in app.mjs in back end
      .then(res => { //res.data is posts in app.get().then(posts) in app.mjs in back end
        setPosts(res.data); //update model for page to re-render
        setPostsFiltered(res.data); //remember to update postsFiltered
      })
      .catch(err => console.log(err));     
  }

  function add(e) {
    e.preventDefault();
    if (text.length === 0) {
      setStatus('Empty Input');
      return;
    }
    axios
      .post(server, data) //calls app.post(/) in app.mjs in back end
      .then(res => { //res.data is post in app.post().then(post) in app.mjs in back end
        const newPost = res.data; //*
        const postsUpdated = [...posts, newPost]; 
        setPosts(postsUpdated); //update model for page to re-render
        setPostsFiltered(postsUpdated); //remember to update postsFiltered
        //* why do we use res.data instead of data?
        //data is from the client, so it does NOT contain the mongo generated id 
        //we need the mongo id for edit and delete to work
        //by using data, edit and delete will NOT work
        //res.data is from the server, so it contains the mongo generated id :D
        //by using res.data, edit and delete will work :D
      })
      .catch(err => console.log(err));
    resetSort(); //reset the sort (re-render the dropdown) so the new post appears at the bottom
    resetSearch(); //reset the search (re-render the text in the search bar)
  }

  function remove(id) {
    axios
    .delete(server+id) //calls app.delete(/) in app.mjs in back end
      .then(res => { //res.data is post in app.delete().then(post) in app.mjs in back end
        //commented block is another way to update model with res
        // const postRemoved = res.data;
        // const index = posts.indexOf(postRemoved);
        // const postsUpdated = posts.splice(index, 1);
        const postsUpdated = posts.filter(function(x) { return x._id !== id; });
        setPosts(postsUpdated); //update model for page to re-render
        setPostsFiltered(postsUpdated); //remember to update postsFiltered
      })
      .catch(err => console.log(err));
    resetSort(); //reset the sort (re-render the dropdown) for consistency with the add function
    resetSearch(); //reset the search (re-render the text in the search bar)
  }

  function handleTextChange(e) {
    setText(e.target.value);
  }

  function handleSearchChange(e) {
    setSearch(e.target.value);
    const query = e.target.value;
    //because setSearch is async, we cannot rely on search being updated in time from setSearch, so we need "query"
    //we still have to use setSearch to allow the user to type into the text box
    const result = posts.filter((post) => {
      return post.text.includes(query);
    });
    setPostsFiltered(result);
    //we filter on posts using posts.filter and then store the result into postsFiltered
    //note that posts is never mutated, most important part (we never do const posts = posts.filter or setPosts)
    //if we filter on posts without a copy, thats just delete (look at how the remove function uses filter)
  }

  function handleSelect(e) {
    setSelect(e.target.value); //we don't use the value anywhere, it's just used to re-render the dropdown
    const postsReversed = posts.reverse(); //works because posts are ordered from old to new by default
    //if we want to directly compare the timestamps of the posts, we have to store them as unix time
    setPosts(postsReversed);
    setPostsFiltered(postsReversed);
    handleSearchChange({target: {value: search}});
    //call handleSearchChange to make sure the sort is updated with the search query, otherwise the sort will override the search query
    //we have to pass an object with target and value because handleSearchChange uses e.target.value
  }

  //even though the next 3 functions are so short, it is better to store them 
  //as functions with informative names so we know what is happening when they appear in other parts of the code

  function resetSort() {
    if (select === 'new') {
      handleSelect({target: {value: 'old'}}); //must pass an object because handleSelect uses e.target.value
    }
  }

  function resetSearch() {
    handleSearchChange({target: {value: ''}}); //must pass an object because handleSearchChange uses e.target.value
  }

  function logout() {
    navigate('login');
  }

  return (
    <div className="posts">
    <div className="loggedin">Logged In As: {data.name}</div>
    <input className="logout" type="button" value="Logout" onClick={logout}/><br/><br/>
    <div>Search Posts:</div>
    <input type="text" placeholder="Search here" onChange={handleSearchChange} value={search}></input><br/>
    <select value={select} onChange={handleSelect}>
      <option value="old">Sort Old To New</option>
      <option value="new">Sort New To Old</option>
    </select><br/><br/>
    <form onSubmit={add}>
      <div>Enter Post:</div>
      <textarea onChange={handleTextChange} value={text} rows="5" cols="20" required></textarea>
      <br/><input type="submit"></input><span className="status">{status}</span>
    </form>
    <br/>
    {postsFiltered.map((post, i) => {
      return (
        <Post key={i} post={post} remove={remove} server={server} data={data} admin={admin}/>
      );
    })}
    {/* below is the old rendering when we did not iterate in Posts.js so we had to iterate in Post.js */}
    {/* now that we iterate in Posts.js, we do not need to iterate in Post.js */}
    {/* <Post posts={postsFiltered} remove={remove} server={server} data={data} admin={admin}/> */}
    </div>
  );
}

//the status (error message) on line 158 will never appear because we have the required tag on line 157
//if we want the custom status (error message) to appear, simply remove the required tag on line 157
//compare this to the form in Login.js where the required tag doesn't do anything because it is not connected to the form (the form does not call a function) 

export default Posts;