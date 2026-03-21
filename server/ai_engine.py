import random
import ollama
import json
import os
from dotenv import load_dotenv
load_dotenv()
os.environ["PROTOCOL_BUFFERS_PYTHON_IMPLEMENTATION"] = "python"
import google.generativeai as genai

# Setup Gemini (User should set GOOGLE_API_KEY env var)
genai.configure(api_key=os.environ.get("GOOGLE_API_KEY", "YOUR_API_KEY"))
gemini_model = genai.GenerativeModel('gemini-1.5-flash')

async def analyze_vibe(image_data: str = None, chat_history: list = None):
    """
    Uses Gemini to analyze candidate confidence and engagement.
    """
    prompt = "Analyze this candidate's interview performance based on their chat history. Look for confidence, clarity, and engagement. Return ONLY a JSON object with 'vibe_score' (int 0-100) and 'feedback' (string)."
    
    try:
        history_text = json.dumps(chat_history) if chat_history else "No history"
        response = gemini_model.generate_content(f"{prompt}\n\nChat History: {history_text}")
        content = response.text.strip().replace("```json", "").replace("```", "")
        return json.loads(content)
    except Exception as e:
        print(f"Gemini Vibe Error: {e}")
        return {"vibe_score": 75, "feedback": "Good engagement but could show more confidence."}

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
        response = ollama.chat(model='llama3.1:8b', messages=[
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

    If the user says the previous results are not good, or asks for "next", "more", or "others", you MUST reply with exactly:
    SEARCH_NEXT: <original_search_terms>
    
    Example:
    User: "Find me a React developer in London"
    You: SEARCH: React developer London
    User: "These aren't good"
    You: SEARCH_NEXT: React developer London
    User: "Find me a React developer in London"
    You: SEARCH: React developer London
    
    For other queries, just answer helpfuly.
    Keep responses concise.
    """
    
    messages = [{'role': 'system', 'content': system_prompt}] + history
    
            
    try:
        # Use sync client for now as python-ollama is sync, wrap if needed but blocking is fine for local
        response = ollama.chat(model='llama3.1:8b', messages=messages)
        content = response['message']['content'].strip()
        
        if content.startswith("SEARCH:"):
            query = content.replace("SEARCH:", "").strip()
            # Perform the search (New Search)
            candidates = await search_candidates(query, load_more=False)
            
            return {
                "type": "search_results",
                "content": f"I've found top candidates for '{query}'.",
                "data": candidates
            }
            
        elif content.startswith("SEARCH_NEXT:"):
            query = content.replace("SEARCH_NEXT:", "").strip()
            # Perform the search (Load More)
            candidates = await search_candidates(query, load_more=True)
            
            if not candidates:
                return {
                    "type": "text",
                    "content": "I couldn't find any more candidates matching that description.",
                    "data": None
                }
            
            return {
                "type": "search_results",
                "content": "Here are some other candidates that might be a better fit.",
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

async def conduct_mock_interview(role: str, history: list[dict]):
    """
    Conducts a mock technical interview using Ollama.
    """
    system_prompt = f"""
    You are an expert Technical Interviewer for the role of '{role}'.
    Your goal is to conduct a realistic, challenging, but fair technical screening.
    
    Guidelines:
    1. Start by welcoming the candidate and asking a warm-up technical question related to {role}.
    2. Ask one question at a time. Wait for the candidate's response.
    3. Evaluate their previous answer briefly (e.g., "Good point", or "Actually, a better approach would be...").
    4. Gradually increase the difficulty of the questions.
    5. Keep your responses concise and conversational (maximum 3-4 sentences). Do not provide long explanations unless explicitly asked.
    6. If the user asks for feedback or says they are done, provide a brief summary of their performance.
    """
    
    messages = [{'role': 'system', 'content': system_prompt}] + history
    
    try:
        response = ollama.chat(model='llama3.1:8b', messages=messages)
        content = response['message']['content'].strip()
        
        return {
            "type": "text",
            "content": content,
            "data": None
        }
    except Exception as e:
        print(f"Interview Chat Error: {e}")
        return {
            "type": "text",
            "content": "I'm currently unable to conduct the interview. Please try again later.",
            "data": None
        }

async def generate_assessment_questions(role: str):
    """
    Generates 5 technical multiple choice questions for the specified role using Ollama.
    """
    prompt = f"""
    You are an expert technical interviewer. Generate exactly 5 challenging but fair technical multiple-choice interview questions for a '{role}'.
    Return ONLY a JSON array of objects, where each object has a 'question' string and an 'options' array of 4 possible answers strings.
    Example: [{{"question": "What is x?", "options": ["A", "B", "C", "D"]}}]
    No markdown formatting, just the JSON array.
    """
    try:
        response = ollama.chat(model='llama3.1:8b', messages=[{'role': 'user', 'content': prompt}])
        content = response['message']['content'].strip()
        # Clean potential markdown
        content = content.replace("```json", "").replace("```", "").strip()
        questions = json.loads(content)
        if isinstance(questions, list) and len(questions) > 0:
            return questions[:5]
        return [
            {"question": "What is your primary tech stack?", "options": ["Python/React", "Node/Vue", "Java/Angular", "Go/Svelte"]},
            {"question": "How do you handle state in frontend?", "options": ["Redux", "Context", "Zustand", "Props"]},
            {"question": "What is the best way to scale a database?", "options": ["Vertical", "Sharding", "Indexes", "Cache"]},
            {"question": "How do you secure an API?", "options": ["JWT", "Basic Auth", "No Auth", "IP Whitelist"]},
            {"question": "Which HTTP method is idempotent?", "options": ["GET", "POST", "PATCH", "CONNECT"]}
        ]
    except Exception as e:
        print(f"Error generating questions: {e}")
        return [
            {"question": "What is the core pattern here?", "options": ["MVC", "MVVM", "Singleton", "Factory"]},
            {"question": "How to resolve merge conflicts?", "options": ["Rebase", "Merge commit", "Force push", "Delete repo"]},
            {"question": "What is a closure?", "options": ["Function scope", "Block scope", "Global", "Module"]},
            {"question": "When to use WebSockets?", "options": ["Real-time", "Static files", "Batch processing", "Emails"]},
            {"question": "Best practice for passwords?", "options": ["Bcrypt", "Plain text", "MD5", "Base64"]}
        ]

async def evaluate_assessment(role: str, q_and_a: list):
    """
    Evaluates the answers to the assessment and returns a score from 0 to 100.
    q_and_a is a list of dicts: [{"question": "...", "answer": "..."}]
    """
    prompt = f"""
    You are an expert technical interviewer evaluating a candidate for the role of '{role}'.
    The candidate was asked the following multiple choice questions and selected these answers:
    {json.dumps(q_and_a, indent=2)}
    
    Evaluate if their selected answers are correct for the technical questions.
    Score the candidate on a scale of 0 to 100 based on how many they got right (e.g., 5/5 = 100, 4/5 = 80).
    Return ONLY a JSON object with a single key 'score' containing the integer score.
    Example: {{"score": 80}}
    No markdown formatting, just the JSON object.
    """
    try:
        response = ollama.chat(model='llama3.1:8b', messages=[{'role': 'user', 'content': prompt}])
        content = response['message']['content'].strip()
        content = content.replace("```json", "").replace("```", "").strip()
        result = json.loads(content)
        return int(result.get('score', 50))
    except Exception as e:
        print(f"Error evaluating assessment: {e}")
        return random.randint(50, 85)  # Fallback random score if parsing fails


import pypdf
import os

async def parse_resume_content(file_path: str):
    """
    Extracts text from PDF/DOCX and uses AI to parse skills and projects.
    """
    text = ""
    if file_path.endswith('.pdf'):
        with open(file_path, "rb") as f:
            reader = pypdf.PdfReader(f)
            for page in reader.pages:
                text += page.extract_text() + "\n"
    
    prompt = f"""
    Extract professional details from this resume text:
    {text[:4000]}  # Truncate to avoid context window issues
    
    Return ONLY a JSON object with:
    - skills: list of strings
    - projects: list of objects with "title" and "description"
    - experience_years: integer
    - suggested_role: string
    
    No markdown formatting.
    """
    
    try:
        response = ollama.chat(model='llama3.1:8b', messages=[{'role': 'user', 'content': prompt}])
        content = response['message']['content'].strip()
        content = content.replace("```json", "").replace("```", "").strip()
        return json.loads(content)
    except Exception as e:
        print(f"Resume Parsing Error: {e}")
        return {"skills": [], "projects": [], "experience_years": 0, "suggested_role": "Developer"}

async def form_team_synergy(project_description: str, candidates: list):
    """
    Selects a balanced team of 3 from a list of candidates for a project.
    """
    candidate_data = json.dumps([{
        "id": c["id"], 
        "name": c["name"], 
        "skills": c["skills"], 
        "role": c.get("role", "")
    } for c in candidates])
    
    prompt = f"""
    Given this project: "{project_description}"
    And these candidates: {candidate_data}
    
    Select the BEST 3 candidates to form a team. 
    A balanced team usually has a Lead, a Frontend specialist, and a Backend/DevOps specialist.
    
    Return ONLY a JSON object:
    {{
        "team_name": "Cool Name",
        "members": [id1, id2, id3],
        "synergy_score": 0-100,
        "reasoning": "Why this team works"
    }}
    """
    
    try:
        response = ollama.chat(model='llama3.1:8b', messages=[{'role': 'user', 'content': prompt}], format='json')
        content = response['message']['content'].strip().replace("```json", "").replace("```", "")
        return json.loads(content)
    except Exception as e:
        print(f"Team Formation Error: {e}")
        return {"team_name": "Dynamic Squad", "members": [c["id"] for c in candidates[:3]], "synergy_score": 70, "reasoning": "Fallback selection."}

async def analyze_github_repos(username: str, repos_data: list):
    """
    Analyzes GitHub repository data for code quality and complexity.
    """
    prompt = f"""
    Analyze these GitHub repositories for developer '{username}':
    {json.dumps(repos_data[:5])}
    
    Rate the developer on:
    - code_complexity: 1-10
    - documentation_quality: 1-10
    - consistency: 1-10
    - top_languages: ["Lang1", "Lang2"]
    
    Return ONLY a JSON object with these keys. No markdown.
    """
    
    try:
        response = ollama.chat(model='llama3.1:8b', messages=[{'role': 'user', 'content': prompt}])
        content = response['message']['content'].strip().replace("```json", "").replace("```", "")
        return json.loads(content)
    except Exception as e:
        print(f"GitHub Analysis Error: {e}")
        return {"code_complexity": 5, "documentation_quality": 5, "consistency": 5, "top_languages": []}

async def generate_learning_path(role: str, score: int, missed_topics: list):
    """
    Generates a personalized learning path based on assessment gaps.
    """
    prompt = f"""
    A candidate for '{role}' scored {score}/100. They struggled with: {", ".join(missed_topics)}.
    
    Create a 3-step personalized learning path.
    Return ONLY a JSON array of objects:
    [
        {{"step": "Topic Name", "resource": "Specific Link or Book", "why": "Reason"}}
    ]
    """
    try:
        response = ollama.chat(model='llama3.1:8b', messages=[{'role': 'user', 'content': prompt}])
        content = response['message']['content'].strip().replace("```json", "").replace("```", "")
        return json.loads(content)
    except:
        return [{"step": "Foundations", "resource": "MDN Web Docs", "why": "Refresh core concepts"}]
