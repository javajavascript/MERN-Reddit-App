import React, { useState, useEffect } from 'react';
import axios from 'axios';

function EditButton(props) {
  const [show, setShow] = useState(false);
  const [text, setText] = useState(props.text);

  //this is necessary for "text" to update
  //otherwise, it will not match the value of "props.text"
  //without this, any posts that display the edit button will break during filter and delete
  //display the edit button means you have to be the creator of that post
  useEffect(() => {
    setText(props.text);
  }, [props.text]);

  function toggleShow() {
    setShow(!show);
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
      .catch(err => {console.log(err);});
  }
  //why is edit here instead of in the same file as add and delete?
  //by putting edit here, we avoid 2 things
  //1 - we don't have to pass setState down from the parent component to update the text
  //2 - we don't have to pass text up to the parent component to call setState to update the text
  //moreover, add and delete need access to the posts to update the view/model, so it has to be in the same file as the posts
  //edit updates a property of the posts (text), not the posts themselves (it is not directly updating the array of posts)
  //so, it only needs access to the property (text) and does not need access to the posts
  //so, it does not have to be in the same file as the posts

  return (
    <div>
      {show || <div><span>{text}</span><br/></div>}
      {show || <input type="button" value="Edit" onClick={() => toggleShow(props.id)}/>}
      {show && <input type="text" value={text} onChange={handleChange}/>}
      {show && <input type="button" value="Confirm Edit" onClick={() => {edit(props.id); toggleShow(props.id);}}/>}
      {show && <input type="button" value="Cancel" onClick={() => {toggleShow(props.id);}}/>}
    </div>
  );
};

export default EditButton;