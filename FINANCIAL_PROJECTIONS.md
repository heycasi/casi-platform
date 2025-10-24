# 💰 Casi Platform - Financial Projections & Profitability Analysis

## Revenue Projections (from ACQUISITION_ROADMAP.md)

| Month | Users | Paying | MRR | ARR | Churn |
|-------|-------|--------|-----|-----|-------|
| 6 | 1,000 | 300 (30%) | £10,500 | £126K | 8% |
| 12 | 5,000 | 2,000 (40%) | £74,000 | £888K | 5% |
| 18 | 15,000 | 7,500 (50%) | £277,500 | £3.33M | 3% |
| 24 | 40,000 | 20,000 (50%) | £740,000 | £8.88M | 2% |

---

## 📊 Cost Structure Breakdown

### **1. Infrastructure Costs (Scalable)**

**Current (0-1,000 users):**
```
Vercel Pro:              £20/month
Supabase Pro:            £25/month
Resend Email:            £10/month (250 emails)
Stripe:                  2.9% + £0.30 per transaction
Domain/SSL:              £2/month
Total Base:              £57/month (~£684/year)
```

**Month 6 (1,000 users, 300 paying):**
```
Vercel Pro:              £20/month
Supabase Pro:            £25/month (8GB included, 10K DB writes/sec)
Resend Email:            £20/month (1K emails/month)
Stripe Fees:             £305/month (£10,500 × 2.9%)
CDN/Assets:              £10/month
Monitoring:              £15/month (Sentry, LogRocket)
Total:                   £395/month (£4,740/year)
Infrastructure % of MRR: 3.8%
```

**Month 12 (5,000 users, 2,000 paying):**
```
Vercel Team:             £80/month (need more bandwidth)
Supabase Team:           £499/month (100GB, 1M DB writes/sec)
Resend Pro:              £80/month (10K emails/month)
Stripe Fees:             £2,146/month (£74,000 × 2.9%)
CDN/Assets:              £50/month
Monitoring:              £30/month
Redis Cache:             £15/month (for real-time features)
Total:                   £2,900/month (£34,800/year)
Infrastructure % of MRR: 3.9%
```

**Month 18 (15,000 users, 7,500 paying):**
```
Vercel Enterprise:       £200/month (dedicated support)
Supabase Enterprise:     £999/month (500GB, 5M DB writes/sec)
Resend Enterprise:       £200/month (50K emails/month)
Stripe Fees:             £8,048/month (£277,500 × 2.9%)
CDN/Assets:              £150/month
Monitoring:              £80/month
Redis Cluster:           £100/month
S3 Storage:              £50/month (event data backups)
Total:                   £9,827/month (£117,924/year)
Infrastructure % of MRR: 3.5%
```

**Month 24 (40,000 users, 20,000 paying):**
```
Vercel Enterprise:       £400/month (high traffic)
Supabase Enterprise:     £1,999/month (2TB, 10M DB writes/sec)
Resend Enterprise:       £400/month (200K emails/month)
Stripe Fees:             £21,460/month (£740,000 × 2.9%)
CDN/Assets:              £400/month
Monitoring:              £150/month
Redis Cluster:           £200/month
S3 Storage:              £150/month
Database Backups:        £100/month
Total:                   £25,259/month (£303,108/year)
Infrastructure % of MRR: 3.4%
```

**Key Insight:** Infrastructure scales beautifully - stays ~3-4% of MRR even at scale!

---

### **2. Personnel Costs (Biggest Expense)**

**Month 0-6 (Founder + 1 Part-Time Dev):**
```
Founder Salary:          £0/month (living on savings/runway)
Part-Time Developer:     £2,000/month (20 hrs/week @ £25/hr)
Total:                   £2,000/month (£24,000/year)
```

**Month 6-12 (Small Team - 3 people):**
```
Founder Salary:          £3,000/month (still below market)
Full-Time Developer:     £4,500/month (mid-level)
Customer Success:        £2,500/month (part-time)
Total:                   £10,000/month (£120,000/year)
```

**Month 12-18 (Growing Team - 6 people):**
```
Founder Salary:          £5,000/month
2x Developers:           £9,000/month (£4,500 each)
Product Manager:         £5,000/month
Customer Success:        £3,500/month (full-time)
Marketing:               £3,000/month
Total:                   £25,500/month (£306,000/year)
```

**Month 18-24 (Scaling Team - 12 people):**
```
Founder/CEO:             £8,000/month
CTO:                     £7,000/month
4x Developers:           £18,000/month (£4,500 avg)
2x Product Managers:     £10,000/month
2x Customer Success:     £7,000/month
Marketing Manager:       £5,000/month
Sales Lead:              £6,000/month
Operations:              £4,000/month
Total:                   £65,000/month (£780,000/year)
```

---

### **3. Customer Acquisition Cost (CAC)**

**Month 0-6 (Organic + Referrals):**
```
Content Creation:        £500/month (freelance writers)
Social Media Ads:        £500/month (testing)
Tools:                   £200/month (analytics, design)
Total:                   £1,200/month
Monthly New Users:       167 users/month (1,000 by Month 6)
CAC:                     £7.20 per user
```

**Month 6-12 (Paid Acquisition Ramp):**
```
Content Creation:        £1,000/month
Paid Ads:                £5,000/month (Facebook, Google, Twitch)
Influencer Marketing:    £2,000/month (streamer partnerships)
Tools:                   £500/month
Referral Bonuses:        £1,000/month (1 month free per referral)
Total:                   £9,500/month
Monthly New Users:       667 users/month (4,000 in 6 months)
CAC:                     £14.25 per user
```

**Month 12-18 (Scaling Acquisition):**
```
Content Creation:        £3,000/month (team of writers)
Paid Ads:                £20,000/month (optimized campaigns)
Influencer Marketing:    £8,000/month (20+ streamers)
PR/Press:                £3,000/month (TechCrunch, The Verge)
Events/Conferences:      £5,000/month (TwitchCon, VidCon)
Tools:                   £1,000/month
Referral Bonuses:        £5,000/month
Total:                   £45,000/month
Monthly New Users:       1,667 users/month (10,000 in 6 months)
CAC:                     £27 per user
```

**Month 18-24 (Mature Acquisition):**
```
Content Creation:        £5,000/month (full content team)
Paid Ads:                £40,000/month (multi-channel)
Influencer Marketing:    £15,000/month (50+ streamers)
PR/Press:                £5,000/month
Events/Conferences:      £10,000/month
Affiliate Program:       £8,000/month (rev share)
Tools:                   £2,000/month
Referral Bonuses:        £10,000/month
Total:                   £95,000/month
Monthly New Users:       4,167 users/month (25,000 in 6 months)
CAC:                     £22.80 per user
```

---

### **4. Operating Expenses**

**Months 0-6:**
```
Accounting/Legal:        £300/month
Insurance:               £100/month
Co-working Space:        £200/month (optional)
Software/Tools:          £200/month (Slack, Notion, etc.)
Total:                   £800/month (£9,600/year)
```

**Months 6-12:**
```
Accounting/Legal:        £500/month
Insurance:               £200/month
Office Space:            £500/month (small office)
Software/Tools:          £500/month
Recruiting:              £1,000/month (hiring fees)
Total:                   £2,700/month (£32,400/year)
```

**Months 12-18:**
```
Accounting/Legal:        £1,000/month (CFO fractional)
Insurance:               £500/month
Office Space:            £2,000/month (6-person office)
Software/Tools:          £1,000/month
Recruiting:              £3,000/month (more hiring)
Professional Services:   £2,000/month (consultants)
Total:                   £9,500/month (£114,000/year)
```

**Months 18-24:**
```
Accounting/Legal:        £3,000/month (full CFO)
Insurance:               £1,000/month (D&O, cyber)
Office Space:            £5,000/month (12-person office)
Software/Tools:          £2,000/month
Recruiting:              £5,000/month (dedicated recruiter)
Professional Services:   £5,000/month
Total:                   £21,000/month (£252,000/year)
```

---

## 💰 Profitability Analysis

### **Month 6 Projections**

| Item | Monthly | Annual |
|------|---------|--------|
| **Revenue** | £10,500 | £126,000 |
| Infrastructure | (£395) | (£4,740) |
| Personnel | (£2,000) | (£24,000) |
| CAC | (£1,200) | (£14,400) |
| Operating | (£800) | (£9,600) |
| **Net Profit** | **£6,105** | **£73,260** |
| **Profit Margin** | **58.1%** | **58.1%** |

**Analysis:**
- ✅ **Profitable from Month 6!**
- Still running lean (founder + 1 dev)
- Most revenue drops to bottom line
- Can reinvest all profit into growth

---

### **Month 12 Projections**

| Item | Monthly | Annual |
|------|---------|--------|
| **Revenue** | £74,000 | £888,000 |
| Infrastructure | (£2,900) | (£34,800) |
| Personnel | (£10,000) | (£120,000) |
| CAC | (£9,500) | (£114,000) |
| Operating | (£2,700) | (£32,400) |
| **Net Profit** | **£48,900** | **£586,800** |
| **Profit Margin** | **66.1%** | **66.1%** |

**Analysis:**
- ✅ **Highly profitable - £586K/year**
- Team of 3 (founder + 2)
- CAC still low (organic growth working)
- Can fund entire next year of growth from profit

**Key Decision Point:**
- **Option A:** Take profit (£586K) and stay bootstrapped
- **Option B:** Reinvest all profit into growth (hire faster, spend more on ads)
- **Option C:** Raise VC (£1-2M seed) to accelerate 3-5x

---

### **Month 18 Projections**

| Item | Monthly | Annual |
|------|---------|--------|
| **Revenue** | £277,500 | £3,330,000 |
| Infrastructure | (£9,827) | (£117,924) |
| Personnel | (£25,500) | (£306,000) |
| CAC | (£45,000) | (£540,000) |
| Operating | (£9,500) | (£114,000) |
| **Net Profit** | **£187,673** | **£2,252,076** |
| **Profit Margin** | **67.6%** | **67.6%** |

**Analysis:**
- 🔥 **£2.25M annual profit!**
- Team of 6 people
- High margins despite scaling
- **This is when acquisition talks start** (£3.3M ARR threshold)

**Strategic Options:**
- **Path A (Bootstrap):** Keep £2.25M profit, grow organically
- **Path B (VC):** Raise £5-10M Series A at £30-50M valuation
- **Path C (Acquisition):** Entertain offers from Twitch/YouTube (likely £50-100M)

---

### **Month 24 Projections**

| Item | Monthly | Annual |
|------|---------|--------|
| **Revenue** | £740,000 | £8,880,000 |
| Infrastructure | (£25,259) | (£303,108) |
| Personnel | (£65,000) | (£780,000) |
| CAC | (£95,000) | (£1,140,000) |
| Operating | (£21,000) | (£252,000) |
| **Net Profit** | **£533,741** | **£6,404,892** |
| **Profit Margin** | **72.1%** | **72.1%** |

**Analysis:**
- 🚀 **£6.4M annual profit!**
- Team of 12 people
- SaaS margins at scale (70%+)
- **Prime acquisition target** (£8.88M ARR)

**Valuation Scenarios:**
- Conservative (15x ARR): £133M
- Market (20x ARR): £178M
- Growth (25x ARR): £222M
- Strategic (30x ARR): £266M

**Cash in Bank (if bootstrapped entire way):**
- Month 6-12: £586K profit
- Month 12-18: £2,252K profit
- Month 18-24: £6,405K profit
- **Total Profit: £9,243,000** (over 24 months)

---

## 📈 Key Metrics Summary

| Metric | Month 6 | Month 12 | Month 18 | Month 24 |
|--------|---------|----------|----------|----------|
| **MRR** | £10,500 | £74,000 | £277,500 | £740,000 |
| **ARR** | £126K | £888K | £3.33M | £8.88M |
| **Profit/Year** | £73K | £587K | £2.25M | £6.40M |
| **Margin** | 58.1% | 66.1% | 67.6% | 72.1% |
| **Payback Period** | 1.2 months | 1.9 months | 3.6 months | 3.1 months |
| **LTV:CAC** | 60.7x | 51.9x | 45.7x | 81.1x |
| **Team Size** | 2 | 3 | 6 | 12 |
| **Cash Flow** | +£6.1K/mo | +£48.9K/mo | +£187.7K/mo | +£533.7K/mo |

---

## 💎 Bootstrap vs VC vs Acquisition

### **Scenario A: Bootstrap (No Outside Capital)**

**Pros:**
- ✅ Keep 100% ownership
- ✅ No dilution, no board, full control
- ✅ £9.2M profit in 24 months (cash in bank)
- ✅ Can sell for £133M+ and keep all proceeds

**Cons:**
- ⚠️ Slower growth (organic only)
- ⚠️ Competitors could raise VC and outspend you
- ⚠️ Miss market window if streaming market shifts

**Best For:** Solo founder who values control and profit over growth

---

### **Scenario B: Raise VC (Seed + Series A)**

**Seed Round (Month 6):**
- Raise: £1-2M at £8-12M post-money valuation
- Dilution: 12-20% (founder owns 80-88%)
- Use: Hire faster (2-3 devs), scale marketing (£20K/month ads)

**Series A (Month 18):**
- Raise: £5-10M at £40-70M post-money valuation
- Dilution: 10-15% additional (founder owns 68-79%)
- Use: Scale team to 20-30 people, international expansion

**Outcome at Month 24:**
- ARR: £15-20M (3x faster growth)
- Valuation: £300-500M
- Founder ownership: 65-75%
- Founder net worth: £195-375M (on paper)

**Pros:**
- ✅ 3-5x faster growth
- ✅ Compete with well-funded competitors
- ✅ Higher exit valuation (£300M+ vs £133M)
- ✅ Even with dilution, worth more: 70% of £300M = £210M vs 100% of £133M

**Cons:**
- ⚠️ Loss of control (board seats, investor pressure)
- ⚠️ Dilution (own less of the company)
- ⚠️ Higher burn rate (less profitable, need to grow fast)
- ⚠️ Pressure to exit (VCs want liquidity in 5-7 years)

**Best For:** Ambitious founder who wants to maximize valuation and win the market

---

### **Scenario C: Early Acquisition (Month 18)**

**Acquisition at Month 18:**
- ARR: £3.33M
- Valuation: £50-100M (15-30x ARR)
- If bootstrapped: Keep 100% = £50-100M cash
- If raised seed (80% ownership): £40-80M cash

**Pros:**
- ✅ Liquidity event (cash now, not paper gains)
- ✅ De-risk (don't have to scale to $100M ARR)
- ✅ Resources of Twitch/YouTube (scale faster)
- ✅ Retention package (keep working on product)

**Cons:**
- ⚠️ Leave £100M+ on table (could be worth £300M+ in 2 more years)
- ⚠️ Loss of independence
- ⚠️ Bureaucracy and politics at big company

**Best For:** Founder who wants to cash out and join a bigger platform

---

## 🎯 Recommended Strategy: Hybrid Approach

**Phase 1 (Months 0-12): Bootstrap**
- Prove product-market fit
- Reach £888K ARR profitably
- £587K profit = £587K in the bank
- No dilution yet

**Phase 2 (Month 12): Raise Small Seed**
- Raise £1-2M at £10-15M post
- Only 10-15% dilution
- Use capital to 3x growth rate

**Phase 3 (Month 18): Evaluate Options**
- Option A: Acquisition offers (£50-100M)
- Option B: Raise Series A (£5-10M at £50-70M)
- Option C: Stay profitable and bootstrap to £10M ARR

**Why This Works:**
- Maximize optionality (can choose best path at Month 18)
- Prove business works before raising (better terms)
- Keep majority ownership (85-90% after seed)
- Have cash in bank (£587K) as safety net

---

## 🔑 Key Financial Insights

### **1. SaaS Margins Are Incredible**
- 58-72% profit margins
- Infrastructure only 3-4% of revenue
- Scales beautifully (margin improves with scale)

### **2. CAC Payback Is Fast**
- 1-4 month payback periods
- LTV:CAC ratios of 45-81x (amazing!)
- Can afford to spend more on growth

### **3. Profitability Is Achievable**
- Profitable from Month 6 even with 30% conversion
- Don't need VC to survive
- Can bootstrap to £10M ARR

### **4. The Power of Compounding**
- £9.2M profit over 24 months if fully bootstrapped
- That's enough to self-fund next 3-5 years
- No dilution needed

### **5. Acquisition Math**
- At £8.88M ARR, worth £133-266M (15-30x)
- If bootstrapped: Keep 100% = £133-266M
- If raised £2M seed at 85% ownership: £113-226M
- Either way: Generational wealth

---

## 💡 Final Recommendation

**Bootstrap to £888K ARR (Month 12), then decide:**

1. If crushing it and no competition: **Keep bootstrapping**
   - Result: £9.2M profit over 24 months + £133M+ exit

2. If competition emerging: **Raise £1-2M seed**
   - Result: 3x faster growth, £300M+ exit (but own 85%)

3. If Twitch/YouTube offers £75M+ at Month 18: **Take it**
   - Result: Life-changing money now vs betting on future

**The beauty of this model:** You win no matter what path you choose. That's the power of profitability.

---

*Financial projections updated: October 23, 2025*
*Assumptions: GBP currency, UK-based team, conservative growth estimates*
