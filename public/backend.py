from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import requests
from bs4 import BeautifulSoup
import nltk
from nltk.tokenize import word_tokenize
from nltk.corpus import stopwords
from nltk.stem import WordNetLemmatizer
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import re
from typing import Optional, List

# Download required NLTK data
nltk.download('punkt')
nltk.download('stopwords')
nltk.download('wordnet')

app = FastAPI()

class AnalyzeRequest(BaseModel):
    url: str
    task: str
    whitelist: Optional[List[str]] = []
    blacklist: Optional[List[str]] = []

class AnalyzeResponse(BaseModel):
    is_relevant: bool
    confidence_score: float
    reason: str

def preprocess_text(text: str) -> str:
    """
    Preprocess text by removing special characters, converting to lowercase,
    removing stopwords, and lemmatizing
    """
    # Convert to lowercase and remove special characters
    text = re.sub(r'[^\w\s]', '', text.lower())
    
    # Tokenize
    tokens = word_tokenize(text)
    
    # Remove stopwords
    stop_words = set(stopwords.words('english'))
    tokens = [token for token in tokens if token not in stop_words]
    
    # Lemmatize
    lemmatizer = WordNetLemmatizer()
    tokens = [lemmatizer.lemmatize(token) for token in tokens]
    
    return ' '.join(tokens)

def check_url_patterns(url: str, whitelist: List[str], blacklist: List[str]) -> Optional[bool]:
    """
    Check if URL matches any whitelist or blacklist patterns
    Returns: 
        - True if whitelisted
        - False if blacklisted
        - None if no match
    """
    # Check whitelist
    for pattern in whitelist:
        if pattern in url:
            return True
    
    # Check blacklist
    for pattern in blacklist:
        if pattern in url:
            return False
    
    return None

def extract_webpage_content(url: str) -> str:
    """Extract main content from webpage"""
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        response = requests.get(url, headers=headers, timeout=5)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # Remove script and style elements
        for script in soup(["script", "style"]):
            script.decompose()
        
        # Get text content
        text = soup.get_text()
        
        # Remove extra whitespace
        lines = (line.strip() for line in text.splitlines())
        chunks = (phrase.strip() for line in lines for phrase in line.split("  "))
        text = ' '.join(chunk for chunk in chunks if chunk)
        
        return text
    
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to fetch webpage content: {str(e)}")

def calculate_relevance(task_text: str, page_text: str) -> tuple[float, str]:
    """Calculate relevance score between task and webpage content"""
    # Preprocess both texts
    task_processed = preprocess_text(task_text)
    page_processed = preprocess_text(page_text)
    
    # Create TF-IDF vectors
    vectorizer = TfidfVectorizer()
    tfidf_matrix = vectorizer.fit_transform([task_processed, page_processed])
    
    # Calculate cosine similarity
    similarity = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])[0][0]
    
    # Generate reason based on similarity score
    if similarity >= 0.3:
        reason = "Content appears to be related to your task"
    elif similarity >= 0.1:
        reason = "Content has some relevance to your task, but might be tangential"
    else:
        reason = "Content appears unrelated to your task"
    
    return similarity, reason

@app.post("/analyze", response_model=AnalyzeResponse)
async def analyze_webpage(request: AnalyzeRequest):
    """
    Analyze if a webpage is relevant to the given task
    """
    # First check whitelist/blacklist
    pattern_check = check_url_patterns(request.url, request.whitelist, request.blacklist)
    if pattern_check is not None:
        return AnalyzeResponse(
            is_relevant=pattern_check,
            confidence_score=1.0,
            reason="URL matches whitelist/blacklist pattern"
        )
    
    # Extract content from webpage
    page_content = extract_webpage_content(request.url)
    
    # Calculate relevance
    similarity_score, reason = calculate_relevance(request.task, page_content)
    
    # Determine if page is relevant (using 0.1 as threshold)
    is_relevant = similarity_score >= 0.1
    
    return AnalyzeResponse(
        is_relevant=is_relevant,
        confidence_score=float(similarity_score),
        reason=reason
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

    