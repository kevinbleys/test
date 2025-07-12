import React, { useEffect, useState } from 'react';

export default function StatsView() {
  const [stats, setStats] = useState([]);

  useEffect(() => {
    fetch('http://localhost:3001/api/stats')
      .then(res => res.json())
      .then(setStats);
  }, []);

  return (
    <div className="stats-view">
      <h2>Statistiques des Visites</h2>
      {stats.map((stat) => (
        <p key={stat.date}>
          {stat.date}: {stat.total} visites
        </p>
      ))}
    </div>
  );
}
