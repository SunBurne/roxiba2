// src/services/dataScheduler.js
import { RSSParser } from './rssParser';
import { Database } from './database';

const RSS_SOURCES = [
  {
    name: 'Aftonbladet',
    feeds: [
      'https://www.aftonbladet.se/rss.xml',
      'https://www.aftonbladet.se/rss/politik.xml'
    ]
  },
  {
    name: 'Expressen',
    feeds: [
      'https://www.expressen.se/rss.xml',
      'https://www.expressen.se/rss/politik.xml'
    ]
  },
  {
    name: 'Svenska Dagbladet',
    feeds: [
      'https://www.svd.se/?service=rss',
      'https://www.svd.se/politik/?service=rss'
    ]
  }
];

export class DataScheduler {
  static async initialize() {
    try {
      console.log('Initializing data collection...');
      await Database.initialize();
      this.startCollection();
    } catch (error) {
      console.error('Failed to initialize data collection:', error);
      throw error;
    }
  }

  static startCollection() {
    // Initial collection
    this.collectData();

    // Schedule collection every 15 minutes
    setInterval(() => {
      this.collectData();
    }, 15 * 60 * 1000);
  }

  static async collectData() {
    try {
      console.log('Starting data collection...');

      for (const source of RSS_SOURCES) {
        for (const feed of source.feeds) {
          try {
            console.log(`Processing feed: ${feed}`);
            const items = await RSSParser.parseRSS(feed);
            
            for (const item of items) {
              const article = RSSParser.extractArticleData(item);
              await Database.saveArticle(article);
            }
          } catch (feedError) {
            console.error(`Error processing feed ${feed}:`, feedError);
            // Continue with next feed even if one fails
          }
        }
      }

      console.log('Data collection completed successfully');
    } catch (error) {
      console.error('Error during data collection:', error);
      // Don't throw here to prevent stopping the scheduler
    }
  }
}