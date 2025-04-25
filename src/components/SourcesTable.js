import React, { useState, useEffect } from 'react';
import SOURCES from '../data/sources';

const SourcesTable = () => {
  const [sources, setSources] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [feedData, setFeedData] = useState({});
  const [sortType, setSortType] = useState('none');
  const [showArticles, setShowArticles] = useState(false);

  // Process feed URL to determine type
  const getFeedType = (url) => {
    if (url.includes('.xml')) return 'xml';
    if (url.includes('.rss')) return 'rss';
    if (url.startsWith('https://')) return 'https';
    return 'no-extension';
  };

  // Generate proper filename
  const getProperFilename = (source) => {
    const safeName = source.Source.replace(/[^a-zA-Z0-9]/g, '_');
    return `${safeName}.xml`;
  };

  // Fetch Functions
  const fetchWithFallback = async (url) => {
    try {
      const response = await fetch(`http://localhost:3001/api/rss?url=${encodeURIComponent(url)}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response;
    } catch (error) {
      console.error("Fetch failed:", error);
      throw error;
    }
  };

  // Process and store feed data
  const processFeedData = async (url, sourceName) => {
    try {
      const response = await fetchWithFallback(url);
      const contentType = response.headers.get('content-type');
      
      let data;
      if (contentType && contentType.includes('xml')) {
        const text = await response.text();
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(text, 'text/xml');
        
        if (xmlDoc.getElementsByTagName("parsererror").length > 0) {
          throw new Error('Error parsing XML feed');
        }

        data = {
          type: 'xml',
          content: text,
          parsed: xmlDoc,
          items: Array.from(xmlDoc.querySelectorAll('item')).map(item => ({
            title: item.querySelector('title')?.textContent || 'No title',
            link: item.querySelector('link')?.textContent || '',
            description: item.querySelector('description')?.textContent || ''
          }))
        };
      } else {
        const blob = await response.blob();
        data = {
          type: 'download',
          content: blob,
          filename: getProperFilename({ Source: sourceName })
        };
      }

      setFeedData(prev => ({
        ...prev,
        [url]: data
      }));

      return data;
    } catch (error) {
      console.error(`Error processing feed ${url}:`, error);
      setFeedData(prev => ({
        ...prev,
        [url]: {
          error: true,
          message: error.message
        }
      }));
      throw error;
    }
  };

    // Handle feed interaction
    const handleFeedAction = async (source) => {
        try {
          const feedType = getFeedType(source.URL);
          let data = feedData[source.URL];
          
          if (!data) {
            data = await processFeedData(source.URL, source.Source);
          }
    
          if (feedType === 'https' || feedType === 'xml' || feedType === 'rss') {
            window.open(source.URL, '_blank');
            alert(`${source.Source} feed processed and opened in new tab`);
          } else {
            const blob = new Blob([data.content], { type: 'text/xml' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = getProperFilename(source);
            document.body.appendChild(a);
            a.click();
            setTimeout(() => {
              URL.revokeObjectURL(url);
              a.remove();
            }, 100);
            alert(`${source.Source} downloaded as ${a.download}`);
          }
        } catch (error) {
          alert(`Error processing ${source.Source}: ${error.message}`);
        }
      };
    
      // Sort sources
      const sortSources = (type) => {
        setSortType(type);
        setSources(prev => {
          const sorted = [...prev];
          sorted.sort((a, b) => {
            if (type === 'type') {
              const typeA = getFeedType(a.URL);
              const typeB = getFeedType(b.URL);
              return typeA.localeCompare(typeB);
            }
            return a.Source.localeCompare(b.Source);
          });
          return sorted;
        });
      };
    
      // Check if content is crime-related
      const isCrimeRelated = (item) => {
        const keywords = [
          'crime', 'police', 'arrest', 'assault', 'theft', 'murder', 'våld', 'polis', 'brott', 'misshandel', 'stöld', 'mord',
          'misshandel', 'grov misshandel', 'knivbrott', 'skottlossning',
          'inbrott', 'bilstöld', 'cykelstöld', 'stöldanmälan',
          'bedrägeri', 'nätbedrägeri', 'identitetsstöld', 'fakturabedrägeri',
          'narkotikabrott', 'knarklangning', 'drogbeslag', 'ecstasybeslag',
          'straffutmätning', 'vittnesmål', 'häktningsförhandling', 'probation'
        ];
        
        const text = `${item.title} ${item.description}`.toLowerCase();
        return keywords.some(keyword => text.includes(keyword));
      };
    
      useEffect(() => {
        const initialize = async () => {
          setIsLoading(true);
          setError(null);
          try {
            const withTypes = SOURCES.map(source => ({
              ...source,
              type: getFeedType(source.URL),
              id: Math.random().toString(36).substr(2, 9)
            }));
            setSources(withTypes);
    
            // Pre-process all feeds
            await Promise.all(
              withTypes.map(source =>
                processFeedData(source.URL, source.Source)
                  .catch(error => {
                    console.error(`Initial load failed for ${source.URL}:`, error);
                    return { url: source.URL, error: true, message: error.message };
                  })
              )
            );
          } catch (error) {
            setError(error.message);
          } finally {
            setIsLoading(false);
          }
        };
    
        initialize();
      }, []);
    
      if (isLoading) return <div>Loading sources...</div>;
      if (error) return <div>Error loading sources: {error}</div>;
    
      return (
        <div className="sources-table">
          <h2>News Sources</h2>
    
          <div className="controls">
            <button onClick={() => sortSources('type')}>Sort by Type</button>
            <button onClick={() => sortSources('name')}>Sort by Name</button>
          </div>
    
          <table>
            <thead>
              <tr>
                <th>Category</th>
                <th>Source</th>
                <th>Type</th>
                <th>URL</th>
                <th>Actions</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {sources.map((source) => {
                const data = feedData[source.URL];
                const hasError = data?.error;
    
                return (
                  <tr key={source.id} className={hasError ? 'error-row' : ''}>
                    <td>{source.Category}</td>
                    <td>{source.Source}</td>
                    <td>{source.type}</td>
                    <td>
                      <a
                        href={source.URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => {
                          e.preventDefault();
                          handleFeedAction(source);
                        }}
                      >
                        {source.URL}
                      </a>
                    </td>
                    <td>
                      <button
                        onClick={() => handleFeedAction(source)}
                        disabled={hasError}
                      >
                        {source.type === 'no-extension' ? 'Download' : 'View'}
                      </button>
                    </td>
                    <td>
                      {hasError ? (
                        <span className="error-message">Failed to load</span>
                      ) : data ? (
                        data.type === 'xml' ? (
                          `Loaded ${data.items.length} items`
                        ) : 'Download ready'
                      ) : 'Not processed'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
    
          <div className="articles-toggle">
            <button 
              onClick={() => setShowArticles(!showArticles)}
              className="articles-button"
            >
              {showArticles ? 'Hide Articles' : 'Show Articles'}
            </button>
          </div>
    
          {showArticles && (
            <div className="feed-preview">
              <h3>Feed Data Preview (Crime Related Only)</h3>
              {Object.entries(feedData).map(([url, data]) => (
                !data.error && data.type === 'xml' && (
                  <div key={url} className="feed-preview-item">
                    <h4>{sources.find(s => s.URL === url)?.Source}</h4>
                    <ul>
                      {data.items
                        .filter(item => isCrimeRelated(item))
                        .slice(0, 3)
                        .map((item, i) => (
                          <li key={i}>
                            <strong>{item.title}</strong>:
                            {item.description?.substring(0, 50) || 'No description'}...
                          </li>
                        ))}
                    </ul>
                  </div>
                )
              ))}
            </div>
          )}
        </div>
      );
    };
    
    export default SourcesTable;