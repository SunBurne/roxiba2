// src/services/dataProcessor.js
export class DataProcessor {
  static enrichArticles(articles) {
    return articles.map(article => ({
      ...article,
      isCrimeRelated: this.checkCrimeContent(article.title || ''),
      sentimentScore: this.calculateSentiment(article.description || ''),
      wordCount: this.countWords(article.description || '')
    }));
  }

  static checkCrimeContent(text) {
    const crimeKeywords = [
      'mord', 'dödsskjutning', 'överfall', 'rån', 'våldtäkt',
      'nedslag', 'brottslighet', 'kriminalitet', 'polis', 'utredning'
    ];

    return crimeKeywords.some(keyword => 
      text.toLowerCase().includes(keyword)
    );
  }

  static calculateSentiment(text) {
    // Simple sentiment analysis
    const positiveWords = ['lycklig', 'bra', 'god', 'positiv'];
    const negativeWords = ['död', 'skadad', 'skadade', 'skadat'];
    
    const words = text.toLowerCase().split(/\s+/);
    const positiveCount = words.filter(word => positiveWords.includes(word)).length;
    const negativeCount = words.filter(word => negativeWords.includes(word)).length;
    
    return (positiveCount - negativeCount) / (positiveCount + negativeCount + 1);
  }

  static countWords(text) {
    return text.trim().split(/\s+/).length;
  }
}