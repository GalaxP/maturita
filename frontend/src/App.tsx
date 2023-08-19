import React from 'react';
import logo from './logo.svg';
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import './App.css';
import Home from './routes/home';
import Register from './routes/account/register'
import Login from './routes/account/login'
import { useCookies } from "react-cookie"
import AuthContext, { AuthContextProvider } from './components/shared/AuthContext';

function App() {
  return (
    <AuthContextProvider>
      <Router>
        <Routes>
          <Route path='/' element={<Home />}></Route>
          <Route path='account'>
            <Route path='register' element={<Register/> }></Route>
            <Route path='login' element={<Login/> }></Route>
          </Route>
          <Route path='*' element={<h1>404</h1>}></Route>
        </Routes>
      </Router>
    </AuthContextProvider>
  );
}

export default App;
