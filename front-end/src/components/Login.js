import React, { useState } from 'react';
import '../App.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { server } from '../App.js';
import './Components.css';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState('');
  const navigate = useNavigate();

  //the keys in data must match the mongoose schema keys
  //the values come from the state variables at the top of this function
  const data = {
    username: username,
    password: password,
  };

  //necessary for user to type in textbox
  function handleChangeUsername(e) { 
    setUsername(e.target.value);
  }

  //necessary for user to type in textbox
  function handleChangePassword(e) {
    setPassword(e.target.value);
  }

  function handleContinueGuest() {
    navigate('/', {state: {name: 'Guest'}});
  }

  function handleRegister(e) {
    e.preventDefault();
    const route = 'register';
    if (username.length === 0 || password.length === 0) {
      setStatus('Register Failed, Empty Input');
      return; //client side validation, don't contact server if input is invalid
    }
    axios
      .post(server+route, data) 
      .then(res => { //res.data is user in app.post('/register')...then(post) in app.mjs in back end
        if (res.data) {
          navigate('/', {state: {name: res.data.username}});
        }
        else { //res.data === null
          setStatus('Register Failed, Username Already Exists');
        }
      })
      .catch(err => console.log(err));
  }

  function handleLogin(e) {
    e.preventDefault();
    const route = 'login';
    if (username.length === 0 || password.length === 0) {
      setStatus('Login Failed, Empty Input');
      return; //client side validation, don't contact server if input is invalid
    }
    axios
      .post(server+route, data) 
      .then(res => { //res.data is user in app.post('/login')...then(post) in app.mjs in back end
        if (res.data) {
          navigate('/', {state: {name: res.data.username}});
        }
        else { //res.data === null
          setStatus('Login Failed');
        }
      })
      .catch(err => console.log(err));
  }

  return(
    <div className="login">
    {/* <form onSubmit={handleSubmit}> */}
    <form>  
      <label>Username:</label><br/>
      <input type="text" onChange={handleChangeUsername} value={username} required></input><br/>
      <label>Password:</label><br/>
      <input type="text" onChange={handleChangePassword} value={password} required></input><br/>
      <button type="submit" onClick={handleRegister}>Register</button><br/>
      <button type="submit" onClick={handleLogin}>Login</button><br/>
    </form>
    <span className="status">{status}</span><br/><hr/><br/>
    <button type="Guest" id="continueAsGuest" onClick={handleContinueGuest}>Continue As Guest</button>
    </div>
  );
}

//the required tags on line 80 and 82 don't do anything because it is not connected to the form (the form does not call a function, the button does)
//because of this, we use custom a status (error message) on line 86, which is good because it much more customizable
//compare this to the form in Posts.js where the required tag works because that form calls a function 

export default Login;