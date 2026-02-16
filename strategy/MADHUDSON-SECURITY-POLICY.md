# Mad Hudson SEO — Security & Data Governance Policy

---

## 🔐 SECURITY CLASSIFICATION

### **Public (Can Share Widely)**
- General brand positioning statement
- Published blog posts
- Press releases and media coverage
- Public ranking data (top keywords Connor wants to own)
- General competitive market analysis
- Public artist bios

### **Internal Only (Connor's Team)**
- Google Search Console raw data (all queries, all metrics)
- Google Analytics traffic patterns and user behavior
- Shopify admin credentials and access
- Artist commission structures and revenue splits
- Specific artist contract terms
- Detailed traffic/revenue numbers
- Competitor pricing intelligence
- Internal product roadmap

### **External (Only with NDA)**
- Detailed competitive analysis (8-brand matrix, specific weaknesses)
- Specific traffic metrics ($X/month potential)
- Artist personal information (phone, email, address)
- Negotiated terms on case-by-case basis

### **Never Share**
- Shopify admin passwords
- API keys or OAuth tokens
- Customer personal data
- Artist social security numbers or tax IDs
- Credit card information
- Proprietary manufacturing data

---

## 🔑 API KEY & CREDENTIAL MANAGEMENT

### **Google Search Console**
- **Access:** Connor (owner) + authorized team members only
- **Sharing:** Use read-only view URLs, never share credentials
- **Rotation:** Quarterly (regenerate access tokens)
- **Audit:** Check GSC Users & Permissions monthly

### **Google Analytics**
- **Access:** Connor (admin) + analytics-focused team
- **Sharing:** Create read-only views for external consultants
- **Credentials:** OAuth 2.0 only (never API keys)
- **Rotation:** Quarterly
- **Audit:** Review Users & Permissions quarterly

### **Shopify API**
- **Access:** Developers only, no sharing
- **Credentials:** OAuth 2.0 tokens (not static API keys)
- **Scopes:** Minimal required (read product metadata, not customer data)
- **Rotation:** Every 3 months
- **Audit:** Check "Apps and Sales Channel" permissions quarterly

### **For Multi-Agent Work**
- [ ] **Store all credentials in environment variables** (never in code)
  ```
  export GSC_CREDENTIALS="[path/to/oauth/token]"
  export SHOPIFY_API_TOKEN="[oauth-token]"
  export ANALYTICS_API_KEY="[oauth-token]"
  ```
- [ ] **Use `.env` file** (add to `.gitignore`)
- [ ] **Never commit credentials** to git
- [ ] **Use Claude's built-in context isolation**
  - Agents cannot see each other's full prompts
  - Each agent operates independently
  - Credential sharing happens via environment, not prompts
- [ ] **Log all API access** for audit trail
  ```
  [2026-02-09 10:15:22] GSC API: seo-monitor-agent read rankings
  [2026-02-09 10:15:45] Analytics API: reporter-agent generated report
  [2026-02-09 10:16:10] Shopify API: coordinator-agent read product metadata
  ```

---

## 👥 ACCESS CONTROL MATRIX

| Role | GSC | Analytics | Shopify | Artist Data | Can Share Externally? |
|------|-----|-----------|---------|-------------|----------------------|
| **Connor (Owner)** | Full | Admin | Admin | Full | Yes (with discretion) |
| **Team Member** | Read-only | Read-only | Limited | Read | Only with approval |
| **Copywriter** | None | None | None | Read-only | Blog + artist bio only |
| **Developer** | None | None | Limited | None | Tech specs only |
| **PR Person** | None | None | None | Public only | Public brand story |
| **External Consultant** | Read-only view | Read-only view | None | None | With NDA only |
| **Agents (Autonomous)** | Read-only API | Read-only API | Read-only API | Minimal (as needed) | Results only |

---

## 🤖 AGENT ACCESS & ISOLATION

### **SEO Monitor Agent**
- **Access:** GSC (read-only), Web search (public)
- **Data it sees:** Ranking positions, click data, impressions
- **Data it cannot see:** Shopify credentials, artist contracts, revenue data
- **Output:** Ranking reports (safe to share)
- **Isolation:** Cannot access Analytics or Shopify APIs

### **Content Planner Agent**
- **Access:** Web search (public), artist bios (provided)
- **Data it sees:** Blog topics, keywords, competitor content
- **Data it cannot see:** Revenue, customer data, detailed analytics
- **Output:** Blog outlines, keyword recommendations (safe to share)
- **Isolation:** Cannot access Shopify or sensitive APIs

### **Copywriting Coordinator Agent**
- **Access:** Brand guidelines (provided), artist bios (provided)
- **Data it sees:** Brief guidelines, submission evaluation criteria
- **Data it cannot see:** Contracts, revenue, detailed analytics
- **Output:** Copywriter briefs, QA feedback (safe to share)
- **Isolation:** Cannot access APIs

### **Analytics Reporter Agent**
- **Access:** GSC (read-only API), Analytics (read-only API)
- **Data it sees:** Aggregate traffic, top pages, trends
- **Data it cannot see:** Individual user data, customer identities
- **Output:** Trend reports, recommendations (safe to share)
- **Isolation:** Cannot access Shopify or personal data APIs

### **Press Outreach Agent**
- **Access:** Web search (public), brand story (provided)
- **Data it sees:** Media outlets, contact info (public)
- **Data it cannot see:** Anything proprietary
- **Output:** Pitch templates, media lists (safe to share)
- **Isolation:** Cannot access APIs

---

## 🛡️ DATA MINIMIZATION PRINCIPLE

**When briefing agents or contractors, provide ONLY what they need:**

```
❌ WRONG:
"Here's the full GSC export (all keywords, all metrics)"

✓ RIGHT:
"Target these 7 keywords: [list]. Current positions: Page 2."
```

```
❌ WRONG:
"Here's the full Shopify store export with pricing and inventory"

✓ RIGHT:
"Product pages need artist stories. Here's a template."
```

```
❌ WRONG:
"Here's all artist contracts and revenue terms"

✓ RIGHT:
"Artist bios for reference: [public info only]"
```

---

## 📋 HANDOFF CHECKLIST (Before Sharing Data)

Before sharing any information with an agent, contractor, or team member:

- [ ] Classify the data (Public / Internal / External)
- [ ] Confirm access level for this person
- [ ] Remove any data that exceeds their access level
- [ ] Document what was shared and when
- [ ] Set expiration date (if temporary access)
- [ ] If external: Confirm NDA is signed
- [ ] If API access: Confirm read-only scope

---

## 🔄 CREDENTIAL ROTATION SCHEDULE

| Credential | Rotation Frequency | Owner | Last Rotated | Next Due |
|------------|------------------|-------|--------------|----------|
| GSC OAuth | Every 3 months | Connor | 2026-02-09 | 2026-05-09 |
| Analytics OAuth | Every 3 months | Connor | 2026-02-09 | 2026-05-09 |
| Shopify API Token | Every 3 months | Dev | 2026-02-09 | 2026-05-09 |

**Calendar Reminder:** Set quarterly rotation on calendar (Feb 9, May 9, Aug 9, Nov 9)

---

## 🚨 INCIDENT RESPONSE

**If credentials are compromised:**

1. **Immediate:** Regenerate compromised token
2. **Within 1 hour:** Review access logs (what was accessed?)
3. **Within 24 hours:** Notify team members
4. **Within 48 hours:** File incident report (if required)
5. **Within 1 week:** Post-mortem analysis + policy update

**If data is accidentally shared externally:**

1. **Immediate:** Notify the recipient to delete
2. **Within 24 hours:** Assess what was shared
3. **Within 48 hours:** Review access logs for other exposures
4. **Within 1 week:** Implement controls to prevent recurrence

---

## 📊 AUDIT & COMPLIANCE

**Monthly Security Checklist:**
- [ ] Review GSC Users & Permissions (any unauthorized access?)
- [ ] Check Analytics Users (any suspicious activity?)
- [ ] Verify Shopify app permissions (remove unused apps)
- [ ] Review credential rotation status (do any need rotating?)
- [ ] Check for accidental data sharing (review past handoffs)

**Quarterly:**
- [ ] Full access control audit (who has access to what?)
- [ ] Policy review (any changes needed?)
- [ ] Credential rotation (regenerate OAuth tokens)
- [ ] Incident review (anything happened? lessons learned?)

---

## 📞 CONTACTS & ESCALATION

**Security Questions/Issues:** Connor (owner)

**Data Access Requests:** Connor (owner)

**Credential Problems:** Contact your Shopify/Google account manager

**External Sharing Requests:** Connor (NDA required)

---

## ✅ SECURITY SIGN-OFF

By executing this SEO plan, Connor (or designee) confirms:

- [ ] Understands the data classification above
- [ ] Agrees to protect internal-only information
- [ ] Will rotate credentials quarterly
- [ ] Will audit access monthly
- [ ] Will follow data minimization principle
- [ ] Understands incident response procedures

**Signed:** ________________________
**Date:** ________________________

---

**Policy Version:** 1.0
**Last Updated:** February 9, 2026
**Next Review:** May 9, 2026
