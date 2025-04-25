// src/components/Home.js
import React, { useState, useEffect } from 'react';
import { Database } from '../services/database';

export default function Home() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const result = await Database.getArticles();
        setArticles(result.articles);
      } catch (error) {
        console.error('Error fetching articles:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, []);

  if (loading) {
    return <div>Loading articles...</div>;
  }

  return (
    <div className="home-container">
      <h1>Latest Crime News</h1>
      <div className="articles-grid">
        {articles.map(article => (
          <div key={article.id} className="article-card">
            <h3>{article.title}</h3>
            <p>{article.description}</p>
            <p className="source">Source: {article.source}</p>
            <p className="timestamp">{new Date(article.timestamp).toLocaleString()}</p>
          </div>
        ))}
      </div>
    </div>
  );
}