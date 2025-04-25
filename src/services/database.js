// src/services/database.js
import { 
    collection, 
    addDoc, 
    query, 
    where, 
    getDocs, 
    orderBy, 
    limit, 
    doc, 
    getDoc, 
    updateDoc, 
    deleteDoc,
    Timestamp 
  } from 'firebase/firestore';
  import { db } from '../config/firebase';
  
  const ERROR_CODES = {
    INVALID_DATA: 'INVALID_DATA',
    NOT_FOUND: 'NOT_FOUND',
    INVALID_OPERATION: 'INVALID_OPERATION'
  };
  
  export class Database {
    static async initialize() {
      console.log('Firestore initialized successfully');
    }
  
    static async saveArticle(article) {
      try {
        if (!article.title || !article.source || !article.link) {
          throw new Error('Missing required fields in article');
        }
  
        const articlesRef = collection(db, 'articles');
        const docRef = await addDoc(articlesRef, {
          ...article,
          timestamp: Timestamp.now(),
          isCrimeRelated: true,
          metadata: article.metadata || {},
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        });
  
        console.log(`Article saved successfully with ID: ${docRef.id}`);
        return docRef.id;
      } catch (error) {
        console.error('Error saving article:', error);
        throw this.handleError(error, ERROR_CODES.INVALID_DATA);
      }
    }
  
    static async getArticles(filter = {}, page = 1, pageSize = 10) {
      try {
        const articlesRef = collection(db, 'articles');
        let q = query(
          articlesRef,
          where('isCrimeRelated', '==', true),
          orderBy('timestamp', 'desc')
        );
  
        // Apply additional filters
        if (filter.source) {
          q = query(q, where('source', '==', filter.source));
        }
        if (filter.category) {
          q = query(q, where('category', '==', filter.category));
        }
  
        // Add pagination
        q = query(q, limit(pageSize * page));
  
        const querySnapshot = await getDocs(q);
        const articles = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
  
        return {
          articles: articles.slice((page - 1) * pageSize),
          total: articles.length,
          page,
          pageSize
        };
      } catch (error) {
        console.error('Error fetching articles:', error);
        throw this.handleError(error, ERROR_CODES.INVALID_OPERATION);
      }
    }
  
    static async getArticleById(id) {
      try {
        const articlesRef = collection(db, 'articles');
        const docRef = doc(articlesRef, id);
        const docSnap = await getDoc(docRef);
  
        if (!docSnap.exists()) {
          throw new Error(`Article with ID ${id} not found`);
        }
  
        return {
          id: docSnap.id,
          ...docSnap.data()
        };
      } catch (error) {
        console.error('Error fetching article:', error);
        throw this.handleError(error, ERROR_CODES.NOT_FOUND);
      }
    }
  
    static async updateArticle(id, updates) {
      try {
        const articlesRef = collection(db, 'articles');
        const docRef = doc(articlesRef, id);
        
        const allowedUpdates = ['title', 'description', 'category', 'metadata'];
        const validUpdates = Object.entries(updates).reduce((acc, [key, value]) => {
          if (allowedUpdates.includes(key)) {
            acc[key] = value;
          }
          return acc;
        }, {});
  
        if (Object.keys(validUpdates).length === 0) {
          throw new Error('No valid fields to update');
        }
  
        await updateDoc(docRef, {
          ...validUpdates,
          updatedAt: Timestamp.now()
        });
  
        console.log('Article updated successfully');
        return true;
      } catch (error) {
        console.error('Error updating article:', error);
        throw this.handleError(error, ERROR_CODES.INVALID_OPERATION);
      }
    }
  
    static async deleteArticle(id) {
      try {
        const articlesRef = collection(db, 'articles');
        const docRef = doc(articlesRef, id);
        
        const docSnap = await getDoc(docRef);
        if (!docSnap.exists()) {
          throw new Error(`Article with ID ${id} not found`);
        }
  
        await deleteDoc(docRef);
        console.log('Article deleted successfully');
        return true;
      } catch (error) {
        console.error('Error deleting article:', error);
        throw this.handleError(error, ERROR_CODES.NOT_FOUND);
      }
    }
  
    static async getSources() {
      try {
        const sourcesRef = collection(db, 'sources');
        const querySnapshot = await getDocs(sourcesRef);
        return querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
      } catch (error) {
        console.error('Error fetching sources:', error);
        throw this.handleError(error, ERROR_CODES.INVALID_OPERATION);
      }
    }
  
    static async getStatistics() {
      try {
        const articlesRef = collection(db, 'articles');
        const q = query(
          articlesRef,
          where('isCrimeRelated', '==', true)
        );
  
        const querySnapshot = await getDocs(q);
        const articles = querySnapshot.docs.map(doc => doc.data());
  
        return {
          totalArticles: articles.length,
          lastUpdated: articles.length ? articles[0].timestamp : null,
          sources: articles.reduce((acc, article) => {
            if (!acc[article.source]) {
              acc[article.source] = 0;
            }
            acc[article.source]++;
            return acc;
          }, {})
        };
      } catch (error) {
        console.error('Error fetching statistics:', error);
        throw this.handleError(error, ERROR_CODES.INVALID_OPERATION);
      }
    }
  
    static handleError(error, code) {
      return {
        message: error.message,
        code: code,
        originalError: error
      };
    }
  }