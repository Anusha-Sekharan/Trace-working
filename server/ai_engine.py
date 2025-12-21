
import random

def calculate_match_score(candidate_profile, job_requirements):
    """
    Mock AI function to calculate match score.
    Returns a score between 0-100 and a reason.
    """
    # Simple keyword matching for prototype
    matched_skills = [s for s in candidate_profile.get('skills', []) if s in job_requirements.get('skills', [])]
    base_score = len(matched_skills) * 20
    
    # Add some "AI" randomness/nuance
    ai_adjustment = random.randint(-5, 15)
    final_score = min(100, max(0, base_score + ai_adjustment))
    
    return {
        "score": final_score,
        "reason": f"Matched {len(matched_skills)} core skills. AI analysis suggests good cultural fit."
    }

def analyze_interview_response(response_text):
    """
    Mock AI analysis of interview response.
    """
    keywords = ["experience", "team", "lead", "solve", "python", "react"]
    score = sum(1 for k in keywords if k in response_text.lower())
    
    feedback = "Good technical understanding." if score > 2 else "Could be more specific."
    
    return {
        "confidence": random.uniform(0.7, 0.99),
        "sentiment": "positive",
        "feedback": feedback
    }
