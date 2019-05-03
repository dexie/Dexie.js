import React from 'react';
import ReactDOM from 'react-dom';
import {App} from './App';
import './index.css';

// Uncomment this when ReactDOM.createRoot() is publicly available.
// It will enable concurrent rendering.
//ReactDOM.createRoot(document.getElementById('root')).render(<App />);

ReactDOM.render(
  <App />,
  document.getElementById('root')
);

