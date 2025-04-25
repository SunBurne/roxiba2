// src/services/rssParser.js
export class RSSParser {
    static async parseRSS(url) {
      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const xml = await response.text();
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xml, "text/xml");
        
        const items = Array.from(xmlDoc.getElementsByTagName("item"));
        return items.map(item => ({
          title: item.getElementsByTagName("title")[0]?.textContent,
          description: item.getElementsByTagName("description")[0]?.textContent,
          pubDate: item.getElementsByTagName("pubDate")[0]?.textContent,
          link: item.getElementsByTagName("link")[0]?.textContent,
          source: item.getElementsByTagName("source")[0]?.textContent,
          category: item.getElementsByTagName("category")[0]?.textContent,
          guid: item.getElementsByTagName("guid")[0]?.textContent
        }));
      } catch (error) {
        console.error(`Error parsing RSS feed ${url}:`, error);
        throw error;
      }
    }
  
    static extractArticleData(item) {
      return {
        title: item.title || 'No title',
        description: item.description || 'No description',
        pubDate: item.pubDate || new Date().toISOString(),
        link: item.link || '',
        source: item.source || 'Unknown',
        category: item.category || 'Uncategorized',
        guid: item.guid || null
      };
    }
  }