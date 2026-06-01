# Arise: Go-To-Market Strategy & Pricing Roadmap

> **The short answer: Yes, start free. But with a clear plan to monetize through your Whop community.**
>
> The free app is your growth engine. The Whop community ([https://whop.com/arise-zrt/](https://whop.com/arise-zrt/)) is where the money lives. Never close the free app — it feeds the paid funnel.

---

## The Architecture: Free App + Paid Whop Community

```
┌─────────────────────────────────────────────────────────────────┐
│                        YOUR DOMAIN                              │
│                                                                 │
│   LANDING PAGE (public)          FREE APP (after signup)        │
│   ┌──────────────────┐          ┌──────────────────────┐       │
│   │ Hero section     │          │ Habits (10 max)      │       │
│   │ Feature preview  │  ───→    │ Goals (3 max)        │       │
│   │ "Start Free" CTA │          │ Rules (3 max)        │       │
│   │ Screenshots      │          │ Basic analytics      │       │
│   │                  │          │ Leaderboard (view)   │       │
│   └──────────────────┘          └────────┬─────────────┘       │
│                                          │                      │
│                                   Hits a limit                  │
│                                   or sees "Upgrade" prompt      │
│                                          │                      │
└──────────────────────────────────────────┼──────────────────────┘
                                           │
                                           ▼
                              ┌────────────────────────┐
                              │  WHOP COMMUNITY (paid)  │
                              │  whop.com/arise-zrt     │
                              │                        │
                              │  ✦ Unlimited habits    │
                              │  ✦ Full analytics      │
                              │  ✦ Educational content │
                              │  ✦ Weekly raids        │
                              │  ✦ Guild chat          │
                              │  ✦ "Shadow Monarch"    │
                              │    badge on leaderboard│
                              └────────────────────────┘
```

### Why This Structure Works
| Component | Role | Revenue |
| :--- | :--- | :--- |
| **Landing page** (same domain) | Attracts Reddit/Google traffic. Shows the product. Converts visitors to free signups. | $0 (it's marketing) |
| **Free app** (same domain, after signup) | Hooks users with the Hunter System experience. Creates habit + leaderboard engagement. Generates word-of-mouth. | $0 (it's the hook) |
| **Whop community** ([whop.com/arise-zrt](https://whop.com/arise-zrt/)) | Unlocks unlimited features, educational content, group accountability, and exclusive status. | **$4.99–$9.99/month** |

---

## The 5-Phase Roadmap

```
Phase 1        Phase 2         Phase 3          Phase 4           Phase 5
FREE BETA  →  COMMUNITY    →  SOCIAL PROOF  →  WHOP LAUNCH    →  SCALE
(Weeks 1-3)   (Weeks 3-6)     (Weeks 6-10)     (Weeks 10-14)     (Week 14+)
```

---

## Phase 1: Free Beta — "Recruit Your First 50 Hunters" (Weeks 1–3)

### Goal
Get 50 real users using Arise daily. Collect feedback. Fix bugs. Build relationships.

### Why Free?
- **You have zero social proof.** Nobody will pay for an unknown app with no reviews.
- **Reddit hates paid promotions.** A free passion-project angle gets upvotes.
- **You need feedback before you charge.** Fix friction before money is on the table.

### Weekly Actions
| Day | Action |
| :--- | :--- |
| **Day 1–3** | Warm up Reddit account. Comment helpfully on 5–10 threads in `r/getdisciplined`, `r/sololeveling`, `r/gamification`. |
| **Day 4** | Post the **Passion Project Showcase** to `r/sololeveling`. Include a screen recording. |
| **Day 5** | Post the **Beta Tester Invite** to `r/sideproject` and `r/alphaandbetausers`. |
| **Day 7** | Post the **Competitor Alternative** to `r/getdisciplined`. |
| **Day 8–14** | Reply to every comment. DM anyone who signs up and ask: *"What's your biggest habit you're trying to build?"* |
| **Day 14–21** | Collect feedback. Push updates. Post a public changelog. |

### Metrics to Track
- Total signups
- Daily active users (DAU)
- Habits created per user
- Rule violations logged (proves engagement with the penalty system)

---

## Phase 2: Community — "Build Your Guild" (Weeks 3–6)

### Goal
Convert beta users into a community. Start using Whop's built-in chat/community features.

### Actions
- **Activate Whop community features** — set up discussion channels, educational content sections.
- **Invite all beta users** via in-app notification linking to [whop.com/arise-zrt](https://whop.com/arise-zrt/).
- **Start weekly rituals:**
  - **Monday Quest Board:** Members post their top 3 goals for the week.
  - **Friday Stat Check-in:** Members share screenshots of their Arise dashboard.
- **Identify top 5 power users.** DM them personally, thank them, give them "Founding Hunter" status.

### Why This Matters
Community creates **switching costs**. Once someone's friends are on the leaderboard and they have a "Founding Hunter" badge, they won't leave.

---

## Phase 3: Social Proof — "Collect Your Trophies" (Weeks 6–10)

### Goal
Generate the proof points needed to justify charging money.

### Actions
| Asset | How to Get It |
| :--- | :--- |
| **User testimonials** | DM top 10 most active users. Ask: *"If you had to describe Arise to a friend in one sentence, what would you say?"* |
| **Usage statistics** | Query Supabase for aggregate stats: total quests completed, total penalties survived, longest streak. |
| **Before/After stories** | Ask 2–3 power users: *"How have your habits changed since you started using Arise?"* |
| **Reddit upvotes** | Screenshot top-performing Reddit posts. Use as social proof. |
| **Product Hunt prep** | Draft listing. Prepare screenshots, demo video, tagline. |

---

## Phase 4: Whop Launch — "Open the Guild Gates" (Weeks 10–14)

### Goal
Introduce the paid Whop tier while keeping the free app alive.

### What's Free vs. What's on Whop

| | **Free App** (same domain) | **Whop Community** ([whop.com/arise-zrt](https://whop.com/arise-zrt/)) |
| :--- | :--- | :--- |
| **Price** | $0 | **$4.99/month** or **$39.99/year** |
| **Habits/Quests** | Up to 10 active | Unlimited |
| **Goals** | Up to 3 | Unlimited |
| **Rules** | Up to 3 | Unlimited |
| **Routines** | 1 routine | Unlimited |
| **Skills tracking** | Up to 3 | Unlimited |
| **Analytics** | Basic (7-day view) | Full analytics (all time, charts, heatmaps) |
| **Leaderboard** | View only | Full access + weekly rank reports |
| **Friends** | Up to 5 | Unlimited |
| **AI System Guide** | Limited daily messages | Unlimited |
| **Educational content** | — | Full access to courses, guides, frameworks |
| **Community chat** | — | Full Whop community access |
| **Weekly raids/challenges** | — | Exclusive group challenges |
| **Profile badge** | — | "Shadow Monarch" badge on leaderboard |
| **Themes** | Default dark theme | Exclusive themes |

### How to Convert Free Users Without Closing Anything

Add **soft gates** inside the free app that nudge users toward Whop, but **add a strict rank requirement to join the Guild**:

1. **The Rank Gate (The Hook):** If an E-Rank or D-Rank player tries to join the Guild, the system rejects them with a modal: 
   > *"ACCESS DENIED. The Hunter Guild is only open to C-Rank hunters and above. There is no place for the weak. Level up your stats and return."*
   *(This builds massive FOMO and exclusivity. They will grind just to unlock the *ability* to buy the upgrade).*
2. **Limit gate:** When a C-Rank (or higher) user tries to add an 11th habit → *"You've reached your current limits. Unlock unlimited quests → [Join the Hunter Guild](https://whop.com/arise-zrt/)"*
3. **Analytics gate:** Show 7-day analytics for free. For full history → *"Unlock S-Rank analytics on Whop"*
4. **Leaderboard badge:** Whop members get a glowing "Shadow Monarch" badge. Free users see it and want it.

### The Founding Hunter Discount

For your first 50 users, send this in-app notification:

> **[SYSTEM NOTIFICATION]**
>
> Hunter, you are one of the original 50 who joined Arise during the beta.
>
> We're launching the **Hunter Guild** — an exclusive community with advanced features, weekly raids, educational content, and unlimited access to all of Arise's systems.
>
> As a Founding Hunter, you get **40% off for life.** This offer expires in 7 days.
>
> → [Join the Hunter Guild](https://whop.com/arise-zrt/)

This approach:
- ✅ Rewards loyalty (they feel special, not robbed)
- ✅ Creates urgency (7-day window)
- ✅ Doesn't remove anything they already have
- ✅ Adds value (courses, raids, community) rather than taking value away

---

## Phase 5: Full Launch — "Open the Gates" (Week 14+)

### Goal
Public launch across all channels. Maximum visibility.

### Launch Day Actions
- **Product Hunt launch** (aim for Tuesday–Thursday, 12:01 AM PT).
- **Reddit posts** in `r/sideproject`, `r/webdev`, `r/reactjs`.
- **Whop community announcement** to your guild.
- **Email blast** to waitlist/beta list.

### Post-Launch
- Publish comparison pages: "Arise vs Habitica" and "Arise vs Notion Life RPG Templates."
- Submit to directories: BetaList, TAAFT, AlternativeTo, SaaSHub.
- Blog content: "How I Gamified My Life" and "The Science Behind Penalty-Based Habit Tracking."

---

## Weekly Action Calendar (Weeks 1–4)

| Week | Monday | Tuesday | Wednesday | Thursday | Friday | Weekend |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **1** | Warm up Reddit (comment on 5 threads) | Comment on 5 more threads | Post Template 1 to r/sololeveling | Reply to all comments | Post Template 3 to r/sideproject | DM every new signup |
| **2** | Post Template 2 to r/getdisciplined | Reply to comments | Fix top 3 bugs from feedback | Push update + changelog | Cross-post to r/gamification | DM top users for feedback |
| **3** | Activate Whop community chat | Invite all beta users to Whop | Post "Monday Quest Board" ritual | Share a development update | First "Friday Stat Check-in" | Identify top 5 power users |
| **4** | DM power users for "Founding Hunter" role | Post a "building in public" update | Community AMA on Whop | Engage on Reddit threads | Stat Check-in #2 | Collect first testimonials |

---

## The "Solo Leveling" Monetization Mindset

> **Sung Jin-Woo didn't start at S-Rank. He ground his way there.**

| Rank | Phase | What You Do |
| :--- | :--- | :--- |
| **E-Rank** | Free Beta | Give everything away. Survive and learn. |
| **D-Rank** | Community | Build your guild on Whop. Still free, but the network grows. |
| **C-Rank** | Social Proof | Collect testimonials, stats, Reddit upvotes. Now you have proof. |
| **B-Rank** | Whop Launch | Introduce paid tier. Free app stays as the hook. Whop is the upgrade. |
| **A-Rank** | Full Launch | Product Hunt, directories, comparison pages. |
| **S-Rank** | Scale | Mobile app, team/guild subscriptions, partnerships. |

---

## Critical Rules

| Rule | Why |
| :--- | :--- |
| **Never close the free app** | It's your marketing engine. Closing it kills growth and triggers Reddit backlash. |
| **Free must feel genuinely useful** | 10 habits + 3 goals is enough for casual users. If free feels crippled, people leave. |
| **Whop must feel like an upgrade, not a hostage** | Add value (courses, community, badges). Don't subtract value from free. |
| **Grandfather beta users** | First 50 get 40% off for life. Rewards loyalty, prevents backlash. |
| **Post on Reddit only after warming up** | 5–7 days of commenting before first post. New accounts get spam-filtered. |
