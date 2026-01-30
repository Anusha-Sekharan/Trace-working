import random
import ollama
import json

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

def generate_mock_candidates(skill, location, count=3):
    """
    Generates realistic mock candidates using local LLM when external APIs fail.
    """
    prompt = f"""
    Generate {count} realistic developer profiles for a {skill} expert based in {location}.
    Return ONLY a JSON array. Each object must have:
    - id: random integer
    - name: realistic name
    - role: e.g. "Senior {skill} Engineer"
    - bio: short professional tagline (max 10 words)
    - skills: list of 3-5 relevant skills
    - experience: e.g. "4 years"
    - location: "{location}"
    - image: "https://api.dicebear.com/7.x/avataaars/svg?seed=" + name
    - score: integer between 75 and 98
    - verified: boolean (true)
    
    JSON format only. No markdown.
    """
    
    try:
        response = ollama.chat(model='llama3.2:3b', messages=[
            {'role': 'user', 'content': prompt},
        ])
        
        content = response['message']['content']
        # Clean potential markdown code blocks
        content = content.replace("```json", "").replace("```", "").strip()
        
        candidates = json.loads(content)
        return candidates
    except Exception as e:
        print(f"LLM Generation Failed: {e}")
        # Fallback static data if LLM explodes
        return [
             {
                "id": 9991, 
                "name": "AI Generated Dev", 
                "role": f"{skill} Specialist",
                "bio": f"Expert in {skill} based in {location}",
                "location": location,
                "skills": [skill, "System Design", "Cloud"],
                "score": 85,
                "verified": True,
                "image": f"https://api.dicebear.com/7.x/avataaars/svg?seed=AI"
            }
        ]

from integrations import search_candidates

async def chat_with_assistant(history):
    """
    Chat with the AI assistant using Ollama.
    Supports tool calling for search.
    """
    system_prompt = """
    You are Trace, an expert AI Talent Acquisition Assistant.
    
    TOOL USE:
    If the user asks to find, search, or look for candidates/people, you MUST reply with exactly:
    SEARCH: <search_terms>
    
    Example:
    User: "Find me a React developer in London"
    You: SEARCH: React developer London
    
    For other queries, just answer helpfuly.
    Keep responses concise.
    """
    
    messages = [{'role': 'system', 'content': system_prompt}] + history
    
    try:
        # Use sync client for now as python-ollama is sync, wrap if needed but blocking is fine for local
        response = ollama.chat(model='llama3.2:3b', messages=messages)
        content = response['message']['content'].strip()
        
        if content.startswith("SEARCH:"):
            query = content.replace("SEARCH:", "").strip()
            # Perform the search
            candidates = await search_candidates(query)
            
            return {
                "type": "search_results",
                "content": f"I've found top candidates for '{query}'.",
                "data": candidates
            }
        else:
            return {
                "type": "text",
                "content": content,
                "data": None
            }
            
    except Exception as e:
        print(f"Chat Error: {e}")
        return {
            "type": "text",
            "content": "I'm having trouble connecting to my brain right now.",
            "data": None
        }
