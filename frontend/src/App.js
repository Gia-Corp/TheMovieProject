import React,{Fragment,useState} from 'react';
import MovieDetail from './components/MovieDetail';
import {Routes, Route, BrowserRouter} from 'react-router-dom';

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
          <Route exact path="/" element={<div>holi</div>} />
          <Route exact path="/movie" element={<MovieDetail/>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
