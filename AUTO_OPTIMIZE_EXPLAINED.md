# Auto-Optimize Feature — Simple Explanation for Clients

## What is Auto-Optimize?

Auto-Optimize is a smart tool that **automatically calculates the minimum monthly fee** your residents need to pay to keep your reserve fund healthy and above zero for the next 30 years.

Instead of you guessing or manually adjusting fees, the system finds the **lowest possible fee** that will:
- ✅ Pay for all future repairs and replacements
- ✅ Keep your reserve fund safe and stable
- ✅ Never go negative or run out of money

---

## How Does It Work? (Simple Version)

Think of it like **adjusting a thermostat** to find the perfect temperature:

1. **Too low?** → Fund runs out of money ❌
2. **Just right?** → Fund stays safe and stable ✓
3. **Too high?** → Residents pay more than needed ❌

**Auto-Optimize finds the "just right" fee automatically.**

---

## Real-World Example

**Your Building:**
- 200 units (apartments)
- Current fee: $50/unit/month
- Large roof replacement needed in year 4: $500,000

**What happens without Auto-Optimize?**
- Year 1: You have $100,000 reserve
- Year 4: Roof replacement hits → Fund drops to -$250,000 (PROBLEM!)
- Residents complain, you need emergency assessment

**What happens with Auto-Optimize?**
- System calculates → needs $68/unit/month instead of $50
- Year 1-3: Money builds up safely
- Year 4: Roof replacement → Fund stays at $100,000+
- No emergencies, residents know fees are fair

---

## What Settings Can You Adjust?

### 1. **Safety Net (minimum balance)**
**What it means:** The lowest amount of money your fund should ever have

**Example:**
- Set Safety Net to $200,000
- Auto-Optimize ensures fund NEVER drops below $200,000
- Gives you a cushion for emergencies

### 2. **Inflation Rate**
**What it means:** How much expenses will increase each year

**Example:**
- Roof costs $500,000 today
- With 3% inflation → costs $549,000 in 5 years
- With 4% inflation → costs $609,000 in 5 years
- Higher inflation = Higher fees needed

### 3. **Maximum Annual Fee Increase**
**What it means:** How much the monthly fee can go up each year

**Example:**
- Without limit: Fee could jump from $50 to $80 (60% increase!) next year
- With 5% limit: Fee can ONLY go to $52.50 next year
- Protects residents from shock price increases

### 4. **Low-Balance Alert**
**What it means:** Highlight years when fund is getting tight (visual warning)

**Example:**
- Set to $300,000
- The system shows in RED any year where balance drops below this
- Helps you see risky periods

---

## Step-by-Step: How Auto-Optimize Calculates

### **The Algorithm (Simple):**

**Step 1: Start searching**
- Lowest possible fee: $0/unit/month
- Highest possible fee: (based on your needs)

**Step 2: Test different fees**
- Try $50/unit → does fund survive 30 years? 
- Try $75/unit → safer? 
- Try $60/unit → still works?
- Narrow down the range...

**Step 3: Get precise**
- The system tests about 50 different fee levels
- Gets very accurate answer (precise to $0.01)

**Step 4: Return the answer**
- "You need $68.42/unit/month"
- This is the minimum that keeps you safe

---

## What the System Calculates Automatically

### **For Each Year, 30 Years Out:**

```
Opening Balance (money you start the year with)
        ↓
+ Monthly Fees Collected (from residents)
        ↓
+ Investment Income (interest on savings)
        ↓
- Scheduled Replacement Expenses
        ↓
= Closing Balance (money left at year-end)
```

**The system ensures:** Closing Balance ≥ Safety Net (every year)

---

## Real Numbers Example

**Your Building Setup:**
- 200 units
- Current reserve: $500,000
- Average annual expenses: $150,000
- Safety Net: $150,000
- Roof replacement (year 5): $300,000
- HVAC replacement (year 12): $200,000

**Auto-Optimize Result:**
```
"Optimal monthly fee: $68.42 per unit"

Year 1:  Start with $500K → End with $850K ✓
Year 2:  Start with $850K → End with $1.2M ✓
Year 3:  Start with $1.2M → End with $1.5M ✓
Year 4:  Start with $1.5M → End with $1.8M ✓
Year 5:  Start with $1.8M → Roof repair -$300K → End with $1.5M ✓
...
Year 30: Start with $3.2M → End with $3.5M ✓

RESULT: Fund NEVER drops below $150K Safety Net ✓
```

---

## Visual: What Happens Over 30 Years

```
Fund Balance Over Time (With Auto-Optimize)

$4M │                                    ╔════════ 
$3M │                                  ╱  
$2M │                            ╔════        
$1M │                    Large ╱  Roof
    │              Expenses╱         ╱  HVAC
$0  ├────────────────────────────────────────────
    └─────────────────────────────────────────────
      Y1  Y5  Y10  Y15  Y20  Y25  Y30

------- = your Safety Net level
↑ Expenses cause dips but fund RECOVERS
✓ Never goes below your safety amount
```

---

## Benefits of Using Auto-Optimize

| Benefit | Why It Matters |
|---------|----------------|
| **Fair Pricing** | Residents pay EXACTLY what's needed, not guessing |
| **No Surprises** | Planned fees prevent emergency assessments |
| **Future Safe** | 30-year projection catches problems early |
| **Flexible Control** | You set safety levels, growth limits |
| **Transparent** | Residents see the math, trust the numbers |
| **Time Saving** | Computer calculates instead of manual guessing |

---

## How to Use It

### **Simple Steps:**

1. **Click "Auto-Optimize" button** in the Monthly Fee Popup
2. **Adjust settings if needed:**
   - Set your minimum safety amount
   - Set max annual increase (e.g., 5% per year)
   - Override inflation if needed
3. **Click Apply**
4. **System shows:** "Optimal fee: $XX.XX/unit/month"
5. **Review the 30-year chart** to see how fund grows safely
6. **Accept or adjust** if you want a higher safety cushion

---

## Common Questions

### **Q: Can I override the Auto-Optimize fee?**
**A:** Yes! The system suggests the minimum, but you can always set it higher for extra safety.

### **Q: What if residents can't afford the calculated fee?**
**A:** You have options:
- Lower the Safety Net (but riskier)
- Spread replacements over more years
- Get funding/loans (special assessment)
- Increase occupancy/units

### **Q: Does it account for big expenses?**
**A:** Yes! You input all replacement items (roof, HVAC, plumbing, etc.) with their expected dates and costs. The system builds these into the 30-year projection.

### **Q: What if my building changes?**
**A:** Upload a new reserve study to recalculate with updated information (new items, different life expectancy, etc.).

### **Q: How accurate is this?**
**A:** The system tests ~50 fee levels, so it's accurate to within $0.01/unit. It's based on real financial modeling used by reserve professionals.

---

## Bottom Line

**Auto-Optimize = Smart Financial Planning**

Instead of:
- ❌ Guessing at fees
- ❌ Discovery emergencies that require assessments
- ❌ Under-funding and risking shortfalls

You get:
- ✅ Calculated, fair fees
- ✅ 30-year predictable planning
- ✅ Peace of mind for your residents and board

**The result:** A well-funded reserve that can handle all planned (and some unplanned) expenses without shocking your residents with surprise assessments.

---

## Questions or Need Help?

If you want to:
- **See the detailed calculations** → Review the year-by-year breakdown table
- **Adjust the safety level** → Change the "Safety Net" amount and recalculate
- **Test different scenarios** → Try different fee levels using the slider
- **Understand specific years** → Click on any year in the chart to see details

---

**Document Version:** 1.0 | **Last Updated:** March 2026
