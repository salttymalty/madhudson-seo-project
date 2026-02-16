# Mad Hudson SEO — Multi-Agent Orchestration Design

**How to coordinate autonomous agents for ongoing SEO execution**

---

## 🤖 AGENT TEAM COMPOSITION

### **Agent 1: SEO Monitor** (Explore/General-Purpose)
**Purpose:** Track rankings, detect changes, identify opportunities

**Responsibilities:**
- Weekly ranking snapshot for target keywords
- Alert on position changes (↑3+ spots = opportunity)
- Monitor index coverage (check GSC Coverage tab)
- Identify new keyword opportunities (related searches, People Also Ask)
- Track competitor ranking changes (if possible)

**Input Data:**
- Target keywords list (7 keywords to own)
- GSC read-only API access
- Historical baseline positions

**Output:**
- Weekly ranking report (markdown)
- Opportunity alerts (if detected)
- Competitor movement (if detected)

**Trigger:**
- Weekly (Monday 9am)
- On-demand if Connor requests

**Tools Access:**
- Google Search Console API (read-only)
- Web search (public)
- NO Shopify, NO Analytics, NO artist data

**Success Metrics:**
- Tracks positions accurately
- Alerts on meaningful changes (3+ spots)
- Identifies keywords moving up (quick wins)

---

### **Agent 2: Content Planner** (Explore/General-Purpose)
**Purpose:** Research topics, outline blog posts, suggest keywords

**Responsibilities:**
- Research blog topic viability (search volume, difficulty)
- Create blog post outlines (structure, keywords, length)
- Suggest related keywords (pillar/cluster strategy)
- Review competitor content (what's being published?)
- Prioritize topics by ROI (difficulty vs. search volume)

**Input Data:**
- 5 content pillars (Artist Stories, Design, Community, Process, Transparency)
- Initial blog topic list (10-15 suggested topics)
- Artist bios (public info only)

**Output:**
- Blog outline + keyword targets (per topic)
- Prioritized content calendar (what to publish first)
- Competitor content analysis (what's already out there)
- Keyword clusters (topic groups)

**Trigger:**
- Monthly (start of month planning)
- Before new blog cycle starts
- On-demand if new topic direction needed

**Tools Access:**
- Web search (public)
- Keyword research (public tools)
- NO APIs, NO internal data

**Success Metrics:**
- Topics selected are searchable (have search volume)
- Keywords suggested are relevant + achievable
- Outlines are actionable (copywriter can execute)

---

### **Agent 3: Copywriting Coordinator** (General-Purpose)
**Purpose:** Brief copywriters, QA submissions, manage workflow

**Responsibilities:**
- Create copywriter briefs (topic, keywords, tone, examples)
- QA submitted copy (is it on-brand? does it hit keywords?)
- Request revisions (if needed)
- Prepare copy for publishing (formatting, linking)
- Track copywriting pipeline (who's working on what)

**Input Data:**
- Brand voice guidelines
- Artist bios (provided by Connor)
- Blog outlines (from Content Planner)
- Copywriter submission (draft copy)

**Output:**
- Copywriter brief (ready to send)
- QA report (what's good, what needs work)
- Revision requests (specific feedback)
- Publishing checklist (verified + ready to go)

**Trigger:**
- Before copywriter is hired (create brief)
- After copywriter submits (QA review)
- Weekly check-in (if ongoing)
- On-demand

**Tools Access:**
- Document creation/editing
- Email drafting
- NO APIs

**Success Metrics:**
- Briefs are clear and actionable
- QA catches brand voice issues
- Revisions are constructive (copywriter improves)
- Copy is ready to publish

---

### **Agent 4: Analytics Reporter** (General-Purpose)
**Purpose:** Analyze trends, create reports, recommend actions

**Responsibilities:**
- Aggregate GSC + Analytics data (rankings, traffic, conversions)
- Identify trends (what's working? what's not?)
- Compare to targets (are we on track?)
- Recommend actions (what to do next?)
- Create monthly dashboard (for Connor's review)

**Input Data:**
- GSC data (read-only API)
- Analytics data (read-only API)
- Historical baseline
- Targets (expected traffic, keyword positions)

**Output:**
- Monthly performance report (markdown)
- Trend analysis (what changed this month?)
- Recommendation summary (what to prioritize)
- Dashboard/visualization (if possible)

**Trigger:**
- Monthly (end of month)
- Quarterly (comprehensive review)
- On-demand if Connor requests analysis

**Tools Access:**
- Google Search Console API (read-only)
- Google Analytics API (read-only)
- Document creation
- NO Shopify, NO artist data

**Success Metrics:**
- Report accurately reflects data
- Trends are clearly explained
- Recommendations are actionable
- Report is executive-friendly (Connor can decide quickly)

---

### **Agent 5: Press Outreach** (Explore/General-Purpose)
**Purpose:** Research publications, draft pitches, track outreach

**Responsibilities:**
- Research design/art/watch publications (potential outlets)
- Compile media contact list (editor contacts, submission process)
- Draft pitch emails (compelling, on-brand)
- Create outreach calendar (who to pitch, when)
- Track responses (who's interested? follow-up needed?)

**Input Data:**
- Artist stories (public info)
- Brand positioning
- Past press coverage examples
- List of target publications

**Output:**
- Media contact list (10-20 outlets)
- Pitch email templates (customizable per publication)
- Outreach calendar (timing, sequence)
- Response tracker (who said yes/no, follow-up status)

**Trigger:**
- Monthly (Phase 2+)
- Before press campaign (research + planning)
- On-demand (new artist collaboration = new pitches)

**Tools Access:**
- Web search (public)
- Document creation
- Email drafting
- NO APIs, NO internal data

**Success Metrics:**
- Media list includes relevant, high-authority outlets
- Pitch emails are compelling and specific
- Outreach is tracked (no lost leads)
- Response rate >10% (at least some interest)

---

## 🔄 ORCHESTRATION WORKFLOW

### **PHASE 1 (Week 1) — Manual Baseline**
```
[Manual] Connor does solo work:
  - Sets up GSC tracking
  - Creates keyword list
  - Researches artist info
  - Prepares copywriter brief

[Awaiting] Copywriter starts work on product narratives
```

**Agent Status:** All agents dormant (waiting for baseline)

---

### **PHASE 2 START (Week 2) — First Agent Activations**
```
[Agent: SEO Monitor]
  → Task: Capture GSC baseline (current positions)
  → Output: Baseline_rankings_2026-02-09.md

[Agent: Content Planner]
  → Task: Research blog topics + keyword targets
  → Input: 5 content pillars, 10-15 topic ideas
  → Output: Blog_outline_and_keywords.md

[Agent: Press Outreach]
  → Task: Research publications + compile media list
  → Output: Media_contact_list.md, pitch_templates.md

[Awaiting] Copywriter submitting product narratives
[Awaiting] Blog articles being written
```

**Agent Status:** 3 agents active in parallel

---

### **PHASE 2 MIDDLE (Week 3-4) — Content QA + Publishing**
```
[Agent: Copywriting Coordinator]
  → Task: QA copywriter submissions (blog drafts)
  → Input: Copywriter drafts
  → Output: QA_report.md, revision_requests.md

[Agent: SEO Monitor]
  → Task: Weekly ranking check (no major changes expected)
  → Output: Week2_ranking_snapshot.md

[Manual] Connor reviews and approves:
  - Blog content (QA feedback)
  - Product narratives (final review)

[Manual] Connor publishes blog articles + updates Shopify
```

**Agent Status:** 2 agents active, 1 awaiting feedback

---

### **PHASE 2 END (Week 5-8) — Monitoring + Planning Phase 3**
```
[Agent: SEO Monitor]
  → Task: Weekly ranking checks (expect movement around week 6-8)
  → Output: Week3_snapshot.md, Week4_snapshot.md, etc.
  → Alert: IF keyword moves 3+ spots ↑ → flag as opportunity

[Agent: Analytics Reporter]
  → Task: Weekly traffic monitoring (early signals)
  → Output: Traffic_trend_report.md

[Agent: Content Planner]
  → Task: Plan next blog cycle (topics for month 2)
  → Output: Phase2_content_calendar.md

[Agent: Press Outreach]
  → Task: Begin executing pitch emails
  → Output: Outreach_log.md, responses.md

[Manual] Connor checks Phase 1 success (keywords moved?)
[Manual] Connor decides: Continue to Phase 3?
```

**Agent Status:** 4 agents active, coordinating

---

### **PHASE 3 ONGOING (Week 8+) — Steady State**
```
WEEKLY:
├─ [Agent: SEO Monitor]
│   → Ranking snapshot
│   → Alert if movements detected
│   → Output: Weekly_rankings_[date].md

├─ [Agent: Analytics Reporter]
│   → Traffic trends
│   → Conversion trends
│   → Output: Weekly_analytics_[date].md

└─ [Manual] Connor reviews + decides next steps

MONTHLY:
├─ [Agent: Content Planner]
│   → Plan next month's blog topics
│   → Suggest keyword angles
│   → Output: Monthly_content_plan_[month].md

├─ [Agent: Press Outreach]
│   → Outreach summary
│   → New pitch opportunities
│   → Output: Monthly_press_report_[month].md

├─ [Agent: Analytics Reporter]
│   → Comprehensive monthly report
│   → Trend analysis
│   → Recommendations
│   → Output: Monthly_report_[month].md

└─ [Manual] Connor strategy session
    - Review all agent reports
    - Adjust priorities for next month
    - Approve budget spending
    - Set new targets
```

**Agent Status:** All agents running steady state, Connor reviews monthly

---

## 📤 AGENT HANDOFF PROTOCOL

### **Template: Agent Output to Next Agent**

```markdown
# Handoff: [From Agent] → [To Agent]

## Context
[What just happened, why this matters]

## Key Findings
- Finding 1: [Description] [Impact?]
- Finding 2: [Description] [Impact?]
- Finding 3: [Description] [Impact?]

## Data for Next Agent
[Specific data/file the next agent needs]

## Blockers (If Any)
- Blocker 1: [Description] [Who can resolve?]
- Blocker 2: [Description] [Who can resolve?]

## Action Items for Next Agent
- [ ] Task 1: [Specific]
- [ ] Task 2: [Specific]

## Questions for Connor (If Decision Needed)
- Question 1: [What decision is needed?]
- Question 2: [What decision is needed?]
```

### **Example Handoff: SEO Monitor → Content Planner**

```markdown
# Handoff: SEO Monitor → Content Planner

## Context
Found that "watches for creators" is starting to trend in search queries.
Competitors still not optimizing for this. Opportunity window is open.

## Key Findings
- "watches for creators" jumped from position 45 → position 12 (! early movement!)
- Related keywords rising: "artist watches for sale," "creator-designed watches"
- No competitor is explicitly targeting "watches for creators"
- Optimal content structure: Artist-focused, process-oriented

## Data for Content Planner
- Trending keyword: "watches for creators"
- Related keywords: [list]
- Competitor gap analysis: [details]
- Current search intent: [what are people actually searching?]

## Action Items for Content Planner
- [ ] Research blog topics that serve "watches for creators" search intent
- [ ] Suggest content angles (artist interviews, design process, customer stories)
- [ ] Prioritize by keyword difficulty + search volume
- [ ] Create outlines for top 3 suggested topics

## Questions for Connor
- Do we have artist customers we can feature as case studies?
- Should we pivot messaging to lean harder into "for creators"?
```

---

## 📊 REPORTING CADENCE

| Frequency | Agent | Output | Recipient | Format |
|-----------|-------|--------|-----------|--------|
| **Weekly** | SEO Monitor | Ranking snapshot | Connor | Markdown file |
| **Weekly** | Analytics Reporter | Traffic trends | Connor | Markdown file |
| **Monthly** | Content Planner | Blog content calendar | Team | Markdown + calendar |
| **Monthly** | Press Outreach | Pitch summary | Connor | Markdown + spreadsheet |
| **Monthly** | Analytics Reporter | Comprehensive report | Connor | Markdown + recommendations |
| **Quarterly** | SEO Monitor | Quarterly trend review | Connor | Markdown + trends |

---

## 🚀 HOW TO ACTIVATE AGENTS

### **Step 1: Create Agent Configuration File**
```yaml
# madhudson-agents.yml
team_name: "madhudson-seo"

agents:
  - name: "seo-monitor"
    type: "explore"
    role: "Track rankings and detect opportunities"
    access:
      - gsc_read_only
      - web_search
    trigger: "weekly"

  - name: "content-planner"
    type: "general-purpose"
    role: "Research and outline blog content"
    access:
      - web_search
    trigger: "monthly"

  - name: "copywriting-coordinator"
    type: "general-purpose"
    role: "QA and manage copywriting"
    access:
      - document_creation
    trigger: "on-demand"

  - name: "analytics-reporter"
    type: "general-purpose"
    role: "Analyze trends and report"
    access:
      - gsc_read_only
      - analytics_read_only
    trigger: "monthly"

  - name: "press-outreach"
    type: "explore"
    role: "Research media and draft pitches"
    access:
      - web_search
      - document_creation
    trigger: "monthly"
```

### **Step 2: Set Up Scheduling**
```bash
# Cron jobs for agent activation

# Weekly: Monday 9am
0 9 * * 1 /claude-code/agents/seo-monitor.sh

# Monthly: First of month, 9am
0 9 1 * * /claude-code/agents/content-planner.sh
0 9 1 * * /claude-code/agents/analytics-reporter.sh
0 9 1 * * /claude-code/agents/press-outreach.sh

# Ad-hoc (on-demand)
# Copywriting Coordinator triggered manually by Connor or coordinator
```

### **Step 3: Connect to Output Storage**
```
All agent outputs go to:
/Users/garen/madhudson-seo/agent-reports/

└── madhudson-seo/
    ├── agent-reports/
    │   ├── seo-monitor/
    │   │   ├── 2026-02-09-ranking-snapshot.md
    │   │   ├── 2026-02-16-ranking-snapshot.md
    │   │   └── ...
    │   ├── content-planner/
    │   │   ├── 2026-02-01-content-calendar.md
    │   │   └── ...
    │   ├── analytics-reporter/
    │   │   ├── 2026-02-01-monthly-report.md
    │   │   └── ...
    │   ├── press-outreach/
    │   │   ├── 2026-02-01-media-list.md
    │   │   └── ...
    │   └── copywriting-coordinator/
    │       ├── 2026-02-10-qa-report.md
    │       └── ...
    └── summaries/
        ├── 2026-02-WEEKLY.md (Connor's weekly summary)
        └── 2026-02-MONTHLY.md (Connor's monthly summary)
```

### **Step 4: Set Up Connor's Review Cadence**
```
WEEKLY (Monday 10am):
- Review SEO Monitor + Analytics Reporter outputs
- Decide: Any immediate actions needed?

MONTHLY (First Monday, 2pm):
- Review all agent reports
- Content Planner: Approve next month's content plan
- Press Outreach: Approve pitches
- Analytics Reporter: Review performance vs. targets
- Decide: Budget allocation, priorities, strategy adjustments

QUARTERLY (First Monday of Q):
- Comprehensive review
- Trend analysis
- Budget vs. actual
- Strategy adjustment (if needed)
```

---

## 🎯 SUCCESS METRICS FOR AGENTS

| Agent | Success Metric | Target |
|-------|---|---|
| SEO Monitor | Accuracy of ranking data | 100% matches GSC |
| | Alert quality | 0 false positives |
| | Opportunity identification | 2+ opportunities/quarter |
| Content Planner | Topic viability | 90%+ have search volume >100/mo |
| | Copywriter execution rate | 80%+ of outlines used |
| | Keyword accuracy | 100% relevant to topic |
| Copywriting Coordinator | QA accuracy | Catches 90%+ of brand issues |
| | Revision clarity | Copywriter understands feedback |
| | Time to publish | <5 days from approval |
| Analytics Reporter | Report accuracy | 100% matches platform data |
| | Actionability | 3+ clear recommendations/report |
| | Executive readiness | Connor can decide in <15 min |
| Press Outreach | Media list quality | 50%+ have published on brand |
| | Response rate | 10%+ open positive response |
| | Pitch clarity | Editor understands story |

---

## ⚠️ FAILURE MODES & RECOVERY

| Failure Mode | Cause | Recovery |
|---|---|---|
| SEO Monitor reports wrong positions | GSC API error or data lag | Verify in GSC manually; wait 24hrs for data sync |
| Content Planner suggests non-viable topics | Bad keyword research | Review topics with Connor; adjust research params |
| Copywriting Coordinator misses brand issue | Brand guidelines unclear | Update guidelines; re-QA submissions |
| Analytics Reporter wrong trends | Data source error | Verify data in platform manually |
| Press Outreach poor response rate | Bad target list or pitch | Update media list; A/B test pitch angles |

---

## 📞 ESCALATION PROTOCOL

**If agent produces unusual output:**

1. Connor reviews and flags issue
2. Check if it's a data problem or agent problem
3. If data: Verify source, rerun agent
4. If agent: Adjust prompt/parameters, rerun agent
5. Document lesson learned for future

**If agent is blocked:**

1. Agent reports blocker in output
2. Connor identifies who can resolve
3. Owner resolves blocker
4. Agent reruns when unblocked

**If agent fails repeatedly:**

1. Disable agent
2. Review failure pattern
3. Adjust agent role or access
4. Re-enable when ready

---

**Version:** 1.0
**Last Updated:** February 9, 2026
**Ready for Activation:** Phase 2 (Week 2)
