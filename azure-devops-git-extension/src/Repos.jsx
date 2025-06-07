import React, { useState, useEffect } from 'react';

function Repos({ token }) {
  const [repos, setRepos] = useState([]);

  useEffect(() => {
    const fetchRepos = async () => {
      try {
        const response = await fetch('https://api.github.com/user/repos', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();
        setRepos(data);
      } catch (error) {
        console.error('Failed to fetch repositories:', error);
      }
    };

    fetchRepos();
  }, [token]);

  return (
    <div>
      <h1>Your Repositories</h1>
      <ul>
        {repos.map((repo) => (
          <li key={repo.id}>{repo.name}</li>
        ))}
      </ul>
    </div>
  );
}

export default Repos;
