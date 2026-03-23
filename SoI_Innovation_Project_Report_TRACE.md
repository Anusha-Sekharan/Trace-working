# SoI Innovation Project Report
## Illustrative Example Submission — TRACE

| Project title | TRACE: AI-Powered Autonomous Team Builder and Skill Verification Platform |
| :--- | :--- |
| **Team name \| Team ID** | TRACE Team \| P-2023-28-AI-00X |
| **Year \| Cohort \| Lab code(s)** | 3rd Year \| 2023–27 \| CS / AI |
| **Lead \| Members \| Mentor** | Student A \| Student B, Student C, Student D \| Mentor Y |
| **Submission date** | 2026-03-23 |
| **Outcome** | GO — validated in live student pilot; ready for controlled campus expansion |
| **Illustrative artefact links** | Evidence folder: https://example.com/trace-evidence <br> Repo: https://github.com/Anusha-Sekharan/Trace-working <br> Demo: https://example.com/trace-demo |

---

## 0. Front matter

**Abstract**
TRACE addresses a critical pain point in academic and professional tech environments: the friction of forming qualified, balanced teams for hackathons, capstones, and startups based purely on self-reported and often unreliable resumes. The project’s primary end-users are students looking for co-founders/teammates and project leads looking to assemble a squad quickly. The final solution combines a React/FastAPI stack with local LLMs (Ollama/Llama 3.1) and multimodal AI (Gemini) to validate skills via live proctored mock interviews, GitHub repository analysis, and AI resume parsing. Rather than manually searching for candidates, users enter a project description (e.g., "Build a React-Native e-commerce app"), and the Autonomous Team Builder dynamically selects the perfect combination of candidates based on proven synergy. Across the SoI pipeline, the team progressed from a simple candidate directory PoC, to an AI-enhanced prototype, to a full MVP deployed with real-time "vibe check" mock interviews and personalized learning paths. In the MVP pilot, the average time to assemble a fully-vetted 3-person team fell from a baseline of ~45 minutes (manual searching) to 1.5 minutes (N=10 sessions). The major change from prototype to MVP was the shift from static resume parsing to dynamic AI proctoring and automated team synergy selection. The recommended next step is a controlled expansion to faculty advisors for capstone team generation.

**Keywords / Index Terms**
autonomous team formation, AI skill verification, LLM-based interviewing, full-stack recruitment, sentiment analysis, personalized learning

**Document control and metadata**
- **Version**: v1.0 final illustrative example
- **Prepared by**: TRACE team
- **Last updated**: 2026-03-23
- **Project outcome**: GO
- **Primary pain metric**: Average time to identify and assemble a complementary, verified technical team.
- **Stage reached**: MVP with real-user pilot

---

## 1. Project snapshot

**Problem statement**
Project leads, students, and hackathon organizers often waste hours manually screening resumes and messaging potential teammates, only to find that self-reported skills do not match actual capabilities. This creates "dead" teams, unbalanced skillsets (e.g., three frontend devs and no backend), and frustration. The problem is most visible at the start of semesters or hackathons when students have short windows to form squads. Before any solution was designed, the team confirmed this pain point through intercept interviews at campus hackathons and a quick survey. The baseline metric used was "time-to-team": the average time needed to confidently assemble a balanced group of three validated members.

**One-line value proposition**
For students and project leads forming tech teams, TRACE autonomously evaluates actual skills via AI mock interviews and instantly generates optimal, balanced teams based on natural language project descriptions.

**Stage summary table**

| Stage | Key question answered | What was produced | Best evidence | Status |
| :--- | :--- | :--- | :--- | :--- |
| Problem & end-user | Is team assembly and skill vetting a significant pain point? | Interviews, quick survey, baseline metric | 25 intercept interviews; baseline mean 45 min to form a team | Done |
| Ideation | Which approach balances reliability, user experience, and technical feasibility? | Three concepts and selection rationale | Idea-selection matrix + MoSCoW prioritization | Done |
| PoC | Can an LLM accurately parse resumes and extract skills? | Basic Python parsing script | 85% accuracy on tech skill extraction (N=20 PDFs) | Done |
| Prototype | Can we generate teams autonomously based on a prompt? | FastAPI backend + static React UI | 90% synergy score rating by human reviewers (N=15 prompts) | Done |
| MVP | Does live AI proctoring and automated learning path generation work end-to-end? | Full PWA with webcam vibe check & AI learning paths | 1.5 min time-to-team; SUS 78; 100% successful end-to-end interview completions | Done |

---

## 2. Problem and end-user validation

**Who exactly is the end-user?**
The primary end-users are on-campus students and project leads who need to assemble balanced teams quickly. The secondary end-users are the candidates themselves, who benefit from instant, objective feedback and personalized learning paths rather than waiting weeks for human rejection emails.

**Trigger situation, baseline, and constraints**

| Item | Project-specific answer |
| :--- | :--- |
| **Trigger situation** | A student wants to build a complex project but lacks full-stack skills, needing to find and vet complementary peers. |
| **Baseline** | Average time to manually search networks, review GitHub profiles, and form a basic 3-person team was ~45 minutes. |
| **Severity** | High attrition in hackathons, unbalanced project submissions in capstone classes. |
| **Constraints** | High LLM API costs (mitigated by using local Ollama instance); privacy/PII concerns with live video (mitigated by local ephemeral processing). |
| **Success metric anchor** | Average time-to-form-team and System Usability Scale (SUS). |

**Problem evidence table**

| Evidence type | Sample size | Key insight | Implication for design |
| :--- | :--- | :--- | :--- |
| **Direct observation** | 10 hackathon teams | Teams wasted the first 2-3 hours just deciding who does what and realizing missing skills. | Must prioritize "synergy" and role-matching over just finding "smart people". |
| **Intercept interviews** | 25 students | 80% felt standard resumes don't reflect coding ability. | Must include live coding / GitHub analysis, not just resume parsing. |
| **Quick survey** | 40 responses | Students wanted feedback if rejected/assessed. | Assessment must return actionable Personalized Learning Paths. |

---

## 3. Prior work, literature, and existing solutions

**Benchmark and gap table**

| Existing solution | What it does well | Limits or gap for our context | What we learned or adopted | Implication for our design |
| :--- | :--- | :--- | :--- | :--- |
| **LinkedIn / GitHub** | Massive network, easy to find profiles. | Relies entirely on self-reporting; no concept of "team synergy". | We need GitHub data, but we must analyze quality, not just link to it. | Build a GitHub Code Quality AI analyzer. |
| **LeetCode / HackerRank** | Excellent at rigorous technical evaluation. | Highly stressful, focused on algorithms, ignores soft skills and teamwork. | Tech tests are good, but need conversational evaluation. | Build a conversational "Vibe Check" mock interview using Gemini. |
| **Manual Hackathon Matchmaking** | Human-in-the-loop ensures some cultural fit. | Extremely slow; impossible to scale. | Humans want to just type "I need a Web3 app team". | NLP-based Autonomous Team Builder endpoint. |

---

## 4. Ideation and solution selection

**Idea selection matrix**

| Idea | Desirability | Feasibility | Viability | Decision + rationale |
| :--- | :--- | :--- | :--- | :--- |
| **Tinder for Co-founders** | Fun, high engagement. | Very easy (just CRUD and swiping). | Low reliability. Doesn't solve the "fake skills" problem. | Not selected; too shallow. |
| **Timed Coding Assessment Platform** | High reliability of tech skills. | Harder to grade UI/UX and soft skills objectively. | Solves skill verification but ignores team building. | Not selected; too narrow. |
| **AI Autonomous Team Builder + Mock Interviews** | Addresses both verification (interviews) and formation (builder). | Challenging but feasible with modern LLMs (Ollama) and FastAPI. | High value for campus hubs and recruiters. | **Selected; best holistic solution.** |

**MoSCoW prioritization**
- **Must**: AI Resume Parsing, Autonomous Team Generation from prompts, Profile creation.
- **Should**: Live AI Mock Interviews, GitHub Code Analysis, Vibe/Sentiment Check via webcam.
- **Could**: Personalized Learning Paths following assessments, User Dashboards.
- **Won’t (now)**: Payroll integration, enterprise ATS syncing.

---

## 5. Solution design and implementation

**System overview**
TRACE uses a modern AI-native architecture. 
The backend is powered by **FastAPI** interacting with a local **Ollama (Llama 3.1)** instance for heavy NLP tasks (resume parsing, team synergy calculations, learning path generation) to keep costs zero. For multimodal tasks (Confidence/Vibe checking via webcam chat), it routes securely to Google's **Gemini Flash**. 
The frontend is a **React/Vite** progressive web app using `lucide-react` and `framer-motion` for a premium, responsive glass-morphism UI.

**Key design decisions**

| Decision | Alternatives considered | Why this choice was made |
| :--- | :--- | :--- |
| **Using Ollama locally** | OpenAI GPT-4 API | Academic constraints required a free, privacy-preserving approach for student data. |
| **Dedicated Team Builder Page** | Modal in Dashboard | The flow became complex enough viewing full profiles that it required a dedicated route (`/team-builder`). |
| **Inline Learning Paths** | Emailing results | Users wanted instant gratification immediately after the assessment concluded. |

**REAL vs SIMULATED matrix**

| Component / step | Real | Simulated / mocked | Notes |
| :--- | :--- | :--- | :--- |
| **UI and Authentication** | Yes | No | Google OAuth + JWT implemented. |
| **Team Synergy Engine** | Yes | No | Llama explicitly maps candidates to project needs. |
| **Webcam Vibe Check** | Yes | No | Analyzes mock interview chat logic dynamically. |
| **Scaling to 10k users** | No | Simulated | Currently operates on local SQLite and local LLM limits. |

---

## 6. Development journey across SoI stages

**Stage-wise learning table**

| Stage | Goal or hypothesis | Build / activity completed | Main learning | Gate decision |
| :--- | :--- | :--- | :--- | :--- |
| **PoC** | Can an LLM parse unstructured resumes? | Python script calling Ollama on PDFs. | Needs structured JSON output enforcement to be reliable. | Proceed |
| **Prototype** | Can we build a team from a prompt? | React UI integrated with `/api/build-team` | Simple IDs were returned, which was terrible UX. Needed full profile hydration. | Proceed |
| **MVP** | Does live AI generation reduce team-building time and provide value? | Full deployment: Interview Room, GitHub analyzer, Learning Paths. | Users loved the inline learning paths. Auto-redirects confused them (fixed in v2). | **GO** |

---

## 7. Evaluation and outcomes

**Validation hypothesis and success criteria**
We believed that students would reduce team-formation time by 80% using TRACE’s natural language team builder, while feeling that the system accurately evaluated their skills through the AI mock interviews.

**KPI table: target vs actual**

| Metric | Baseline | Target | Actual | How measured | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Average time-to-team (min)** | ~45.0 | ≤ 5.0 | 1.5 | Stopwatch timing during live usage sessions | Pass |
| **AI Assessment Accuracy** | n/a | ≥ 80% | 88% | Human review of AI-graded interview transcripts | Pass |
| **SUS score** | n/a | ≥ 70 | 78 | 10-question SUS survey after MVP use | Pass |

**Iteration log**

| Version | Change made | Why it changed |
| :--- | :--- | :--- |
| **Prototype** | Basic Dashboard | Proved technical integration. |
| **MVP v1** | Added Mock Interview & Team Builder | Validated core value proposition, but UI felt cramped. |
| **MVP v2 (Final)** | Extracted Team Builder to separate page, added inline Learning Paths, fixed Pydantic v2 bugs. | User feedback indicated they wanted instant test results without navigating away. |

---

## 8. Responsible innovation, risks, and limitations

**Responsible practice and risk log**

| Risk / concern | Mitigation / current control | Status |
| :--- | :--- | :--- |
| **AI Bias in Hiring** | LLMs can favor certain communication styles. We do not use the AI score as a hard filter, only as a sorting recommendation. | Monitored |
| **Privacy (Webcam/Audio)**| Vibe checks process data epidermally/locally where possible, no PII webcam feeds are stored on external servers. | Managed |
| **Hallucinations** | The LLM might hallucinate a fake skill. Addressed by forcing JSON schemas and cross-referencing with actual GitHub API data. | Managed |

**Limitations**
- The MVP operates via local `uvicorn` and local Ollama, limiting concurrent users heavily.
- Code execution in the interview room is currently simulated frontend text; a real Docker sandbox is needed for secure code-running.

---

## 9. Handover, continuation, and next steps

**Current-state handover summary**
The TRACE MVP v2 is fully functional on local environments. The Team Builder accurately suggests full candidate profiles. Mock Interviews generate real-time feedback and actionable 3-step learning paths. 

**Backlog for continuation or pivot**

| Priority | Next task / experiment | Why this matters next | Owner / suggested role | Est. effort |
| :--- | :--- | :--- | :--- | :--- |
| **High** | Containerize the backend and deploy to a cloud GPU instance | Needed to transition from local prototype to public pilot testing | DevOps / Systems lead | 1.5 weeks |
| **High** | Implement a secure Docker-based code execution sandbox | Allows real code compilation during AI interviews, improving evaluation accuracy | Backend lead | 2 weeks |
| **Medium** | Build a faculty-facing analytics dashboard | Helps professors monitor team formations and track student skill gaps | Full-stack lead | 1 week |
| **Medium** | Run an A/B test on Interview Room difficulty scaling | Ensures the LLM isn't too harsh or too forgiving for beginners | AI / Research lead | 3 days |
| **Low** | Expand GitHub analysis to include commit frequency charts | Provides nicer visuals for recruiters viewing candidate profiles | Frontend lead | 4 days |

**Next validation experiments**

| Hypothesis / next question | Method | Success threshold | Resources needed | Timeline |
| :--- | :--- | :--- | :--- | :--- |
| Faculty will trust AI-generated teams for capstone projects | Pilot TRACE in one real university capstone course to form 10 teams | Teams rate their final synergy ≥ 8/10; Professor accepts 100% of teams | 1 Professor, 40 students, deployed server access | 3 weeks |
| Real-time code compilation improves AI grading accuracy | A/B test AI grading simulated code vs. actual Sandbox-compiled code | Score variance between human grader and AI drops to ≤ 5% | 20 mock interview transcripts, Docker sandbox | 2 weeks |

---

## 10. Conclusion
TRACE successfully transitions the ambiguous, manual process of tech team formation into an AI-driven, objective pipeline. By proving that LLMs can not only parse skills but actively evaluate them via conversation and code analysis, the project met its primary goal: drastically reducing time-to-team while providing immense secondary value via personalized learning paths. TRACE is ready for controlled expansion into university capstone environments.

---

## 11. References
[1] SoI Student Project Review Template, internal course document, Sep. 2025.
[2] "Attention Is All You Need", Vaswani et al., 2017.
[3] GitHub REST API Documentation, 2026.
[4] OWASP Top 10 for LLM Applications, 2025.

---

## Appendix A. Claim-to-evidence traceability matrix

| Claim ID | Claim statement | Evidence link / Status |
| :--- | :--- | :--- |
| **C1** | TRACE reduced time-to-form-team from 45 min to 1.5 min. | Validated via `timing_mvp.csv` manual test runs. |
| **C2** | AI accurately generates viable learning paths. | Validated via `InterviewRoom.jsx` test dumps. |
| **C3** | Users prefer inline results over navigating away. | Addressed in hotfix (Commit `c3dc600`). |

## Appendix B. Reproducibility / build-and-run notes
- **Structure**: `/server` (FastAPI backend), `/client` (React/Vite frontend).
- **Dependencies**: Python 3.10+, Node.js, running instance of Ollama with `llama3.1:8b` model pulled.
- **Run**: 
  1. `cd server && uvicorn main:app --reload`
  2. `cd client && npm run dev`
  3. Ensure `GOOGLE_API_KEY` is present in `/server/.env` for Gemini multimodal fallback.

---

## Appendix C. Instruments, forms, and consent

**Consent statement used in MVP sessions**
I agree to test the TRACE MVP for learning and platform improvement purposes. My assessment results, interview transcripts, and GitHub data may be summarized in the final project submission, but my personal identity and raw credentials will remain confidential.

**Interview / debrief questions**
- What were you trying to achieve when forming a team for your recent hackathon or project?
- Without TRACE, what is your normal process for finding and vetting technical teammates?
- What worked well when you used the Autonomous Team Builder and Mock Interview?
- What was confusing, slow, or unreliable about the AI evaluation?
- Would you trust TRACE to generate your next capstone team? Why or why not?
- What one change would make the Personalized Learning Paths significantly better?

**Quick quantitative instrument**
- **Primary metric**: time-to-team (minutes).
- **Secondary metrics**: AI assessment accuracy, SUS score, successful interview completions.
- SUS administered only after a user successfully formed a team and viewed their generated learning path.

---

## Appendix D. Domain-specific annex

| Lab code | What this project included |
| :--- | :--- |
| **CS** | Full-stack architecture (FastAPI/React), AI agent integration (Ollama/Llama 3.1, Gemini), database schema design for candidate profiling, and secure OAuth flows. |
| **AI** | Prompt engineering for strict JSON parsing, context window management for interview transcripts, and multimodal configuration for real-time vibe checking. |

**Why this example matters**
This example is intentionally not a perfect commercialization story. It is a realistic student-project record showing how to document evidence, learning, and continuation value when integrating cutting-edge LLMs into a real-world campus problem.
