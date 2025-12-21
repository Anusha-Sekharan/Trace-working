
import httpx
import random
import asyncio

async def fetch_github_users(query, limit=5):
    """
    Fetches users from GitHub Public API based on keywords.
    """
    url = f"https://api.github.com/search/users?q={query}&per_page={limit}"
    
    async with httpx.AsyncClient() as client:
        try:
            resp = await client.get(url, headers={"User-Agent": "TRACE-TeamFinder"})
            if resp.status_code == 200:
                data = resp.json()
                users = []
                for item in data.get("items", []):
                    # Fetch detailed user info for better display
                    user_url = item.get("url")
                    details_resp = await client.get(user_url, headers={"User-Agent": "TRACE-TeamFinder"})
                    details = details_resp.json() if details_resp.status_code == 200 else {}
                    
                    users.append({
                        "id": item.get("id"),
                        "name": details.get("name") or item.get("login"),
                        "username": item.get("login"),
                        "avatar": item.get("avatar_url"),
                        "source": "GitHub",
                        "link": item.get("html_url"),
                        "bio": details.get("bio") or "Open source contributor",
                        "public_repos": details.get("public_repos", 0),
                        "followers": details.get("followers", 0)
                    })
                return users
        except Exception as e:
            print(f"GitHub API Error: {e}")
            return []
    return []

def mock_linkedin_coursera_enrichment(base_speed=0.2):
    """
    Mocks finding partial matches on other platforms for demo purposes.
    """
    platforms = [
        {"name": "Coursera", "badge": "Certified", "color": "blue"},
        {"name": "LinkedIn", "badge": "Skill Endorsed", "color": "blue"},
        {"name": "Udemy", "badge": "Course Complete", "color": "purple"}
    ]
    
    # Randomly assign extra trust signals
    if random.random() > 0.4:
        platform = random.choice(platforms)
        return {
            "verified": True,
            "platform": platform["name"],
            "badge_text": f"{platform['badge']} - Advanced ML",
            "trust_score_boost": 15
        }
    return None

async def search_candidates(query: str):
    """
    Orchestrates the search across "multiple" APIs.
    """
    # 1. Fetch real candidates from GitHub
    github_candidates = await fetch_github_users(query, limit=6)
    
    results = []
    
    for user in github_candidates:
        # 2. Enrich with mock data from other platforms "cross-referenced"
        enrichment = mock_linkedin_coursera_enrichment()
        
        # Calculate a "TRACE Score"
        base_score = 60
        repo_boost = min(20, user['public_repos'] * 0.5)
        follower_boost = min(10, user['followers'] * 0.1)
        enrichment_boost = enrichment['trust_score_boost'] if enrichment else 0
        
        final_score = int(base_score + repo_boost + follower_boost + enrichment_boost)
        final_score = min(99, final_score) # Cap at 99
        
        candidate = {
            **user,
            "role": query.replace("engineer", "").strip().title() + " Engineer", # Dynamic role title
            "skills": [query.split()[0], "Python", "TensorFlow", "Git"], # Infer skills
            "score": final_score,
            "verified_badge": enrichment
        }
        results.append(candidate)
    
    # Sort by score descending
    results.sort(key=lambda x: x['score'], reverse=True)
    
    return results[:3] # Return top 3 as requested
