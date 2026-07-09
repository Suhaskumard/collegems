import natural from 'natural';

const Analyzer = natural.SentimentAnalyzer;
const stemmer = natural.PorterStemmer;
const analyzer = new Analyzer("English", stemmer, "afinn");
const tokenizer = new natural.WordTokenizer();

export const analyzeFeedback = (text) => {
    if (!text || typeof text !== 'string') {
        return { sentiment: 'Neutral', score: 0, keyPhrases: [], isUrgent: false };
    }

    // 1. Tokenize and calculate sentiment
    const tokens = tokenizer.tokenize(text);
    const score = analyzer.getSentiment(tokens);

    let sentiment = 'Neutral';
    if (score > 0.15) sentiment = 'Positive';
    else if (score < -0.15) sentiment = 'Negative';

    // 2. Extract Actionable Keywords (ignore "the", "and", etc.)
    const stopWords = natural.stopwords;
    const cleanTokens = tokens
        .map(word => word.toLowerCase())
        .filter(word => !stopWords.includes(word) && word.length > 2);
    
    // Get up to 5 unique keywords
    const keyPhrases = [...new Set(cleanTokens)].slice(0, 5);

    // 3. ✨ UNIQUE ENHANCEMENT: Urgency Detection ✨
    // Flag as urgent if it's very negative OR contains critical keywords
    const criticalWords = ['bad', 'worst', 'broken', 'shortage', 'terrible', 'urgent', 'harassment', 'fail', 'issue'];
    const containsCriticalWord = keyPhrases.some(word => criticalWords.includes(word));
    
    const isUrgent = (sentiment === 'Negative' && score <= -0.4) || containsCriticalWord;

    return {
        sentiment,
        score: Number(score.toFixed(2)),
        keyPhrases,
        isUrgent
    };
};