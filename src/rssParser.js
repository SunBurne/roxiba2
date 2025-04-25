import axios from 'axios';
import { rssSources } from '../config/rssSources';

export class RssParser {
  static async fetchFeed(url) {
    try {
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching ${url}:`, error);
      return null;
    }
  }

  static async parseFeeds() {
    const allArticles = [];
    
    for (const source of rssSources) {
      for (const feed of source.feeds) {
        const feedData = await this.fetchFeed(feed);
        if (feedData) {
          const parser = new DOMParser();
          const doc = parser.parseFromString(feedData, 'text/xml');
          const items = doc.getElementsByTagName('item');
          
          for (let i = 0; i < items.length; i++) {
            const item = items[i];
            const article = {
              source: source.name,
              title: item.getElementsByTagName('title')[0]?.textContent,
              link: item.getElementsByTagName('link')[0]?.textContent,
              pubDate: item.getElementsByTagName('pubDate')[0]?.textContent,
              description: item.getElementsByTagName('description')[0]?.textContent,
              category: source.category
            };
            allArticles.push(article);
          }
        }
      }
    }
    
    return allArticles;
  }
}