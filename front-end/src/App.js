import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';

import Posts from './components/Posts';
import Login from './components/Login';

function App() {
  return (
    <Router>
      <Routes>
        <Route path='/' element={<Posts/>} />
        <Route path='/login' element={<Login/>} />
      </Routes>
    </Router>
  );
}

// export const server = 'http://localhost:4000/';
export const server = 'https://dl4422.herokuapp.com/'; //heroku only

export default App;