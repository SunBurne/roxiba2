// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import SourcesTable from './components/SourcesTable';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <nav>
          <ul>
            <li>
              <Link to="/sources">Sources</Link>
            </li>
            <li>
              <Link to="/articles">Articles</Link>
            </li>
            <li>
              <Link to="/statistics">Statistics</Link>
            </li>
          </ul>
        </nav>

        <Routes>
          <Route path="/sources" element={<SourcesTable />} />
          {/* Add other routes here */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;