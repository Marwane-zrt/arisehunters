# Marketing Skills & Agent Instructions

## Custom Skills Integration
This project integrates specialized marketing skills from the [marketingskills](https://github.com/coreyhaines31/marketingskills.git) framework.

- **Global Skills Directory:** `C:\Users\Admin\.agents\skills\`
- **Local Skills Directory:** `.agents/skills/` or `.claude/skills/` (if locally installed)

### Agent Instructions
1. **Detect Marketing Tasks:** Whenever the user asks for a marketing-related task (e.g., copywriting, copy-editing, conversion rate optimization (CRO), A/B testing, paid ads, SEO, analytics, onboarding, paywalls, email lifecycle sequences), identify the relevant skill name (e.g., `copywriting`, `cro`, `ab-testing`, `ai-seo`, `emails`, `analytics`).
2. **Load Skill Guidelines:** Before starting the task, view and read the corresponding `SKILL.md` file (e.g., `C:\Users\Admin\.agents\skills/<skill-name>/SKILL.md` or `.agents/skills/<skill-name>/SKILL.md`) to align with its specific principles, checklists, and frameworks (like the Seven Sweeps Framework for copy-editing).
3. **Reference Product Context:** If a `.agents/product-marketing.md` or `.claude/product-marketing.md` file exists in the workspace root, read it first to ensure all copy, messaging, and strategies align with the brand voice and target audience.
