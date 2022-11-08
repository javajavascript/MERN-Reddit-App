import React, { useState, useEffect } from 'react';
import '../App.css';
import './Components.css';
import axios from 'axios';
// import DeleteButton from './DeleteButton.js';
// import EditButton from './EditButton.js';

function Post(props) {
  //props.data and props.post are NOT the same
  //props.data contains the current information, such as the current user and text input (which are dynamic)
  //props.post contains pre-existing information, such as the name and text on saved posts (which are static)

  //props.data.name is the name of the logged in user
  //props.post.name is the name of the user on a post
  //we compare those and only showDelete the edit/delete buttons to users who created a post
  //thus, the name of the logged in user and the name of the user on a post must match
  const [showDelete, setShowDelete] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [text, setText] = useState(props.post.text);

  //this is necessary for "text" to update
  //otherwise, it will not match the value of "props.post.text"
  //without this, any posts that display the edit button will break during filter and delete
  useEffect(() => {
    setText(props.post.text);
  }, [props.post]);

  function toggleShowEdit(boolean) {
    setShowEdit(boolean);
  }

  function toggleShowDelete(boolean) {
    setShowDelete(boolean);
  }

  function handleChange(e) {
    setText(e.target.value);
  }

  function edit(id) {
    const data = props.data;
    data.text = text;
    axios
      .put(props.server+id, data) //calls app.put(/) in app.mjs in back end
      .then(res => { //res.data is post in app.put().then(post) in app.mjs in back end
        //commented block is another way to update model with res
        // const postEdited = res.data;
        // setText(postEdited.text);
        setText(text); //update model for page to re-render
        //if we have a lot of fields to update, we can use res.data which is the updated post
        //we would need to pass the entire post from the parent component and then setPost(res.data)
      })
      .catch(err => console.log(err)); 
  }
 
  return (
    <div className="post">
      <span>{props.post._id}</span><br/>
      <strong>{props.post.name}</strong><br/>
      <span>{props.post.dateTime}</span><br/>
      {props.data.name !== props.post.name ? <span>{props.post.text}</span> : null} 
      {props.data.name === props.post.name || props.data.name === props.admin ? 
        <div>
          {showEdit || <div><span>{text}</span><br/></div>}
          {showEdit || <input type="button" value="Edit" onClick={() => toggleShowEdit(true)}/>}
          {showEdit && <input type="text" value={text} onChange={handleChange}/>}
          {showEdit && <input type="button" value="Confirm Edit" onClick={() => {edit(props.post._id); toggleShowEdit(false); toggleShowDelete(false);}}/>}
          {showEdit && <input type="button" value="Cancel" onClick={() => {toggleShowEdit(false); toggleShowDelete(false);}}/>}
        </div>
      : null}
      {props.data.name === props.post.name || props.data.name === props.admin ? 
        <div>
          {showDelete || <input type="button" value="Delete" onClick={() => toggleShowDelete(true)}/>}
          {showDelete && <input type="button" value="Confirm Delete" onClick={() => {props.remove(props.post._id); toggleShowDelete(false); toggleShowEdit(false);}}/>}
          {showDelete && <input type="button" value="Cancel" onClick={() => {toggleShowDelete(false); toggleShowEdit(false);}}/>}
        </div>
      : null}
    </div>
  );

  //why return the edit and delete button within the post instead of in their own components?
  //the conditional rendering of the edit and delete buttons are unfortunately linked
  //to see this issue, use the edit and delete components (EditButton and DeleteButton), click edit on a post, then delete that post
  //notice that the confirm edit button displays on the next post when it shouldn't display
  //this issue is easily solved by managing the state of the edit and delete components in one file
  
  //moreover, put putting the edit and delete button within the post, all the fields of the post are in one component
  //by using the edit button, the text field gets moved into a child component that contains the text field, an input to edit the text field, and the edit button
  //it is better to have the text field of the post at the same level as the other fields of the post / the post itself

  // return (
  //   <div className="post">
  //     <span>{props.post._id}</span><br/>
  //     <strong>{props.post.name}</strong><br/>
  //     <span>{props.post.dateTime}</span><br/>
  //     <span>{props.post.text}</span> 
  //     {props.data.name !== props.post.name ? <span>{props.post.text}</span> : null}
  //     {props.data.name === props.post.name || props.data.name === props.admin ? <EditButton id={props.post._id} text={props.post.text} server={props.server} data={props.data}></EditButton> : null}
  //     {props.data.name === props.post.name || props.data.name === props.admin ? <DeleteButton id={props.post._id} remove={props.remove}></DeleteButton> : null}
  //   </div>
  // );

  //below is the old rendering when we did not iterate in Posts.js so we had to iterate in Post.js
  //now that we iterate in Posts.js, we do not need to iterate in Post.js

  // return(
  //   <div>
  //     {props.posts.map((post, i) => {
  //     return (
  //       <div className="post" key={i}>
  //         <span>{post._id}</span><br/>
  //         <strong>{post.name}</strong><br/>
  //         <span>{post.dateTime}</span><br/>
  //         <span>{post.text}</span> 
  //         {props.data.name !== post.name ? <span>{post.text}</span> : null}
  //         {props.data.name === post.name ? <EditButton id={post._id} text={post.text} server={props.server} data={props.data}></EditButton> : null}
  //         {props.data.name === post.name ? <DeleteButton id={post._id} remove={props.remove}></DeleteButton> : null}
  //       </div>
  //     );
  //   })}
  //   </div>
  // );
}

export default Post;