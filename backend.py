from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import requests
from bs4 import BeautifulSoup
import re
from typing import Optional, List
import logging
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

# Set up logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI()

# Add CORS middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins for development
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

# Your existing classes and functions remain the same
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
    Simplified text preprocessing
    """
    try:
        logger.debug(f"Starting text preprocessing. Input length: {len(text)}")
        
        # Convert to lowercase
        text = text.lower()
        
        # Remove special characters and extra whitespace
        text = re.sub(r'[^\w\s]', ' ', text)
        text = re.sub(r'\s+', ' ', text).strip()
        
        logger.debug(f"Preprocessing completed. Output length: {len(text)}")
        return text
    except Exception as e:
        logger.error(f"Error in text preprocessing: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Text preprocessing failed: {str(e)}")

def check_url_patterns(url: str, whitelist: List[str], blacklist: List[str]) -> Optional[bool]:
    """
    Check if URL matches any whitelist or blacklist patterns
    """
    try:
        # Check whitelist
        for pattern in whitelist:
            if pattern in url:
                return True
        
        # Check blacklist
        for pattern in blacklist:
            if pattern in url:
                return False
        
        return None
    except Exception as e:
        logger.error(f"Error in URL pattern checking: {str(e)}")
        return None

def extract_webpage_content(url: str) -> str:
    """
    Extract main content from webpage with error handling
    """
    try:
        logger.debug(f"Fetching content from URL: {url}")
        
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
        
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # Remove script and style elements
        for element in soup(['script', 'style', 'meta', 'link']):
            element.decompose()
        
        # Get text content
        text = soup.get_text(separator=' ', strip=True)
        
        # Clean up whitespace
        text = re.sub(r'\s+', ' ', text).strip()
        
        logger.debug(f"Successfully extracted content. Length: {len(text)}")
        return text
        
    except requests.RequestException as e:
        logger.error(f"Failed to fetch webpage: {str(e)}")
        raise HTTPException(status_code=400, detail=f"Failed to fetch webpage: {str(e)}")
    except Exception as e:
        logger.error(f"Error extracting content: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Content extraction failed: {str(e)}")

def calculate_relevance(task_text: str, page_text: str) -> tuple[float, str]:
    """
    Calculate relevance score between task and webpage content
    """
    try:
        logger.debug("Starting relevance calculation")
        
        # Preprocess texts
        task_processed = preprocess_text(task_text)
        page_processed = preprocess_text(page_text)
        
        if not task_processed or not page_processed:
            raise ValueError("Empty text after preprocessing")
        
        # Create TF-IDF vectors
        vectorizer = TfidfVectorizer(
            max_features=5000,
            stop_words='english'
        )
        
        # Fit and transform the texts
        tfidf_matrix = vectorizer.fit_transform([task_processed, page_processed])
        
        # Calculate similarity
        similarity = float(cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])[0][0])
        
        # Generate reason
        if similarity >= 0.3:
            reason = "Content appears to be related to your task"
        elif similarity >= 0.1:
            reason = "Content has some relevance to your task, but might be tangential"
        else:
            reason = "Content appears unrelated to your task"
        
        logger.debug(f"Relevance calculation completed. Score: {similarity}")
        return similarity, reason
        
    except Exception as e:
        logger.error(f"Error in relevance calculation: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Relevance calculation failed: {str(e)}")

@app.post("/analyze", response_model=AnalyzeResponse)
async def analyze_webpage(request: AnalyzeRequest):
    """
    Analyze if a webpage is relevant to the given task
    """
    try:
        logger.info(f"Processing analysis request for URL: {request.url}")
        
        # Check whitelist/blacklist
        pattern_check = check_url_patterns(request.url, request.whitelist, request.blacklist)
        if pattern_check is not None:
            return AnalyzeResponse(
                is_relevant=pattern_check,
                confidence_score=1.0,
                reason="URL matches whitelist/blacklist pattern"
            )
        
        # Extract content
        page_content = extract_webpage_content(request.url)
        
        # Calculate relevance
        similarity_score, reason = calculate_relevance(request.task, page_content)
        
        # Prepare response
        response = AnalyzeResponse(
            is_relevant=similarity_score >= 0.1,
            confidence_score=similarity_score,
            reason=reason
        )
        
        logger.info(f"Analysis completed successfully. Score: {similarity_score}")
        return response
        
    except Exception as e:
        logger.error(f"Error processing request: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health_check():
    """
    Simple health check endpoint
    """
    return {"status": "healthy"}
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend:app", host="0.0.0.0", port=8000, reload=True)
