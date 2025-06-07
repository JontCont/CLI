import React, { useState } from 'react';
import logo from './logo.svg';
import './App.css';

function App() {
  const [url, setUrl] = useState('');
  const [token, setToken] = useState('');
  const [user, setUser] = useState(null);

  const handleSubmit = async () => {
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      setUser(data);
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <h1>Welcome to the Homepage</h1>
        {!user ? (
          <div>
            <input
              type="text"
              placeholder="Enter URL"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
            <input
              type="text"
              placeholder="Enter Token"
              value={token}
              onChange={(e) => setToken(e.target.value)}
            />
            <button onClick={handleSubmit}>Submit</button>
          </div>
        ) : (
          <div>
            <h2>Welcome, {user.name}</h2>
          </div>
        )}
      </header>
    </div>
  );
}

export default App;
