import React,{Fragment,useState} from 'react';
import MovieDetail from './components/MovieDetail';
import {Routes, Route, BrowserRouter} from 'react-router-dom';
import Home from './components/Home';

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
          <Route exact path="/" element={<Home/>} />
          <Route exact path="/movie" element={<MovieDetail/>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
