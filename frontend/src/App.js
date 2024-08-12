import React from 'react';
import MovieDetail from './components/MovieDetail';
import {Routes, Route, BrowserRouter} from 'react-router-dom';
import Home from './components/Home';
import Navbar from './components/Navbar';
import './bootstrap.min.css'

const App = () => {
  return (
      <BrowserRouter>
      <Navbar/>
        <Routes>
            <Route exact path="/" element={<Home/>} />
            <Route exact path="/movie" element={<MovieDetail/>} />
        </Routes>
      </BrowserRouter>
  );
}

export default App;
