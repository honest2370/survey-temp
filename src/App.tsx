import { useCallback, useEffect, useMemo, useState } from "react";
import { createClient, type User } from "@supabase/supabase-js";

type Field = { id: string; label: string; type: "text" | "number" | "select"; options?: string[] };
type Group = { name: string; fields: Field[] };
type Section = { id: string; title: string; qRange: string; icon: string; color: string; groups: Group[] };
type Values = Record<string, Record<string, string>>;

const SUPABASE_URL = "https://gavgtimgjwdtioonziwy.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdhdmd0aW1nandkdGlvb256aXd5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAzMTIzMDgsImV4cCI6MjA5NTg4ODMwOH0.EF_K3i1tSUxFBnOJvc4xe8Ixf9AJgEUgCnh4IhVWUh4";
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const CONTACT_NAME = "James Stones";
const CONTACT_PHONE = "+44 1547 528523";
const CONTACT_EMAIL = "james.stones@example.com";
const WHATSAPP_LINK = "https://wa.me/237671328925";
const ADMIN_EMAILS = ["james.stones@example.com", "honesttech237@gmail.com"];

const yesNo = ["Yes", "No"];
const scale = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];
const countries = [
  ["United Kingdom", "GBR", "GBP"], ["United States", "USA", "USD"], ["Canada", "CAN", "CAD"],
  ["Australia", "AUS", "AUD"], ["Germany", "DEU", "EUR"], ["France", "FRA", "EUR"],
  ["Ireland", "IRL", "EUR"], ["India", "IND", "INR"], ["Japan", "JPN", "JPY"],
  ["South Africa", "ZAF", "ZAR"], ["Singapore", "SGP", "SGD"], ["UAE", "ARE", "AED"],
] as const;

const slug = (v: string) => v.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "").slice(0, 54);
const f = (label: string, type: Field["type"] = "text", options?: string[]): Field => ({ id: slug(label), label, type, options });
const group = (name: string, fields: Field[]): Group => ({ name, fields });

// ===== SECTION DATA (abbreviated - all sections present) =====
const sections: Section[] = [
  { id: "personal", title: "Personal Demographics", qRange: "Q52-Q100", icon: "user", color: "violet", groups: [
    group("Identity", [f("Gender", "select", ["Male", "Female", "Non-binary", "Prefer not to say"]), f("Marital Status", "select", ["Single", "Married", "Divorced", "Widowed", "Separated", "Civil Partnership"]), f("Sexual Orientation", "select", ["Heterosexual", "Homosexual", "Bisexual", "Prefer not to say"]), f("Relationship status"), f("Nationality"), f("Immigration status"), f("Were you born in the UK?", "select", yesNo), f("How long have you lived in the UK?", "number"), f("How long at current address?", "number")]),
    group("Household", [f("Number of People in Household", "select", ["1", "2", "3", "4", "5", "6+"]), f("Number of Children Under 18", "number"), f("Number of Adults 18+", "number"), f("Ages of Children"), f("Any dependents?", "select", yesNo), f("Primary decision-maker?", "select", yesNo), f("Head of household?", "select", yesNo)]),
    group("Language", [f("Primary language at home"), f("Other languages")]),
    group("Home", [f("Own or rent?", "select", ["Own", "Rent", "Living with family", "Other"]), f("Property type", "select", ["Detached", "Semi-detached", "Terraced", "Flat", "Bungalow"]), f("Bedrooms", "number"), f("Bathrooms", "number"), f("Garden?", "select", yesNo), f("Garage?", "select", yesNo), f("Driveway?", "select", yesNo), f("Home value", "number"), f("Mortgage?", "select", yesNo), f("Monthly mortgage/rent", "number"), f("Plan to move in 12 months?", "select", yesNo)]),
    group("Physical", [f("Height"), f("Weight"), f("Shoe size"), f("Clothing size"), f("Glasses or contacts?", "select", yesNo), f("Left or right handed?", "select", ["Left-handed", "Right-handed", "Ambidextrous"]), f("Any disabilities?", "select", yesNo), f("Long-term health conditions"), f("Disability under Equality Act 2010?", "select", yesNo), f("Blood type", "select", ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", "Unknown"])]),
    group("Politics Transport Pets", [f("Registered to vote?", "select", yesNo), f("Political party"), f("Voted last General Election?", "select", yesNo), f("EU Referendum vote", "select", ["Remain", "Leave", "Did not vote", "Not eligible"]), f("Political views", "select", ["Left", "Centre-Left", "Centre", "Centre-Right", "Right"]), f("Cars in household", "number"), f("Valid UK driving licence?", "select", yesNo), f("Primary mode of transport"), f("Any pets?"), f("Number of pets", "number")]),
  ]},
  { id: "employment", title: "Employment & Career", qRange: "Q101-Q170", icon: "briefcase", color: "cyan", groups: [
    group("Current Role", [f("Employment status", "select", ["Full-time", "Part-time", "Self-employed", "Unemployed", "Retired", "Student", "Homemaker"]), f("Years in current role", "number"), f("Years with employer", "number"), f("Job title"), f("Department"), f("Industry"), f("Primary job function")]),
    group("Work Arrangement", [f("Work from home?", "select", ["Always", "Sometimes", "Never"]), f("WFH days per week", "number"), f("Hybrid working?", "select", yesNo), f("Working hours", "select", ["9-5", "Shifts", "Flexible"]), f("Hours per week", "number"), f("Work overtime?", "select", yesNo), f("Commute distance (miles)", "number"), f("Commute time (min)", "number"), f("Commute method")]),
    group("Compensation", [f("Annual salary", "number"), f("Hourly rate", "number"), f("Receives bonuses?", "select", yesNo), f("Total annual compensation", "number")]),
    group("Benefits", [f("Trade union member?", "select", yesNo), f("Company pension?", "select", yesNo), f("Private health insurance via work?", "select", yesNo), f("Work benefits")]),
    group("Career & Seniority", [f("Job satisfaction", "select", scale), f("Looking for new job?", "select", yesNo), f("Likely to change jobs (1-10)", "select", scale), f("Seniority", "select", ["Entry", "Mid", "Senior", "Director", "C-Suite"]), f("Years professional experience", "number"), f("Manages team?", "select", yesNo), f("Direct reports", "number"), f("LinkedIn profile?", "select", yesNo), f("Freelances?", "select", yesNo), f("Second job?", "select", yesNo)]),
    group("Organization", [f("Org type", "select", ["PLC", "Ltd", "LLP", "Sole Trader", "Charity", "Public Sector"]), f("Publicly traded?", "select", yesNo), f("Stock symbol"), f("Annual turnover", "number"), f("Profit margin %", "number"), f("Number of locations", "number"), f("International?", "select", yesNo), f("Countries operating in", "number"), f("Primary market"), f("ESG policy?", "select", yesNo), f("Recommend as employer?", "select", yesNo), f("Glassdoor rating")]),
    group("Purchasing", [f("Involved in purchasing?", "select", yesNo), f("Purchasing authority"), f("Purchasing budget"), f("Influences IT purchasing?", "select", yesNo), f("Influences marketing purchasing?", "select", yesNo), f("Influences HR purchasing?", "select", yesNo), f("Work software/tools"), f("Company laptop?", "select", yesNo), f("Company mobile?", "select", yesNo), f("Work OS"), f("Cloud computing?", "select", yesNo), f("Cloud services"), f("Project management tools"), f("CRM software"), f("Accounting software")]),
  ]},
  { id: "education", title: "Education", qRange: "Q171-Q210", icon: "graduate-cap", color: "emerald", groups: [
    group("Higher Education", [f("Highest education level", "select", ["PhD", "Masters", "Bachelors", "A-Levels", "GCSEs", "NVQ", "BTEC", "Other"]), f("Degree subject"), f("University/College"), f("Graduation year", "number"), f("Russell Group?", "select", yesNo), f("Postgraduate degree?", "select", yesNo), f("Professional qualification?", "select", yesNo), f("STEM graduate?", "select", yesNo), f("Scholarship or bursary?", "select", yesNo)]),
    group("Schooling", [f("Private or state school?", "select", ["Private", "State"]), f("Grammar school?", "select", yesNo), f("Free school meals?", "select", yesNo), f("First in family at university?", "select", yesNo), f("Has GCSEs?", "select", yesNo), f("Number of GCSEs", "number"), f("Has A-Levels?", "select", yesNo), f("A-Level subjects"), f("NVQs?", "select", yesNo), f("BTECs?", "select", yesNo)]),
    group("Current & Future", [f("Currently studying?", "select", yesNo), f("Current study subject"), f("Full or part time?", "select", ["Full-time", "Part-time"]), f("Plan further education?", "select", yesNo), f("Student loan debt?", "select", yesNo), f("Student loan amount", "number"), f("Completed apprenticeship?", "select", yesNo), f("Online courses done")]),
    group("Children & Skills", [f("Children in education?", "select", yesNo), f("School type", "select", ["State", "Private", "Grammar", "Home-schooled", "N/A"]), f("Private tuition for children?", "select", yesNo), f("Education spend per year", "number"), f("Educational apps?", "select", yesNo), f("UK education rating (1-10)", "select", scale), f("Teaching qualifications?", "select", yesNo), f("Taught or lectured?", "select", yesNo), f("Foreign languages fluent"), f("Typing speed (WPM)", "number"), f("IT certifications"), f("First aid courses?", "select", yesNo), f("DBS check?", "select", yesNo)]),
  ]},
  { id: "finance", title: "Finance & Banking", qRange: "Q211-Q310", icon: "banknote", color: "amber", groups: [
    group("Banking", [f("Main bank"), f("Multiple bank accounts?", "select", yesNo), f("Banks used"), f("Online banking?", "select", yesNo), f("Mobile banking?", "select", yesNo), f("Check account frequency", "select", ["Daily", "Weekly", "Monthly", "Rarely"]), f("Current account?", "select", yesNo), f("Savings account?", "select", yesNo), f("Savings amount", "number"), f("ISA?", "select", yesNo), f("ISA type", "select", ["Cash", "Stocks & Shares", "Lifetime", "Help to Buy"]), f("Fixed-rate savings?", "select", yesNo), f("Premium bonds?", "select", yesNo)]),
    group("Investments & Pension", [f("Investments?", "select", yesNo), f("Investment types"), f("Investment platform"), f("Total investment value", "number"), f("Risk tolerance", "select", ["Low", "Medium", "High"]), f("Financial adviser?", "select", yesNo), f("Robo-adviser?", "select", yesNo), f("Pension?", "select", yesNo), f("Pension type", "select", ["Workplace", "SIPP", "State", "Multiple"]), f("Pension pot", "number"), f("Planned retirement age", "number")]),
    group("Credit & Debt", [f("Credit card?", "select", yesNo), f("Number of credit cards", "number"), f("Credit card providers"), f("Credit limit", "number"), f("Pay in full monthly?", "select", yesNo), f("Credit score", "select", ["Excellent", "Good", "Fair", "Poor"]), f("Checked credit score?", "select", yesNo), f("Credit reference agency", "select", ["Experian", "Equifax", "TransUnion"]), f("Outstanding loans?", "select", yesNo), f("Loan types"), f("Total debt excl mortgage", "number"), f("BNPL?", "select", yesNo), f("Debt management?", "select", yesNo), f("Bankruptcy?", "select", yesNo), f("Overdraft?", "select", yesNo)]),
    group("Monthly Spending", [f("Budgets monthly?", "select", yesNo), f("Budgeting apps"), f("Weekly groceries", "number"), f("Monthly utilities", "number"), f("Monthly entertainment", "number"), f("Monthly clothing", "number"), f("Monthly dining out", "number"), f("Monthly transport", "number"), f("Monthly childcare", "number")]),
    group("Payments & Crypto", [f("Remittances?", "select", yesNo), f("Money transfer service"), f("Foreign currency accounts?", "select", yesNo), f("Store cards?", "select", yesNo), f("Contactless?", "select", yesNo), f("Mobile wallet", "select", ["Apple Pay", "Google Pay", "Both", "Neither"]), f("PayPal?", "select", yesNo), f("Owns crypto?", "select", yesNo), f("Crypto types"), f("Crypto investment", "number"), f("Digital wallet?", "select", yesNo)]),
    group("Insurance & Benefits", [f("Gov benefits"), f("Child Benefit?", "select", yesNo), f("Tax Credits?", "select", yesNo), f("State pension?", "select", yesNo), f("Donates to charity?", "select", yesNo), f("Charity donation amount", "number"), f("Gift Aid?", "select", yesNo), f("Life insurance?", "select", yesNo), f("Life cover amount", "number"), f("Critical illness cover?", "select", yesNo), f("Income protection?", "select", yesNo), f("Home insurance", "select", ["Buildings", "Contents", "Both", "None"]), f("Car insurance?", "select", yesNo), f("Pet insurance?", "select", yesNo), f("Travel insurance?", "select", yesNo), f("Private health insurance?", "select", yesNo), f("Annual insurance spend", "number"), f("Price comparison site")]),
    group("Net Worth", [f("Help to Buy ISA?", "select", yesNo), f("First-time buyer?", "select", yesNo), f("Buy-to-let properties", "number"), f("Properties owned", "number"), f("REITs?", "select", yesNo), f("Equity release?", "select", yesNo), f("Estimated net worth", "number"), f("Emergency fund?", "select", yesNo), f("Emergency fund months", "number"), f("Payday loan?", "select", yesNo), f("Cashback websites"), f("Has will?", "select", yesNo), f("Power of attorney?", "select", yesNo)]),
  ]},
  { id: "technology", title: "Technology & Devices", qRange: "Q311-Q420", icon: "smartphone", color: "blue", groups: [
    group("Smartphone", [f("Smartphone brand", "select", ["Apple", "Samsung", "Google", "Huawei", "OnePlus", "Xiaomi", "Other"]), f("Model"), f("OS", "select", ["iOS", "Android"]), f("Last purchase date"), f("Price paid", "number"), f("Outright or contract?", "select", ["Outright", "Contract"]), f("Network provider"), f("Monthly bill", "number"), f("Data plan (GB)", "number"), f("5G coverage?", "select", yesNo), f("Wi-Fi calling?", "select", yesNo)]),
    group("Computers & Devices", [f("Tablet?", "select", yesNo), f("Tablet brand", "select", ["Apple iPad", "Samsung", "Amazon Fire", "Microsoft Surface", "Other"]), f("Laptop?", "select", yesNo), f("Laptop brand", "select", ["Apple", "Dell", "HP", "Lenovo", "ASUS", "Acer", "Other"]), f("Desktop?", "select", yesNo), f("PC OS", "select", ["Windows", "macOS", "Linux", "Chrome OS"]), f("Smartwatch", "select", ["Apple Watch", "Samsung", "Fitbit", "Garmin", "None"]), f("Fitness tracker?", "select", yesNo), f("Wireless earbuds", "select", ["AirPods", "Galaxy Buds", "Sony", "Bose", "None"])]),
    group("Home Tech", [f("Smart speaker", "select", ["Amazon Echo", "Google Nest", "Apple HomePod", "None"]), f("Number of smart speakers", "number"), f("Voice assistant", "select", ["Alexa", "Google Assistant", "Siri", "None"]), f("Smart home devices?", "select", yesNo), f("Smart home devices"), f("Doorbell camera?", "select", yesNo), f("Smart thermostat", "select", ["Nest", "Hive", "Tado", "None"]), f("Robot vacuum?", "select", yesNo), f("Gaming console", "select", ["PS5", "Xbox", "Nintendo Switch", "Multiple", "None"]), f("Gaming PC?", "select", yesNo), f("Monthly gaming spend", "number"), f("VR headset", "select", ["Meta Quest", "PlayStation VR", "Valve Index", "None"]), f("Drone?", "select", yesNo), f("E-reader", "select", ["Kindle", "Kobo", "None"]), f("Digital camera?", "select", yesNo)]),
    group("Internet & Privacy", [f("Broadband provider"), f("Broadband speed (Mbps)", "number"), f("Monthly broadband cost", "number"), f("Fibre broadband?", "select", yesNo), f("Satisfied with speed?", "select", yesNo), f("VPN?", "select", yesNo), f("VPN provider", "select", ["NordVPN", "ExpressVPN", "Surfshark", "None"]), f("Home printer?", "select", yesNo), f("Daily phone hours", "number"), f("Daily computer hours", "number"), f("Daily TV hours", "number"), f("Ad blocker?", "select", yesNo), f("Password manager", "select", ["LastPass", "1Password", "Dashlane", "Bitwarden", "None"]), f("Privacy concern (1-10)", "select", scale), f("Cybercrime victim?", "select", yesNo), f("2FA?", "select", yesNo), f("Cloud storage", "select", ["Google Drive", "Dropbox", "iCloud", "OneDrive", "None"])]),
    group("Email & Web", [f("Email provider", "select", ["Gmail", "Outlook", "Yahoo", "iCloud", "ProtonMail"]), f("Number of email addresses", "number"), f("Emails per day", "number"), f("Email filters?", "select", yesNo), f("Newsletter subscriptions?", "select", yesNo), f("Unread emails", "number"), f("Browser", "select", ["Chrome", "Safari", "Firefox", "Edge", "Brave"]), f("Browser extensions?", "select", yesNo), f("Search engine", "select", ["Google", "Bing", "DuckDuckGo", "Yahoo"])]),
    group("AI & Work Tools", [f("AI chatbots", "select", ["ChatGPT", "Gemini", "Claude", "Copilot", "None", "Multiple"]), f("AI usage frequency", "select", ["Daily", "Weekly", "Monthly", "Rarely", "Never"]), f("AI use case"), f("AI concerns?", "select", yesNo), f("Programming?", "select", yesNo), f("Programming languages"), f("MS Office/365?", "select", yesNo), f("Google Workspace?", "select", yesNo), f("Zoom?", "select", yesNo), f("Microsoft Teams?", "select", yesNo), f("Slack?", "select", yesNo), f("Video call frequency", "select", ["Daily", "Weekly", "Monthly", "Rarely", "Never"])]),
    group("Social Media", [f("WhatsApp?", "select", yesNo), f("Telegram?", "select", yesNo), f("Signal?", "select", yesNo), f("Primary messaging app"), f("TikTok?", "select", yesNo), f("TikTok frequency", "select", ["Daily", "Weekly", "Monthly", "Rarely", "Never"]), f("Instagram?", "select", yesNo), f("Instagram frequency", "select", ["Daily", "Weekly", "Monthly", "Rarely", "Never"]), f("Facebook?", "select", yesNo), f("Facebook frequency", "select", ["Daily", "Weekly", "Monthly", "Rarely", "Never"]), f("Twitter/X?", "select", yesNo), f("Snapchat?", "select", yesNo), f("YouTube?", "select", yesNo), f("YouTube hours/week", "number"), f("Reddit?", "select", yesNo), f("Pinterest?", "select", yesNo), f("BeReal?", "select", yesNo), f("Threads?", "select", yesNo), f("Creates content?", "select", yesNo), f("Been influencer?", "select", yesNo), f("Max followers", "number"), f("Dating apps"), f("Social media for work?", "select", yesNo), f("Purchased via social?", "select", yesNo), f("Follows brands on social?", "select", yesNo), f("Unfollowed/blocked brand?", "select", yesNo)]),
  ]},
  { id: "health", title: "Health & Wellness", qRange: "Q421-Q510", icon: "heart", color: "rose", groups: [
    group("General Health", [f("Overall health", "select", ["Excellent", "Good", "Fair", "Poor"]), f("Has GP?", "select", yesNo), f("GP visits per year", "number"), f("NHS dentist?", "select", yesNo), f("Dentist frequency", "select", ["Every 6 months", "Yearly", "Only when needed", "Rarely"]), f("Private healthcare"), f("A&E visit (12mo)?", "select", yesNo), f("Hospitalised (12mo)?", "select", yesNo), f("Surgery (5yr)?", "select", yesNo), f("Prescription meds?", "select", yesNo), f("Prescription spend", "number"), f("Prepayment certificate?", "select", yesNo), f("OTC meds regularly?", "select", yesNo), f("Vitamins/supplements?", "select", yesNo), f("Which vitamins"), f("Allergies?", "select", yesNo), f("Allergy types")]),
    group("Conditions", [f("Asthma?", "select", yesNo), f("Diabetes", "select", ["None", "Type 1", "Type 2"]), f("High blood pressure?", "select", yesNo), f("High cholesterol?", "select", yesNo), f("Heart condition?", "select", yesNo), f("Arthritis?", "select", yesNo), f("Mental health conditions?", "select", yesNo), f("Anxiety?", "select", yesNo), f("Depression?", "select", yesNo), f("MH support (12mo)?", "select", yesNo), f("NHS MH services?", "select", yesNo), f("Private therapy?", "select", yesNo), f("MH monthly spend", "number")]),
    group("Lifestyle", [f("Smoking", "select", ["Yes", "No", "Former smoker"]), f("Cigarettes per day", "number"), f("Vape?", "select", yesNo), f("Alcohol", "select", ["Yes", "No", "Occasionally"]), f("Alcohol units/week", "number"), f("Alcohol preference", "select", ["Beer", "Wine", "Spirits", "Cocktails", "None"]), f("Favourite drink brand"), f("Recreational drugs?", "select", yesNo), f("CBD products?", "select", yesNo)]),
    group("Fitness", [f("Exercise frequency", "select", ["Daily", "3-4 times/week", "1-2 times/week", "Rarely", "Never"]), f("Exercise types"), f("Gym membership?", "select", yesNo), f("Gym name", "select", ["PureGym", "The Gym Group", "David Lloyd", "Nuffield", "Virgin Active", "Other", "None"]), f("Fitness spend", "number"), f("Fitness apps"), f("Tracks steps?", "select", yesNo), f("Avg daily steps", "number"), f("Sports?", "select", yesNo), f("Sports clubs"), f("BMI", "number"), f("Losing weight?", "select", yesNo), f("Diets followed"), f("Vegetarian/Vegan", "select", ["Neither", "Vegetarian", "Vegan", "Flexitarian"]), f("Dietary requirements"), f("Meals/day", "number"), f("Breakfast?", "select", yesNo), f("Meal prep?", "select", yesNo), f("Counts calories?", "select", yesNo), f("Water glasses/day", "number")]),
    group("Sleep & Self-Care", [f("Sleep hours/night", "number"), f("Sleep trouble?", "select", yesNo), f("Sleep aids?", "select", yesNo), f("Sleep tracker?", "select", yesNo), f("Meditation?", "select", yesNo), f("Meditation app", "select", ["Headspace", "Calm", "Insight Timer", "None"]), f("Skincare routine?", "select", yesNo), f("Skincare brands"), f("Skincare spend", "number"), f("Anti-aging?", "select", yesNo), f("Sunscreen daily?", "select", yesNo)]),
    group("Additional Health", [f("Dermatologist?", "select", yesNo), f("Skin conditions"), f("Hair care products?", "select", yesNo), f("Shampoo brand"), f("Cosmetic procedures?", "select", yesNo), f("Contact lenses?", "select", yesNo), f("Last eye test"), f("Hearing issues?", "select", yesNo), f("Hearing aids?", "select", yesNo), f("Had COVID?", "select", yesNo), f("Vaccinated?", "select", yesNo), f("Vaccine doses", "number"), f("Vaccine opinion (1-10)", "select", scale), f("Long COVID?", "select", yesNo), f("Chronic pain?", "select", yesNo), f("Physiotherapy?", "select", yesNo), f("Chiropractic?", "select", yesNo), f("Alternative medicine"), f("Total healthcare spend", "number")]),
  ]},
  { id: "shopping", title: "Shopping & Consumer", qRange: "Q511-Q620", icon: "shopping-bag", color: "pink", groups: [
    group("Online Shopping", [f("Online shopping frequency", "select", ["Daily", "Weekly", "Monthly", "Rarely", "Never"]), f("Monthly online spend", "number"), f("Online retailers"), f("Amazon Prime?", "select", yesNo), f("Monthly Amazon spend", "number"), f("Amazon Fresh?", "select", yesNo), f("eBay?", "select", yesNo), f("Sells on eBay?", "select", yesNo), f("Marketplace apps")]),
    group("Grocery", [f("Primary grocery store", "select", ["Tesco", "Sainsburys", "Asda", "Aldi", "Lidl", "Morrisons", "Waitrose", "MS", "Ocado", "Co-op"]), f("Shopping frequency", "select", ["Daily", "2-3x/week", "Weekly", "Fortnightly"]), f("Online grocery?", "select", yesNo), f("Click & collect?", "select", yesNo), f("Grocery delivery?", "select", yesNo), f("Weekly grocery spend", "number"), f("Loyalty card", "select", ["Tesco Clubcard", "Nectar", "Multiple", "None"]), f("Coupons?", "select", yesNo), f("Cashback apps"), f("Own-brand or branded?", "select", ["Own-brand", "Branded", "Mix"]), f("Organic?", "select", yesNo), f("Fairtrade?", "select", yesNo), f("Local products?", "select", yesNo)]),
    group("Clothing & Beauty", [f("Clothing stores"), f("Clothing frequency", "select", ["Weekly", "Monthly", "Quarterly", "Rarely"]), f("Monthly clothing spend", "number"), f("Second-hand clothing?", "select", yesNo), f("Clothing style"), f("Luxury brands?", "select", yesNo), f("Luxury brands"), f("Beauty brands"), f("Beauty stores"), f("Boots Advantage card?", "select", yesNo), f("Monthly beauty spend", "number"), f("Fragrance"), f("Grooming subscription")]),
    group("Food Delivery & Home", [f("Meal kit delivery", "select", ["HelloFresh", "Gousto", "Mindful Chef", "None"]), f("Food delivery apps"), f("Food delivery frequency", "select", ["Daily", "Weekly", "Monthly", "Rarely", "Never"]), f("Food delivery spend", "number"), f("Subscription boxes?", "select", yesNo), f("Box types"), f("Amazon Subscribe & Save?", "select", yesNo), f("Furniture stores"), f("Bought furniture (12mo)?", "select", yesNo), f("Furniture spend", "number"), f("DIY stores"), f("Home improvements (12mo)?", "select", yesNo), f("Improvement spend", "number")]),
    group("Energy & Utilities", [f("Energy provider"), f("Smart meter?", "select", yesNo), f("Solar panels?", "select", yesNo), f("EV charger at home?", "select", yesNo), f("Energy tariff", "select", ["Fixed", "Variable"]), f("Monthly energy bill", "number"), f("Water meter?", "select", yesNo), f("Water provider"), f("Monthly water bill", "number"), f("TV licence?", "select", yesNo), f("Annual council tax", "number"), f("Council tax band", "select", ["A", "B", "C", "D", "E", "F", "G", "H"])]),
    group("Shopping Behavior", [f("Reviews before buying?", "select", yesNo), f("Review platforms"), f("Which? member?", "select", yesNo), f("Price comparison sites?", "select", yesNo), f("Switched energy (12mo)?", "select", yesNo), f("Lottery?", "select", yesNo), f("Gambling?", "select", yesNo), f("Monthly gambling spend", "number"), f("Betting apps"), f("Black Friday?", "select", yesNo), f("Impulse buyer?", "select", yesNo), f("Payment method", "select", ["Cash", "Card", "Mobile", "Bank transfer"]), f("Self-checkout?", "select", yesNo), f("Scan-as-you-shop?", "select", yesNo), f("Student discounts?", "select", yesNo), f("NHS/Military discounts?", "select", yesNo), f("Buys on finance?", "select", yesNo), f("BNPL (6mo)?", "select", yesNo), f("Biggest purchase (12mo)"), f("Extended warranty?", "select", yesNo), f("Returned online product?", "select", yesNo), f("Reads T&Cs?", "select", yesNo), f("Brand loyalty (1-10)", "select", scale), f("Recommends products?", "select", yesNo), f("Written review?", "select", yesNo), f("Cancelled subscription?", "select", yesNo), f("Auto-renewal?", "select", yesNo), f("Rents instead of buying?", "select", yesNo), f("Refurbished electronics?", "select", yesNo), f("Buys second-hand?", "select", yesNo), f("Second-hand sources"), f("Donates to charity shops?", "select", yesNo), f("Sustainability importance (1-10)", "select", scale)]),
  ]},
  { id: "travel", title: "Travel & Holidays", qRange: "Q621-Q720", icon: "flight-takeoff", color: "teal", groups: [
    group("Holiday Patterns", [f("Holidays/year", "number"), f("International", "number"), f("Domestic (UK)", "number"), f("Holiday type", "select", ["Beach", "City break", "Adventure", "Cruise", "Skiing", "Cultural", "Staycation"]), f("Annual holiday spend", "number"), f("Last destination"), f("Last date"), f("Next planned holiday")]),
    group("Booking", [f("Booking method", "select", ["Online", "Travel agent", "Direct"]), f("Booking platforms"), f("Travel agent?", "select", yesNo), f("Package holidays", "select", ["TUI", "Jet2", "easyJet Holidays", "None"]), f("Accommodation", "select", ["Hotel", "Airbnb", "Holiday cottage", "Camping", "Hostel", "All-inclusive"]), f("Hotel stars", "select", ["3*", "4*", "5*", "No preference"]), f("Airbnb?", "select", yesNo), f("Airbnb frequency", "select", ["Daily", "Weekly", "Monthly", "Rarely", "Never"]), f("Booking advance", "select", ["Last minute", "1-3 months", "3-6 months", "6+ months"])]),
    group("Air Travel", [f("Airlines"), f("Flights/year", "number"), f("Flight class", "select", ["Economy", "Premium Economy", "Business", "First"]), f("Airline loyalty"), f("Avios?", "select", yesNo), f("Travel insurance?", "select", yesNo), f("Insurance type", "select", ["Annual", "Single trip", "None"]), f("Valid passport?", "select", yesNo), f("Passport expiry"), f("Travelled EU since Brexit?", "select", yesNo), f("Countries visited", "number")]),
    group("Transport & Extras", [f("Business travel?", "select", yesNo), f("Airport lounges", "select", ["Priority Pass", "Plaza Premium", "None"]), f("Car hire", "select", ["Hertz", "Enterprise", "Avis", "None"]), f("Ride hailing", "select", ["Uber", "Bolt", "Lyft", "None"]), f("Trains?", "select", yesNo), f("Railcard", "select", ["16-25", "Two Together", "Family", "Senior", "None"]), f("Eurostar?", "select", yesNo), f("Cruise?", "select", yesNo), f("Camping?", "select", yesNo), f("National Trust?", "select", yesNo), f("English Heritage?", "select", yesNo), f("Luggage brand"), f("Travel money card", "select", ["Revolut", "Monzo", "Wise", "None"]), f("Dream destination"), f("Staycation or abroad?", "select", ["Staycation", "Abroad", "Mix"]), f("Duty-free?", "select", yesNo), f("Travel blogs?", "select", yesNo), f("Music festivals"), f("Ski resorts?", "select", yesNo), f("All-inclusive?", "select", yesNo), f("Second home abroad?", "select", yesNo)]),
  ]},
  { id: "automotive", title: "Automotive", qRange: "Q721-Q800", icon: "car", color: "orange", groups: [
    group("Vehicle", [f("Vehicles in household", "number"), f("Primary make", "select", ["BMW", "Mercedes", "Audi", "Volkswagen", "Ford", "Vauxhall", "Toyota", "Honda", "Nissan", "Hyundai", "Kia", "Tesla", "Land Rover", "Other", "N/A"]), f("Model"), f("Year", "number"), f("New or used?", "select", ["New", "Used", "N/A"]), f("Purchase source", "select", ["Dealership", "Private", "Online", "Auction", "N/A"]), f("Fuel type", "select", ["Petrol", "Diesel", "Hybrid", "Electric", "N/A"]), f("Engine size (L)", "number"), f("Colour"), f("Type", "select", ["Hatchback", "Saloon", "SUV", "Estate", "MPV"])]),
    group("Finance & Usage", [f("Finance type", "select", ["PCP", "HP", "Lease", "Cash", "N/A"]), f("Monthly payment", "number"), f("Annual mileage", "number"), f("Daily commute miles", "number"), f("Monthly fuel spend", "number"), f("Fuel purchase location", "select", ["BP", "Shell", "Esso", "Supermarket", "N/A"]), f("Premium fuel?", "select", yesNo), f("Fuel economy importance (1-10)", "select", scale)]),
    group("Insurance & Maintenance", [f("Insurance type", "select", ["Comprehensive", "Third party", "Third party F&T", "N/A"]), f("Insurance provider"), f("Annual premium", "number"), f("Claim (5yr)?", "select", yesNo), f("No-claims years", "number"), f("Breakdown cover", "select", ["AA", "RAC", "Green Flag", "None"]), f("Dashcam?", "select", yesNo), f("Service location", "select", ["Dealership", "Independent", "N/A"]), f("Annual maintenance", "number"), f("MOT due"), f("Failed MOT?", "select", yesNo), f("Tyre brand", "select", ["Michelin", "Bridgestone", "Continental", "Other", "N/A"]), f("Winter tyres?", "select", yesNo)]),
    group("EV & Future", [f("Plans to buy EV?", "select", ["Yes", "No", "Already own"]), f("EV brand interest"), f("EV barrier", "select", ["Cost", "Range", "Charging", "Availability", "None"]), f("Home EV charger?", "select", yesNo), f("Public EV charging?", "select", yesNo), f("EV charging network"), f("Next car plan"), f("Next car budget", "number"), f("Years keep car", "number"), f("Manual/Auto", "select", ["Manual", "Automatic"]), f("Tech importance (1-10)", "select", scale), f("CarPlay/Android Auto?", "select", yesNo), f("Safety features?", "select", yesNo), f("Tow bar?", "select", yesNo), f("Alloy wheels?", "select", yesNo), f("Modified?", "select", yesNo)]),
  ]},
  { id: "entertainment", title: "Entertainment & Media", qRange: "Q801-Q900", icon: "film", color: "purple", groups: [
    group("Streaming", [f("Netflix?", "select", yesNo), f("Prime Video?", "select", yesNo), f("Disney+?", "select", yesNo), f("Sky/NOW", "select", ["Sky Q", "Sky Stream", "NOW TV", "None"]), f("Apple TV+?", "select", yesNo), f("Paramount+?", "select", yesNo), f("ITVX?", "select", yesNo), f("BritBox?", "select", yesNo), f("Number of services", "number"), f("Monthly spend", "number"), f("Primary service"), f("Shares passwords?", "select", yesNo), f("Cancelling any?", "select", yesNo)]),
    group("TV & Film", [f("Live TV?", "select", yesNo), f("Favourite channel", "select", ["BBC One", "ITV", "Channel 4", "Channel 5", "Sky One", "Other"]), f("Daily TV hours", "number"), f("TV genre", "select", ["Drama", "Comedy", "Reality", "Documentary", "Sci-fi", "Crime"]), f("Last show watched"), f("Last film watched"), f("Cinema?", "select", yesNo), f("Cinema frequency", "select", ["Weekly", "Monthly", "Few times/year", "Rarely"]), f("Cinema chain", "select", ["Odeon", "Cineworld", "Vue", "Everyman", "None"])]),
    group("Music & Reading", [f("Listens to music?", "select", yesNo), f("Spotify?", "select", yesNo), f("Apple Music?", "select", yesNo), f("Amazon Music?", "select", yesNo), f("YouTube Music?", "select", yesNo), f("Music genre", "select", ["Pop", "Rock", "Hip-Hop", "Classical", "Jazz", "R&B", "Electronic", "Country", "Indie"]), f("Live music?", "select", yesNo), f("Concerts (12mo)", "number"), f("Podcasts?", "select", yesNo), f("Podcast genres"), f("Radio?", "select", yesNo), f("Radio station"), f("Audiobooks?", "select", yesNo), f("Reads books?", "select", yesNo), f("Books/year", "number"), f("Format", "select", ["Physical", "E-book", "Audiobook", "Mix"]), f("Book genre", "select", ["Fiction", "Non-fiction", "Thriller", "Romance", "Biography", "Self-help", "Fantasy"]), f("Library?", "select", yesNo), f("Newspapers?", "select", yesNo), f("Newspaper", "select", ["The Times", "The Guardian", "The Telegraph", "Daily Mail", "The Sun", "FT", "i", "None"]), f("Magazines?", "select", yesNo)]),
    group("Gaming & Hobbies", [f("Video games?", "select", yesNo), f("Gaming hours/week", "number"), f("Gaming platform"), f("Gaming genre"), f("Online multiplayer?", "select", yesNo), f("Monthly game spend", "number"), f("Twitch?", "select", yesNo), f("Board games?", "select", yesNo), f("Puzzles?", "select", yesNo), f("Theatre?", "select", yesNo), f("Museums?", "select", yesNo), f("Comedy shows?", "select", yesNo), f("Musical instrument?", "select", yesNo), f("Photography?", "select", yesNo), f("Gardens?", "select", yesNo), f("Gardening spend", "number"), f("Cooks as hobby?", "select", yesNo), f("Bakes?", "select", yesNo), f("Cooking shows?", "select", yesNo), f("Collects things?", "select", yesNo), f("Collection items"), f("DIY?", "select", yesNo), f("Volunteering?", "select", yesNo), f("Volunteer hours", "number"), f("Clubs/societies?", "select", yesNo)]),
    group("Sports", [f("Plays sports"), f("Watches live sports?", "select", yesNo), f("Sports watched"), f("Sky Sports?", "select", yesNo), f("TNT Sports?", "select", yesNo), f("DAZN?", "select", yesNo), f("Football team?", "select", yesNo), f("Attends events?", "select", yesNo), f("Ticket spend", "number"), f("Bets on sports?", "select", yesNo)]),
  ]},
  { id: "food", title: "Food & Drink", qRange: "Q901-Q970", icon: "restaurant", color: "red", groups: [
    group("Dining", [f("Favourite cuisine", "select", ["British", "Italian", "Chinese", "Indian", "Mexican", "Japanese", "Thai", "French", "American", "Mediterranean"]), f("Eating out frequency", "select", ["Daily", "2-3x/week", "Weekly", "Monthly", "Rarely", "Never"]), f("Monthly dining spend", "number"), f("Restaurant type", "select", ["Fast food", "Casual dining", "Fine dining", "Pub food", "Mix"]), f("Fast food restaurants"), f("Casual dining restaurants"), f("Fast food frequency", "select", ["Daily", "Weekly", "Monthly", "Rarely", "Never"]), f("Restaurant apps?", "select", yesNo)]),
    group("Coffee & Tea", [f("Coffee?", "select", yesNo), f("Cups/day", "number"), f("Purchase location", "select", ["Home", "Costa", "Starbucks", "Nero", "Pret", "Independent"]), f("Coffee type", "select", ["Latte", "Cappuccino", "Americano", "Espresso", "Flat White"]), f("Coffee machine", "select", ["Nespresso", "DeLonghi", "Tassimo", "Filter", "None"]), f("Weekly coffee spend", "number"), f("Tea?", "select", yesNo), f("Tea type", "select", ["English Breakfast", "Earl Grey", "Green", "Herbal"]), f("Tea brand", "select", ["PG Tips", "Yorkshire Tea", "Twinings", "Tetley", "Other"])]),
    group("Drinks & Food", [f("Fizzy drinks?", "select", yesNo), f("Soft drink brands"), f("Diet versions?", "select", yesNo), f("Energy drinks", "select", ["Red Bull", "Monster", "None"]), f("Water", "select", ["Tap", "Filtered", "Bottled"]), f("Juice/smoothies?", "select", yesNo), f("Protein shakes?", "select", yesNo), f("Meal replacements?", "select", yesNo), f("Ready meals?", "select", yesNo), f("Cooking from scratch?", "select", yesNo), f("Cooking sauces"), f("Frozen food?", "select", yesNo), f("Plant-based alternatives", "select", yesNo)]),
    group("Alcohol & Pubs", [f("Monthly alcohol spend", "number"), f("Wine", "select", ["Red", "White", "Rose", "Sparkling", "None"]), f("Wine bottle budget", "number"), f("Beer?", "select", yesNo), f("Beer brand"), f("Spirits?", "select", yesNo), f("Spirit types"), f("Non-alcoholic alternatives?", "select", yesNo), f("Pubs?", "select", yesNo), f("Pub frequency", "select", ["Daily", "Weekly", "Monthly", "Rarely"]), f("Wetherspoons app?", "select", yesNo), f("Tips at restaurants?", "select", yesNo), f("Tip %", "number")]),
    group("Preferences", [f("Vegetarian/Vegan", "select", ["Neither", "Vegetarian", "Vegan", "Flexitarian"]), f("Food allergy?", "select", yesNo), f("Dietary requirements"), f("Reads labels?", "select", yesNo), f("Nutrition importance (1-10)", "select", scale), f("Snacks"), f("Crisp brand"), f("Chocolate brand"), f("Biscuit brand"), f("Premium/artisan food?", "select", yesNo), f("Farmers markets?", "select", yesNo), f("Meal plan?", "select", yesNo), f("Recipe apps"), f("Cooking YouTube?", "select", yesNo), f("Favourite cereal"), f("Bread brand"), f("Milk alternatives", "select", ["Oat", "Almond", "Soy", "Coconut", "None"]), f("Sweet or savoury?", "select", ["Sweet", "Savoury", "Both"])]),
  ]},
  { id: "opinions", title: "Opinions, Attitudes & Lifestyle", qRange: "Q971-Q1060", icon: "message", color: "sky", groups: [
    group("Life Satisfaction", [f("Life happiness (1-10)", "select", scale), f("Financial satisfaction (1-10)", "select", scale), f("Important UK issue", "select", ["Cost of living", "NHS", "Immigration", "Economy", "Climate change", "Housing", "Crime", "Education"]), f("NHS satisfaction (1-10)", "select", scale), f("Cost of living feeling"), f("Economy optimism", "select", ["Optimistic", "Neutral", "Pessimistic"]), f("UK right direction?", "select", yesNo), f("Immigration policy"), f("Climate policy")]),
    group("Environment", [f("Recycles?", "select", yesNo), f("Environmental consciousness (1-10)", "select", scale), f("Reusable bags?", "select", yesNo), f("Avoids single-use plastics?", "select", yesNo), f("Reduced meat for environment?", "select", yesNo), f("Pay more for sustainable?", "select", yesNo), f("Public transport for carbon?", "select", yesNo), f("Going paperless?", "select", yesNo)]),
    group("Trust & Media", [f("Trust govt (1-10)", "select", scale), f("Trust social media with data (1-10)", "select", scale), f("Trust big tech (1-10)", "select", scale), f("News daily?", "select", yesNo), f("News sources"), f("Trusted news sources"), f("Media biased?", "select", yesNo), f("Political discussion frequency", "select", ["Daily", "Weekly", "Monthly", "Rarely"]), f("Party member?", "select", yesNo), f("Signs petitions?", "select", yesNo), f("Attended protest?", "select", yesNo), f("Political donations?", "select", yesNo), f("AI jobs impact", "select", ["Positive", "Negative", "Neutral"]), f("Data privacy concern?", "select", yesNo), f("Reads privacy policies?", "select", yesNo), f("Opted out cookies?", "select", yesNo), f("Social media harmful to MH?", "select", yesNo), f("Influencer purchase?", "select", yesNo), f("Ads too intrusive?", "select", yesNo), f("Boycotted brand?", "select", yesNo), f("Supports local businesses?", "select", yesNo)]),
    group("Lifestyle", [f("Work-life balance importance (1-10)", "select", scale), f("Stress level", "select", ["Never", "Sometimes", "Often", "Always"]), f("Stress cause", "select", ["Work", "Money", "Health", "Relationships", "Politics", "Other"]), f("Stress management"), f("Self-care?", "select", yesNo), f("Hobby hours/week", "number"), f("Personal goals?", "select", yesNo), f("Planner app?", "select", yesNo), f("Morning/Night owl", "select", ["Morning person", "Night owl", "In between"]), f("Wake time"), f("Bed time"), f("Screen time hours", "number"), f("Digital detox?", "select", yesNo), f("Friends frequency", "select", ["Daily", "Weekly", "Monthly", "Rarely"]), f("Family frequency", "select", ["Daily", "Weekly", "Monthly", "Rarely"]), f("Socialise preference", "select", ["In person", "Video", "Messaging"]), f("Introvert/Extrovert", "select", ["Introvert", "Extrovert", "Ambivert"])]),
    group("Religion & Future", [f("Religious community?", "select", yesNo), f("Service frequency", "select", ["Daily", "Weekly", "Monthly", "Rarely"]), f("Religion importance (1-10)", "select", scale), f("Christmas?", "select", yesNo), f("Easter?", "select", yesNo), f("Christmas spend", "number"), f("Halloween?", "select", yesNo), f("Bonfire Night?", "select", yesNo), f("Valentines?", "select", yesNo), f("Valentines spend", "number"), f("Mothers/Fathers Day?", "select", yesNo), f("Burnout?", "select", yesNo), f("Takes all annual leave?", "select", yesNo), f("Annual leave days", "number"), f("Plans to start business?", "select", yesNo), f("Side hustle?", "select", yesNo), f("Side hustle description"), f("Side hustle income", "number"), f("Self-improvement?", "select", yesNo), f("Has mentor?", "select", yesNo), f("Ambitious?", "select", ["Yes", "No", "Somewhat"]), f("5-year vision")]),
  ]},
];

// ===== PROFILE SECTION (User-specific questions) =====
const profileSection: Section = {
  id: "profile", title: "Profile & Contact", qRange: "Profile", icon: "user", color: "slate", groups: [
    group("Personal Details", [f("First Name"), f("Last Name"), f("UK Number"), f("Zip Code"), f("Postal Code"), f("Address"), f("City"), f("Country"), f("Region"), f("Ethnic Group"), f("County"), f("Password"), f("Date of Birth"), f("Religion"), f("Social Group"), f("Socio Economic Level")]),
    group("Family", [f("Sons DOB"), f("Daughters DOB"), f("Husbands DOB"), f("Email"), f("PayPal Email")]),
    group("Employment", [f("Occupational Status"), f("Organisation Sector"), f("Company Position"), f("Position of Chief Income Earner"), f("Travel Purpose")]),
    group("Organisation", [f("Org Address"), f("Org Post Code"), f("Org Phone No"), f("Org Employee Self"), f("Org Employee All Locations"), f("Org Employee Global"), f("Company Annual Revenue"), f("Company Annual Revenue All Location")]),
    group("Finances", [f("Education Level"), f("Household Annual Income Before Tax"), f("Household Annual Income After Tax"), f("Household Monthly Income"), f("Investable Asset"), f("UK Economic Issues")]),
    group("Services", [f("Mobile Networks"), f("Banks"), f("Insurance Companies"), f("Best Food"), f("Restaurant")]),
    group("Vehicles", [f("Car 1 Make"), f("Car 1 Model"), f("Car 1 Year of Buying"), f("Car 2 Make"), f("Car 2 Model"), f("Car 2 Year of Buying")]),
  ],
};

const allSections = [profileSection, ...sections];

// ===== HELPERS =====
function makeBroadGroups(title: string): Group[] {
  const map: Record<string, string[]> = {
    "Finance & Banking": ["Main bank", "Multiple bank accounts", "Banks used", "Online banking", "Mobile banking", "Check frequency", "Current account", "Savings account", "Savings amount", "ISA", "ISA type", "Fixed-rate savings", "Premium bonds", "Investments", "Investment types", "Investment platform", "Investment value", "Risk tolerance", "Financial adviser", "Robo-adviser", "Pension", "Pension type", "Pension pot", "Retirement age", "Credit card", "Credit cards count", "Credit card providers", "Credit limit", "Pays in full", "Credit score", "Checked credit score", "Credit reference agency", "Outstanding loans", "Loan types", "Total debt excl mortgage", "BNPL", "Debt management", "Bankruptcy", "Overdraft", "Overdraft frequency", "Monthly budget", "Budgeting apps", "Weekly groceries", "Monthly utilities", "Monthly entertainment", "Monthly clothing", "Monthly dining out", "Monthly transport", "Monthly childcare", "Remittances", "Money transfer service", "Foreign currency accounts", "Store cards", "Contactless", "Mobile wallet", "PayPal", "PayPal frequency", "P2P payment", "Cryptocurrency", "Crypto types", "Crypto investment", "Crypto exchange", "Digital wallet", "Government benefits", "Child Benefit", "Tax Credits", "State pension", "Charity donations", "Charity amount", "Gift Aid", "Will", "Power of attorney", "Life insurance", "Life insurance amount", "Critical illness", "Income protection", "Home insurance", "Home insurance provider", "Car insurance", "Car insurance type", "Car insurance provider", "Pet insurance", "Travel insurance", "Private health insurance", "Dental insurance", "Annual insurance spend", "Price comparison", "Insurance claim", "Help to Buy ISA", "First-time buyer", "Buy-to-let", "Properties owned", "REITs", "Equity release", "Net worth", "Emergency fund", "Emergency fund months", "Payday loan", "Cashback websites"],
  };
  const fields = (map[title] ?? []).map((label) => {
    const l = label.toLowerCase();
    if (l.includes("count") || l.includes("number") || l.includes("amount") || l.includes("spend") || l.includes("cost") || l.includes("pot") || l.includes("value") || l.includes("age") || l.includes("score") || l.includes("months")) return f(label, "number");
    if (l.includes("importance") || l.includes("satisfaction") || l.includes("trust") || l.includes("happiness") || l.includes("rating")) return f(label, "select", scale);
    if (l.includes("?") || l.includes(" or ") || l === "vpn") return f(label, "select", yesNo);
    return f(label);
  });
  const chunk = Math.ceil(fields.length / 5);
  return ["Profile", "Ownership", "Spend", "Behaviour", "Preferences"].map((n, i) => group(n, fields.slice(i * chunk, (i + 1) * chunk))).filter((g) => g.fields.length);
}

const remainingSections: Section[] = [["finance", "Finance & Banking", "Q211-Q310", "banknote", "amber"], ["technology", "Technology & Devices", "Q311-Q420", "smartphone", "blue"], ["health", "Health & Wellness", "Q421-Q510", "heart", "rose"], ["shopping", "Shopping & Consumer", "Q511-Q620", "shopping-bag", "pink"], ["travel", "Travel & Holidays", "Q621-Q720", "flight-takeoff", "teal"], ["automotive", "Automotive", "Q721-Q800", "car", "orange"], ["entertainment", "Entertainment & Media", "Q801-Q900", "film", "purple"], ["food", "Food & Drink", "Q901-Q970", "restaurant", "red"], ["opinions", "Opinions, Attitudes & Lifestyle", "Q971-Q1060", "message", "sky"]].map(([id, title, qRange, icon, color]) => ({ id, title, qRange, icon, color, groups: makeBroadGroups(title as string) }));

const allSectionsFull = [...allSections, ...remainingSections];

function randomFor(field: Field, currency: string) {
  if (field.options?.length) return field.options[Math.floor(Math.random() * field.options.length)];
  if (field.type === "number") return String(Math.floor(Math.random() * 900) + 20);
  const l = field.label.toLowerCase();
  if (l.includes("name")) return ["Oliver Bennett", "Amelia Clarke", "James Patel", "Sophie Morgan"][Math.floor(Math.random() * 4)];
  if (l.includes("bank")) return ["Barclays", "HSBC", "Monzo", "NatWest"][Math.floor(Math.random() * 4)];
  if (l.includes("brand")) return ["Apple", "Samsung", "Tesco", "Sony", "Nike"][Math.floor(Math.random() * 5)];
  if (l.includes("spend") || l.includes("salary") || l.includes("budget")) return `${currency} ${Math.floor(Math.random() * 4000 + 50).toLocaleString()}`;
  if (l.includes("frequency")) return ["Daily", "Weekly", "Monthly", "Rarely"][Math.floor(Math.random() * 4)];
  return ["Typical", "Moderate", "None", "Occasionally", "N/A", "London", "Technology", "Family focused"][Math.floor(Math.random() * 8)];
}

// ===== APP =====
function App() {
  const [user, setUser] = useState<User | null>(null);
  const [page, setPage] = useState("dashboard");
  const [drawer, setDrawer] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
  const [countryOpen, setCountryOpen] = useState(false);
  const [resetModal, setResetModal] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [myTempOpen, setMyTempOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [country, setCountry] = useState(() => JSON.parse(localStorage.getItem("pf_country") || JSON.stringify(countries[0])) as string[]);
  const [values, setValues] = useState<Values>(() => JSON.parse(localStorage.getItem("pf_values") || "{}"));
  const [_apiKey] = useState(() => localStorage.getItem("pf_groq") || "");
  const [model, setModel] = useState(() => localStorage.getItem("pf_model") || "llama-3.3-70b-versatile");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [search, setSearch] = useState("");
  const [adminUsers, setAdminUsers] = useState<any[]>([]);
  const [adminLoading, setAdminLoading] = useState(false);
  const [dbSubmissions, setDbSubmissions] = useState<any[]>([]);
  const [submissionsLoading, setSubmissionsLoading] = useState(false);
  const [globalApiKey, setGlobalApiKey] = useState("");
  const [globalModel, setGlobalModel] = useState("llama-3.3-70b-versatile");
  const [userOverrideKey, setUserOverrideKey] = useState(() => localStorage.getItem("pf_override_key") || "");
  const [templates, setTemplates] = useState<any[]>(() => JSON.parse(localStorage.getItem("pf_templates") || "[]"));
  const [templateName, setTemplateName] = useState("");

  const isAdmin = useMemo(() => !!user && ADMIN_EMAILS.includes(user.email || ""), [user]);

  // Listen for My Temp open from drawer
  useEffect(() => {
    const handler = () => setMyTempOpen(true);
    document.addEventListener("openMyTemp", handler);
    return () => document.removeEventListener("openMyTemp", handler);
  }, []);
  const currency = country[2] || "GBP";
  const current = allSectionsFull.find((s) => s.id === page);

  // Effective API key: user override > local > global
  const effectiveApiKey = userOverrideKey || _apiKey || globalApiKey;
  const effectiveModel = model || globalModel;

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data } = supabase.auth.onAuthStateChange((_event, session) => setUser(session?.user ?? null));
    return () => data.subscription.unsubscribe();
  }, []);

  // Load global settings
  useEffect(() => {
    supabase.from("global_settings").select("*").eq("key", "global_api_key").maybeSingle().then(({ data }) => {
      if (data?.value) {
        setGlobalApiKey(data.value.key || "");
        setGlobalModel(data.value.model || "llama-3.3-70b-versatile");
      }
    });
  }, []);

  // Load notifications
  useEffect(() => {
    if (!user) return;
    supabase.from("notifications").select("*").is("read_at", null).order("created_at", { ascending: false }).then(({ data }) => {
      if (data) {
        setNotifications(data);
        setUnreadCount(data.length);
      }
    });
  }, [user]);

  useEffect(() => {
    localStorage.setItem("pf_values", JSON.stringify(values));
    localStorage.setItem("pf_country", JSON.stringify(country));
    localStorage.setItem("pf_groq", _apiKey);
    localStorage.setItem("pf_model", model);
    localStorage.setItem("pf_override_key", userOverrideKey);
    localStorage.setItem("pf_templates", JSON.stringify(templates));
  }, [values, country, _apiKey, model, userOverrideKey, templates]);

  const totals = useMemo(() => {
    const total = allSectionsFull.reduce((sum, s) => sum + s.groups.reduce((gSum, g) => gSum + g.fields.length, 0), 0);
    const filled = Object.values(values).reduce((sum, section) => sum + Object.values(section).filter(Boolean).length, 0);
    return { total, filled, pct: total ? Math.round((filled / total) * 100) : 0 };
  }, [values]);

  const toast = useCallback((message: string) => { setNotice(message); setTimeout(() => setNotice(""), 3200); }, []);

  const setField = useCallback((sectionId: string, fieldId: string, value: string) => {
    setValues((prev) => ({ ...prev, [sectionId]: { ...(prev[sectionId] || {}), [fieldId]: value } }));
  }, []);

  const fillLocal = useCallback((section: Section) => {
    const gen: Record<string, string> = {};
    section.groups.forEach((g) => g.fields.forEach((field) => (gen[field.id] = randomFor(field, currency))));
    setValues((prev) => ({ ...prev, [section.id]: { ...(prev[section.id] || {}), ...gen } }));
    toast(`${section.title} filled with realistic sample data.`);
  }, [currency, toast]);

  const aiFill = useCallback(async (section: Section) => {
    if (!effectiveApiKey) { fillLocal(section); return; }
    setBusy(true);
    try {
      const fields = section.groups.flatMap((g) => g.fields).map((field) => `${field.id}: ${field.label}${field.options ? ` Options: ${field.options.join("/")}` : ""}`);
      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${effectiveApiKey}` },
        body: JSON.stringify({ model: effectiveModel, temperature: 0.8, response_format: { type: "json_object" }, messages: [{ role: "system", content: "Return only valid JSON." }, { role: "user", content: `Country: ${country[0]}. Currency: ${currency}. Fill every field for ${section.title}:\n${fields.join("\n")}` }] }),
      });
      if (!res.ok) throw new Error(`API ${res.status}`);
      const data = await res.json();
      const parsed = JSON.parse(data.choices?.[0]?.message?.content || "{}");
      setValues((prev) => ({ ...prev, [section.id]: { ...(prev[section.id] || {}), ...parsed } }));
      toast(`${section.title} filled by AI.`);
    } catch (error) {
      fillLocal(section);
      toast(`AI failed, used sample data. ${String(error).slice(0, 80)}`);
    } finally { setBusy(false); }
  }, [effectiveApiKey, effectiveModel, country, currency, fillLocal, toast]);

  const fillAll = useCallback(async () => {
    setBusy(true);
    for (const section of allSectionsFull) { if (effectiveApiKey) await aiFill(section); else fillLocal(section); }
    setBusy(false);
    setPage("dashboard");
  }, [effectiveApiKey, aiFill, fillLocal]);

  const copyAll = useCallback(async () => { await navigator.clipboard.writeText(JSON.stringify({ country: country[0], values }, null, 2)); toast("Copied all fields."); }, [country, values, toast]);

  const resetAll = useCallback(() => {
    setValues({});
    localStorage.removeItem("pf_values");
    localStorage.removeItem("pf_templates");
    setTemplates([]);
    toast("All fields and templates reset.");
    setResetModal(false);
    setPage("dashboard");
  }, [toast]);

  const saveToSupabase = useCallback(async () => {
    if (!user) { setAuthOpen(true); toast("Login first."); return; }
    const payload = { user_id: user.id, country: country[0], country_code: country[1], currency, responses: values, updated_at: new Date().toISOString() };
    const { error } = await supabase.from("persona_submissions").upsert(payload, { onConflict: "user_id" });
    if (error) toast(`Save error: ${error.message}`); else toast("Saved to Supabase.");
    // Also ensure user_profile exists
    await supabase.from("user_profiles").upsert({ user_id: user.id, email: user.email, country: country[0], country_code: country[1], last_active: new Date().toISOString() }, { onConflict: "user_id" });
  }, [user, country, currency, values, toast]);

  const exportJson = useCallback(() => {
    const blob = new Blob([JSON.stringify({ country: country[0], generated_at: new Date().toISOString(), values }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a"); link.href = url; link.download = `persona-${country[1]}-${Date.now()}.json`; link.click(); URL.revokeObjectURL(url);
  }, [country, values]);

  const exportPDF = useCallback(() => {
    const w = window.open("", "_blank"); if (!w) return;
    let html = `<html><head><title>Persona Report</title><style>body{font-family:sans-serif;padding:40px;color:#1e293b}h1{color:#6366f1;border-bottom:3px solid #6366f1;padding-bottom:8px}h2{color:#4f46e5;margin-top:32px;border-bottom:1px solid #e2e8f0;padding-bottom:4px}table{width:100%;border-collapse:collapse;margin:12px 0}th{background:#6366f1;color:#fff;padding:8px 12px;text-align:left;font-size:13px}td{padding:6px 12px;border-bottom:1px solid #e2e8f0;font-size:13px}tr:nth-child(even){background:#f8fafc}@media print{body{padding:20px}}</style></head><body>`;
    html += `<h1>Persona Builder Report</h1><p>Country: ${country[0]} | Generated: ${new Date().toLocaleString()}</p>`;
    allSectionsFull.forEach((section) => { const sd = values[section.id] || {}; const ff = Object.entries(sd).filter(([, v]) => v); if (!ff.length) return; html += `<h2>${section.title} (${section.qRange})</h2><table><thead><tr><th>Question</th><th>Answer</th></tr></thead><tbody>`; ff.forEach(([k, v]) => { const field = section.groups.flatMap((g) => g.fields).find((f) => f.id === k); html += `<tr><td><strong>${field?.label || k}</strong></td><td>${v}</td></tr>`; }); html += `</tbody></table>`; });
    html += `</body></html>`; w.document.write(html); w.document.close(); setTimeout(() => w.print(), 500);
  }, [country, values]);

  const importFile = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target?.result as string);
        setValues((prev) => ({ ...prev, ...data }));
        toast(`Imported ${Object.keys(data).length} sections.`);
      } catch { toast("Invalid JSON file."); }
    };
    reader.readAsText(file);
  }, [toast]);

  const importCSV = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const text = ev.target?.result as string;
        const lines = text.split("\n").filter(Boolean);
        const imported: Values = {};
        lines.forEach((line) => {
          const [section, id, value] = line.split(",").map((s) => s.trim());
          if (section && id && value) imported[section] = { ...(imported[section] || {}), [id]: value };
        });
        setValues((prev) => ({ ...prev, ...imported }));
        toast(`Imported ${lines.length} fields from CSV.`);
      } catch { toast("Invalid CSV file."); }
    };
    reader.readAsText(file);
  }, [toast]);

  const saveTemplate = useCallback(() => {
    if (!templateName.trim()) return;
    const filled: Values = {};
    Object.entries(values).forEach(([section, data]) => {
      const f = Object.fromEntries(Object.entries(data).filter(([, v]) => v));
      if (Object.keys(f).length) filled[section] = f;
    });
    setTemplates((prev) => [...prev, { name: templateName, date: new Date().toISOString(), data: filled }]);
    setTemplateName("");
    toast("Template saved!");
  }, [templateName, values, toast]);

  const loadTemplate = useCallback((t: any) => {
    setValues((prev) => ({ ...prev, ...t.data }));
    toast(`Template "${t.name}" loaded.`);
  }, [toast]);

  const deleteTemplate = useCallback((i: number) => {
    setTemplates((prev) => prev.filter((_, idx) => idx !== i));
    toast("Template deleted.");
  }, [toast]);

  // Admin functions
  const loadAdminUsers = useCallback(async () => {
    setAdminLoading(true);
    const { data } = await supabase.from("user_profiles").select("*").order("last_active", { ascending: false });
    if (data) setAdminUsers(data);
    setAdminLoading(false);
  }, []);

  const loadDbSubmissions = useCallback(async () => {
    setSubmissionsLoading(true);
    const { data } = await supabase.from("persona_submissions").select("*").order("updated_at", { ascending: false });
    if (data) setDbSubmissions(data);
    setSubmissionsLoading(false);
  }, []);

  const toggleAdminFlag = useCallback(async (userId: string, field: "is_banned" | "is_suspended" | "ai_disabled", value: boolean) => {
    await supabase.from("admin_users").upsert({ user_id: userId, [field]: value }, { onConflict: "user_id" });
    toast(`User ${field.replace("_", " ")} updated.`);
    loadAdminUsers();
  }, [toast, loadAdminUsers]);

  const saveGlobalApiKey = useCallback(async () => {
    await supabase.from("global_settings").upsert({ key: "global_api_key", value: { key: globalApiKey, provider: "groq", model: globalModel } }, { onConflict: "key" });
    toast("Global API key saved for all users.");
  }, [globalApiKey, globalModel, toast]);

  const sendNotification = useCallback(async (title: string, message: string, type: string, targetUserId: string | null) => {
    await supabase.from("notifications").insert({ title, message, type, target_user_id: targetUserId, created_by: user?.id });
    toast("Notification sent.");
  }, [user, toast]);

  const markNotifRead = useCallback(async (id: string) => {
    await supabase.from("notifications").update({ read_at: new Date().toISOString() }).eq("id", id);
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    setUnreadCount((c) => Math.max(0, c - 1));
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <button className="rounded-lg p-2 hover:bg-slate-100" onClick={() => setDrawer(true)}><span className="text-2xl">☰</span></button>
            <div className="hidden sm:block"><h1 className="text-xl font-black tracking-tight text-indigo-600">Persona Builder</h1><p className="text-xs text-slate-500">{totals.filled}/{totals.total} fields stored</p></div>
          </div>
          <div className="flex-1 mx-4 max-w-md hidden md:block">
            <div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">🔍</span><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search any question..." className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-10 pr-4 text-sm focus:border-indigo-400 focus:outline-none" /></div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setCountryOpen(true)} className="hidden rounded-full bg-indigo-50 px-3 py-1.5 text-sm font-semibold text-indigo-700 sm:block">{country[0]}</button>
            <button onClick={() => setAiOpen(true)} className="rounded-full border border-slate-200 px-3 py-1.5 text-sm font-semibold">AI</button>
            <button onClick={() => { setNotificationsOpen(true); markNotifRead(""); }} className="relative rounded-full border border-slate-200 px-3 py-1.5 text-sm font-semibold">🔔{unreadCount > 0 && <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-xs font-bold text-white">{unreadCount}</span>}</button>
            {isAdmin && <button onClick={() => { setPage("admin"); loadAdminUsers(); loadDbSubmissions(); }} className="rounded-full bg-rose-600 px-3 py-1.5 text-sm font-bold text-white">Admin</button>}
            <button onClick={() => (user ? supabase.auth.signOut() : setAuthOpen(true))} className="rounded-full bg-slate-950 px-4 py-2 text-sm font-bold text-white">{user ? "Logout" : "Login"}</button>
          </div>
        </div>
      </header>

      {drawer && <Drawer page={page} setPage={(p) => { setPage(p); setDrawer(false); }} close={() => setDrawer(false)} isAdmin={isAdmin} />}

      <main className="mx-auto max-w-6xl px-4 pb-28 pt-6">
        {page === "dashboard" && <Dashboard totals={totals} setPage={setPage} fillAll={fillAll} copyAll={copyAll} exportJson={exportJson} exportPDF={exportPDF} saveToSupabase={saveToSupabase} busy={busy} resetAll={() => setResetModal(true)} importAll={() => setImportOpen(true)} openMyTemp={() => setMyTempOpen(true)} />}
        {page === "admin" && isAdmin && <AdminPage users={adminUsers} usersLoading={adminLoading} submissions={dbSubmissions} submissionsLoading={submissionsLoading} values={values} toggleFlag={toggleAdminFlag} loadUsers={loadAdminUsers} loadSubmissions={loadDbSubmissions} globalApiKey={globalApiKey} globalModel={globalModel} setGlobalApiKey={setGlobalApiKey} setGlobalModel={setGlobalModel} saveGlobalApiKey={saveGlobalApiKey} sendNotification={sendNotification} />}
        {current && page !== "admin" && <SectionPage section={current} values={values[current.id] || {}} setField={setField} fill={() => aiFill(current)} copyAll={copyAll} search={search} setSearch={setSearch} />}
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white px-2 pb-5 pt-2 shadow-2xl">
        <div className="mx-auto grid max-w-lg grid-cols-5 gap-1">{["dashboard", "profile", "personal", "employment", "finance"].map((id) => (<button key={id} onClick={() => setPage(id)} className={`rounded-xl px-2 py-2 text-xs font-bold ${page === id ? "bg-indigo-600 text-white" : "text-slate-500"}`}>{id === "dashboard" ? "Home" : allSectionsFull.find((s) => s.id === id)?.title.split(" ")[0]}</button>))}</div>
      </nav>

      {authOpen && <AuthModal close={() => setAuthOpen(false)} country={country} />}
      {aiOpen && <Modal title="AI Settings" close={() => setAiOpen(false)}>
        <label className="text-sm font-bold">Your API Key (override global)</label>
        <input className="mt-2 w-full rounded-xl border border-slate-200 p-3" value={userOverrideKey} onChange={(e) => setUserOverrideKey(e.target.value)} placeholder="Your personal Groq key" />
        <p className="mt-2 text-xs text-slate-500">Leave blank to use global or no key (sample data fallback).</p>
        <label className="mt-4 block text-sm font-bold">Model</label>
        <select className="mt-2 w-full rounded-xl border border-slate-200 p-3" value={model} onChange={(e) => setModel(e.target.value)}><option>llama-3.3-70b-versatile</option><option>llama-3.1-8b-instant</option><option>gemma2-9b-it</option></select>
        <p className="mt-3 text-sm text-slate-500">If no API key is set, sample data is used.</p>
      </Modal>}
      {countryOpen && <Modal title="Choose Country" close={() => setCountryOpen(false)}><div className="grid gap-2">{countries.map((c) => <button key={c[1]} onClick={() => { setCountry([...c]); setCountryOpen(false); }} className={`rounded-xl border p-3 text-left font-semibold ${country[1] === c[1] ? "border-indigo-600 bg-indigo-50 text-indigo-700" : "border-slate-200"}`}>{c[0]} <span className="text-slate-400">{c[2]}</span></button>)}</div></Modal>}
      {resetModal && <Modal title="Reset Everything" close={() => setResetModal(false)}><p className="mb-4 text-sm text-slate-600">This will permanently delete all filled fields and templates. This cannot be undone.</p><button onClick={resetAll} className="w-full rounded-xl bg-red-600 p-3 font-black text-white">Reset All Fields & Templates</button></Modal>}
      {importOpen && <Modal title="Import Questions" close={() => setImportOpen(false)}><p className="mb-4 text-sm text-slate-600">Import data from a JSON or CSV file.</p><label className="block text-sm font-bold">JSON File</label><input type="file" accept=".json" onChange={importFile} className="mt-2 w-full rounded-xl border border-slate-200 p-3" /><label className="mt-4 block text-sm font-bold">CSV File (section,field_id,value)</label><input type="file" accept=".csv" onChange={importCSV} className="mt-2 w-full rounded-xl border border-slate-200 p-3" /></Modal>}
      {myTempOpen && <Modal title="My Templates" close={() => setMyTempOpen(false)}>
        <div className="flex gap-2 mb-4"><input value={templateName} onChange={(e) => setTemplateName(e.target.value)} placeholder="Template name..." className="flex-1 rounded-xl border border-slate-200 p-3" /><button onClick={saveTemplate} className="rounded-xl bg-indigo-600 px-4 py-3 font-bold text-white">Save</button></div>
        {templates.length === 0 && <p className="text-sm text-slate-500">No templates saved yet.</p>}
        <div className="space-y-2 max-h-[50vh] overflow-y-auto">{templates.map((t, i) => <div key={i} className="rounded-xl border border-slate-200 p-3 flex items-center justify-between"><div><p className="font-bold text-sm">{t.name}</p><p className="text-xs text-slate-500">{new Date(t.date).toLocaleDateString()} • {Object.keys(t.data).length} sections</p></div><div className="flex gap-2"><button onClick={() => loadTemplate(t)} className="rounded-lg bg-indigo-100 px-3 py-1 text-xs font-bold text-indigo-700">Load</button><button onClick={() => deleteTemplate(i)} className="rounded-lg bg-red-100 px-3 py-1 text-xs font-bold text-red-700">Del</button></div></div>)}</div>
      </Modal>}
      {notificationsOpen && <Modal title="Notifications" close={() => setNotificationsOpen(false)}>{notifications.length === 0 ? <p className="text-sm text-slate-500">No notifications</p> : <div className="space-y-3 max-h-[50vh] overflow-y-auto">{notifications.map((n) => <div key={n.id} className="rounded-xl border border-slate-200 p-4"><div className="flex justify-between"><p className="font-bold text-sm">{n.title}</p><button onClick={() => markNotifRead(n.id)} className="text-xs text-indigo-600 font-bold">Mark read</button></div><p className="text-sm text-slate-600 mt-1">{n.message}</p><p className="text-xs text-slate-400 mt-2">{new Date(n.created_at).toLocaleString()}</p></div>)}</div>}</Modal>}
      {notice && <div className="fixed bottom-24 right-4 z-50 max-w-sm rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white shadow-xl">{notice}</div>}
    </div>
  );
}

// ===== COMPONENTS =====
function Dashboard({ totals, setPage, fillAll, copyAll, exportJson, exportPDF, saveToSupabase, busy, resetAll, importAll, openMyTemp }: { totals: { total: number; filled: number; pct: number }; setPage: (p: string) => void; fillAll: () => void; copyAll: () => void; exportJson: () => void; exportPDF: () => void; saveToSupabase: () => void; busy: boolean; resetAll: () => void; importAll: () => void; openMyTemp: () => void }) {
  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] bg-slate-950 p-8 text-white">
        <p className="text-sm font-bold uppercase tracking-[0.3em] text-indigo-300">Persona Builder</p>
        <h2 className="mt-4 max-w-3xl text-4xl font-black tracking-tight sm:text-6xl">All topics, every field stored, AI can fill them.</h2>
        <div className="mt-8 h-3 rounded-full bg-white/10"><div className="h-3 rounded-full bg-indigo-400" style={{ width: `${totals.pct}%` }} /></div>
        <p className="mt-3 text-sm text-slate-300">{totals.filled}/{totals.total} fields filled</p>
      </section>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{allSectionsFull.map((s) => <button key={s.id} onClick={() => setPage(s.id)} className="rounded-3xl border border-slate-200 bg-white p-5 text-left transition hover:-translate-y-1 hover:shadow-lg"><p className="text-xs font-bold text-indigo-600">{s.qRange}</p><h3 className="mt-2 text-xl font-black">{s.title}</h3><p className="mt-2 text-sm text-slate-500">{s.groups.reduce((a, g) => a + g.fields.length, 0)} stored fields</p></button>)}</div>
      <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6"><button onClick={fillAll} disabled={busy} className="rounded-2xl bg-indigo-600 p-4 font-black text-white disabled:opacity-50">{busy ? "Filling..." : "Fill All"}</button><button onClick={copyAll} className="rounded-2xl border border-slate-200 bg-white p-4 font-black">Copy JSON</button><button onClick={exportJson} className="rounded-2xl border border-slate-200 bg-white p-4 font-black">Export JSON</button><button onClick={exportPDF} className="rounded-2xl border border-slate-200 bg-white p-4 font-black">Export PDF</button><button onClick={saveToSupabase} className="rounded-2xl bg-emerald-600 p-4 font-black text-white">Save DB</button><button onClick={importAll} className="rounded-2xl border border-slate-200 bg-white p-4 font-black">Import</button></div>
      <div className="grid gap-3 sm:grid-cols-2"><button onClick={resetAll} className="rounded-2xl border-2 border-red-200 bg-red-50 p-4 font-black text-red-600 hover:bg-red-100">🗑 Reset All Fields</button><button onClick={openMyTemp} className="rounded-2xl border border-slate-200 bg-white p-4 font-black">📋 My Templates</button></div>
      <footer className="rounded-3xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-600">Built by <span className="font-black text-indigo-600">HonestTech©️</span> • Contact {CONTACT_NAME} {CONTACT_PHONE} {CONTACT_EMAIL} • <a href={WHATSAPP_LINK} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center rounded-full bg-emerald-600 p-3 text-white hover:bg-emerald-700 transition ml-2" aria-label="WhatsApp"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12.004 2c-5.523 0-10.004 4.477-10.004 10.004 0 1.773.463 3.49 1.335 5.005L2 22l5.106-1.335c1.467.805 3.127 1.239 4.894 1.239 5.523 0 10.004-4.477 10.004-10.004S17.527 2 12.004 2zm0 18.238c-1.54 0-3.047-.413-4.37-1.19l-.313-.187-3.273.857.875-3.187-.203-.323c-.875-1.39-1.335-3.005-1.335-4.67 0-4.75 3.867-8.617 8.617-8.617 4.75 0 8.617 3.867 8.617 8.617s-3.867 8.617-8.617 8.617zm4.733-6.463c-.26-.13-1.54-.76-1.777-.847-.24-.087-.413-.13-.587.13-.173.26-.673.847-.823 1.017-.15.173-.3.193-.56.063-.26-.13-1.097-.403-2.09-1.287-.773-.69-1.297-1.54-1.45-1.8-.15-.26-.017-.4.113-.533.12-.12.26-.3.39-.463.13-.163.173-.28.26-.463.087-.183.043-.343-.023-.483-.063-.13-.587-1.417-.807-1.947-.213-.517-.433-.45-.587-.457-.15-.007-.323-.007-.493-.007-.173 0-.453.063-.69.323-.24.26-.91.89-.91 2.173 0 1.283.933 2.523 1.063 2.693.13.173 1.833 2.8 4.443 3.927.623.27 1.11.43 1.49.55.633.2 1.21.173 1.667.107.51-.077 1.54-.63 1.76-1.243.22-.613.22-1.14.153-1.243-.063-.103-.233-.163-.493-.293z"/></svg></a></footer>
    </div>
  );
}

function SectionPage({ section, values, setField, fill, copyAll, search, setSearch }: { section: Section; values: Record<string, string>; setField: (s: string, f: string, v: string) => void; fill: () => void; copyAll: () => void; search: string; setSearch: (s: string) => void }) {
  const visibleGroups = section.groups.map((g) => ({ ...g, fields: g.fields.filter((field) => field.label.toLowerCase().includes(search.toLowerCase())) })).filter((g) => g.fields.length);
  const total = section.groups.reduce((a, g) => a + g.fields.length, 0);
  const filled = Object.values(values).filter(Boolean).length;
  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 rounded-3xl bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div><p className="text-sm font-bold text-indigo-600">{section.qRange}</p><h2 className="text-3xl font-black">{section.title}</h2><p className="text-sm text-slate-500">{filled}/{total} fields filled</p></div>
        <div className="flex gap-2"><button onClick={fill} className="rounded-xl bg-indigo-600 px-4 py-3 font-black text-white">AI Fill</button><button onClick={copyAll} className="rounded-xl border border-slate-200 px-4 py-3 font-black">Copy</button></div>
      </div>
      <input value={search} onChange={(e) => setSearch(e.target.value)} className="w-full rounded-2xl border border-slate-200 bg-white p-4" placeholder="Search questions in this page..." />
      {visibleGroups.map((g) => <section key={g.name} className="rounded-3xl border border-slate-200 bg-white p-5"><h3 className="mb-4 text-sm font-black uppercase tracking-wider text-slate-500">{g.name}</h3><div className="grid gap-4 md:grid-cols-2">{g.fields.map((field) => <label key={field.id} className="block"><span className="mb-1 block text-sm font-bold text-slate-700">{field.label}</span>{field.type === "select" ? <select value={values[field.id] || ""} onChange={(e) => setField(section.id, field.id, e.target.value)} className="w-full rounded-xl border border-slate-200 p-3"><option value="">Select...</option>{field.options?.map((option) => <option key={option}>{option}</option>)}</select> : <input type={field.type} value={values[field.id] || ""} onChange={(e) => setField(section.id, field.id, e.target.value)} className="w-full rounded-xl border border-slate-200 p-3" />}</label>)}</div></section>)}
    </div>
  );
}

function AdminPage({ users, usersLoading, submissions, submissionsLoading, values, toggleFlag, loadUsers, loadSubmissions, globalApiKey, globalModel, setGlobalApiKey, setGlobalModel, saveGlobalApiKey, sendNotification }: { users: any[]; usersLoading: boolean; submissions: any[]; submissionsLoading: boolean; values: Values; toggleFlag: (uid: string, f: "is_banned" | "is_suspended" | "ai_disabled", v: boolean) => void; loadUsers: () => void; loadSubmissions: () => void; globalApiKey: string; globalModel: string; setGlobalApiKey: (k: string) => void; setGlobalModel: (m: string) => void; saveGlobalApiKey: () => void; sendNotification: (title: string, msg: string, type: string, userId: string | null) => void }) {
  const [tab, setTab] = useState<"users" | "submissions" | "global" | "notify" | "search">("users");
  const [aSearch, setASearch] = useState("");
  const [selectedSub, setSelectedSub] = useState<string | null>(null);
  const [notifTitle, setNotifTitle] = useState("");
  const [notifMsg, setNotifMsg] = useState("");
  const [notifTarget, setNotifTarget] = useState<string | null>(null);
  const [notifType, setNotifType] = useState("info");

  const exportPDF = () => {
    const w = window.open("", "_blank"); if (!w) return;
    let html = `<html><head><title>Report</title><style>body{font-family:sans-serif;padding:40px}h1{color:#6366f1;border-bottom:3px solid #6366f1;padding-bottom:8px}h2{color:#4f46e5;margin-top:32px;border-bottom:1px solid #e2e8f0}table{width:100%;border-collapse:collapse;margin:12px 0}th{background:#6366f1;color:#fff;padding:8px;text-align:left}td{padding:6px;border-bottom:1px solid #e2e8f0}</style></head><body><h1>Persona Builder Report</h1><p>Generated: ${new Date().toLocaleString()}</p>`;
    allSectionsFull.forEach((section) => { const sd = values[section.id] || {}; const ff = Object.entries(sd).filter(([, v]) => v); if (!ff.length) return; html += `<h2>${section.title}</h2><table><thead><tr><th>Question</th><th>Answer</th></tr></thead><tbody>`; ff.forEach(([k, v]) => { const field = section.groups.flatMap((g) => g.fields).find((f) => f.id === k); html += `<tr><td><strong>${field?.label || k}</strong></td><td>${v}</td></tr>`; }); html += `</tbody></table>`; });
    html += `</body></html>`; w.document.write(html); w.document.close(); setTimeout(() => w.print(), 500);
  };

  const allFields = useMemo(() => {
    const result: Array<{ section: string; qRange: string; id: string; label: string; value: string }> = [];
    allSectionsFull.forEach((section) => { const sd = values[section.id] || {}; section.groups.forEach((group) => { group.fields.forEach((field) => { const val = sd[field.id] || ""; if (val || aSearch) result.push({ section: section.title, qRange: section.qRange, id: field.id, label: field.label, value: val }); }); }); });
    return result;
  }, [values, aSearch]);

  const filteredFields = aSearch ? allFields.filter((f) => f.label.toLowerCase().includes(aSearch.toLowerCase()) || f.value.toLowerCase().includes(aSearch.toLowerCase()) || f.section.toLowerCase().includes(aSearch.toLowerCase())) : allFields.filter((f) => f.value);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-3xl bg-slate-950 p-6 text-white sm:flex-row sm:items-center sm:justify-between">
        <div><p className="text-sm font-bold uppercase tracking-[0.2em] text-rose-300">Admin Panel</p><h2 className="text-3xl font-black">Manage Everything</h2></div>
        <div className="flex gap-2"><button onClick={exportPDF} className="rounded-xl bg-emerald-600 px-4 py-3 font-black text-white">Export PDF</button><button onClick={() => { loadUsers(); loadSubmissions(); }} className="rounded-xl border border-slate-600 px-4 py-3 font-bold text-white">Refresh</button></div>
      </div>
      <div className="flex gap-2 rounded-2xl bg-white p-2 shadow-sm overflow-x-auto">{(["users", "submissions", "global", "notify", "search"] as const).map((t) => (<button key={t} onClick={() => setTab(t)} className={`flex-1 min-w-[80px] rounded-xl px-4 py-3 text-sm font-bold capitalize transition ${tab === t ? "bg-rose-600 text-white" : "text-slate-500 hover:bg-slate-100"}`}>{t}{t === "submissions" ? ` (${submissions.length})` : ""}</button>))}</div>

      {tab === "users" && <div className="space-y-4">{usersLoading ? <p className="text-center text-slate-500">Loading...</p> : users.length === 0 ? <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center"><p className="font-bold text-slate-400">No users yet</p><p className="text-sm text-slate-400 mt-2">Users appear after first save to Supabase.</p></div> : <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{users.map((u) => (<div key={u.user_id} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"><p className="font-bold">{u.email || u.user_id.slice(0, 12)}...</p><p className="text-xs text-slate-400 mt-1">Last active: {u.last_active ? new Date(u.last_active).toLocaleDateString() : "N/A"} • Country: {u.country || "N/A"}</p><div className="mt-4 space-y-2"><button onClick={() => toggleFlag(u.user_id, "is_banned", !u.is_banned)} className={`w-full rounded-xl px-4 py-2 text-sm font-bold ${u.is_banned ? "bg-red-600 text-white" : "bg-slate-100"}`}>{u.is_banned ? "✓ Banned" : "Ban User"}</button><button onClick={() => toggleFlag(u.user_id, "is_suspended", !u.is_suspended)} className={`w-full rounded-xl px-4 py-2 text-sm font-bold ${u.is_suspended ? "bg-amber-600 text-white" : "bg-slate-100"}`}>{u.is_suspended ? "✓ Suspended" : "Suspend User"}</button><button onClick={() => toggleFlag(u.user_id, "ai_disabled", !u.ai_disabled)} className={`w-full rounded-xl px-4 py-2 text-sm font-bold ${u.ai_disabled ? "bg-slate-800 text-white" : "bg-slate-100"}`}>{u.ai_disabled ? "✓ AI Disabled" : "Disable AI"}</button></div></div>))}</div>}</div>}

      {tab === "submissions" && <div className="space-y-4">{submissionsLoading ? <p className="text-center text-slate-500">Loading...</p> : submissions.length === 0 ? <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center"><p className="font-bold text-slate-400">No submissions</p></div> : submissions.map((sub) => (<div key={sub.user_id} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"><div className="flex items-center justify-between"><div><p className="font-bold">User: {sub.user_id.slice(0, 12)}...</p><p className="text-sm text-slate-500">Country: {sub.country || "N/A"} • Updated: {sub.updated_at ? new Date(sub.updated_at).toLocaleString() : "N/A"}</p></div><button onClick={() => setSelectedSub(selectedSub === sub.user_id ? null : sub.user_id)} className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-bold text-white">{selectedSub === sub.user_id ? "Hide" : "View Data"}</button></div>{selectedSub === sub.user_id && sub.responses && <div className="mt-4 space-y-4 max-h-[60vh] overflow-y-auto pr-2">{allSectionsFull.map((section) => { const sd = sub.responses[section.id] || {}; const ff = Object.entries(sd).filter(([, v]) => v); if (!ff.length) return null; return (<div key={section.id} className="rounded-2xl border border-slate-100 bg-slate-50 p-4"><h4 className="font-bold text-indigo-600 text-sm">{section.title}</h4><div className="mt-2 grid gap-1 sm:grid-cols-2">{ff.map(([key, val]) => { const field = section.groups.flatMap((g) => g.fields).find((f) => f.id === key); return (<div key={key} className="flex flex-col text-sm"><span className="font-semibold text-slate-600 text-xs">{field?.label || key}</span><span className="text-slate-900">{String(val)}</span></div>); })}</div></div>); })}</div>}</div>))}</div>}

      {tab === "global" && <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <h3 className="text-xl font-black">Global API Settings (All Users)</h3>
        <label className="block text-sm font-bold">Global Groq API Key</label>
        <input value={globalApiKey} onChange={(e) => setGlobalApiKey(e.target.value)} className="w-full rounded-xl border border-slate-200 p-3" placeholder="gsk_..." />
        <label className="block text-sm font-bold">Global Model</label>
        <select value={globalModel} onChange={(e) => setGlobalModel(e.target.value)} className="w-full rounded-xl border border-slate-200 p-3"><option>llama-3.3-70b-versatile</option><option>llama-3.1-8b-instant</option><option>gemma2-9b-it</option></select>
        <button onClick={saveGlobalApiKey} className="rounded-xl bg-indigo-600 px-6 py-3 font-black text-white">Save for All Users</button>
        <p className="text-sm text-slate-500">Users can override this with their own API key in AI Settings.</p>
      </div>}

      {tab === "notify" && <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <h3 className="text-xl font-black">Send Notification</h3>
        <label className="block text-sm font-bold">Title</label>
        <input value={notifTitle} onChange={(e) => setNotifTitle(e.target.value)} className="w-full rounded-xl border border-slate-200 p-3" placeholder="Notification title" />
        <label className="block text-sm font-bold">Message</label>
        <textarea value={notifMsg} onChange={(e) => setNotifMsg(e.target.value)} className="w-full rounded-xl border border-slate-200 p-3" rows={4} placeholder="Notification message" />
        <label className="block text-sm font-bold">Type</label>
        <select value={notifType} onChange={(e) => setNotifType(e.target.value)} className="w-full rounded-xl border border-slate-200 p-3"><option value="info">Info</option><option value="warning">Warning</option><option value="success">Success</option><option value="error">Error</option></select>
        <label className="block text-sm font-bold">Target User (leave blank for all)</label>
        <select value={notifTarget || ""} onChange={(e) => setNotifTarget(e.target.value || null)} className="w-full rounded-xl border border-slate-200 p-3"><option value="">All Users</option>{users.map((u) => <option key={u.user_id} value={u.user_id}>{u.email || u.user_id.slice(0, 12)}</option>)}</select>
        <button onClick={() => { sendNotification(notifTitle, notifMsg, notifType, notifTarget); setNotifTitle(""); setNotifMsg(""); }} className="rounded-xl bg-indigo-600 px-6 py-3 font-black text-white">Send Notification</button>
      </div>}

      {tab === "search" && <div className="space-y-4">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <input value={aSearch} onChange={(e) => setASearch(e.target.value)} className="w-full rounded-2xl border border-slate-200 p-4 text-lg font-medium" placeholder="Search any question or answer across all sections..." />
          <p className="mt-2 text-sm text-slate-500">{filteredFields.length} results {aSearch ? `for "${aSearch}"` : "(answered fields)"}</p>
        </div>
        {filteredFields.length === 0 ? <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center"><p className="font-bold text-slate-400">No results</p></div> : <div className="space-y-2">{filteredFields.map((field, i) => (<div key={i} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><div className="flex items-start justify-between gap-4"><div className="flex-1 min-w-0"><p className="font-bold text-slate-900 text-sm">{field.label}</p>{field.value ? <p className="mt-1 text-slate-600 text-sm break-words">{field.value}</p> : <p className="mt-1 text-slate-400 text-sm italic">Not filled</p>}</div><span className="shrink-0 rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-600 whitespace-nowrap">{field.qRange}</span></div><p className="mt-2 text-xs text-slate-400">{field.section}</p></div>))}</div>}
      </div>}
    </div>
  );
}

function Drawer({ page, setPage, close, isAdmin }: { page: string; setPage: (p: string) => void; close: () => void; isAdmin: boolean }) {
  const items = [{ id: "dashboard", title: "Dashboard", qRange: "Home" }, ...(isAdmin ? [{ id: "admin", title: "Admin Panel", qRange: "Manage" }] : []), { id: "myTemp", title: "My Templates", qRange: "Saved" }, ...allSectionsFull];
  return <div className="fixed inset-0 z-50"><button className="absolute inset-0 bg-slate-950/40" onClick={close} /><aside className="relative h-full w-80 overflow-y-auto bg-white p-4 shadow-2xl"><h2 className="mb-4 text-2xl font-black text-indigo-600">Persona Builder</h2>{items.map((item) => <button key={item.id} onClick={() => { if (item.id === "myTemp") { setPage("dashboard"); close(); setTimeout(() => document.dispatchEvent(new CustomEvent("openMyTemp")), 100); } else { setPage(item.id); close(); } }} className={`mb-2 w-full rounded-2xl p-3 text-left font-bold ${page === item.id ? "bg-indigo-600 text-white" : "hover:bg-slate-100"}`}><span className="block text-xs opacity-70">{item.qRange}</span>{item.title}</button>)}</aside></div>;
}

function Modal({ title, close, children }: { title: string; close: () => void; children: React.ReactNode }) {
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4"><div className="max-h-[88vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl"><div className="mb-4 flex items-center justify-between"><h2 className="text-2xl font-black">{title}</h2><button onClick={close} className="rounded-full bg-slate-100 px-3 py-1 font-black">✕</button></div>{children}</div></div>;
}

function AuthModal({ close, country }: { close: () => void; country: readonly string[] }) {
  const [email, setEmail] = useState(""); const [password, setPassword] = useState(""); const [mode, setMode] = useState<"login" | "signup">("login"); const [error, setError] = useState("");
  const submit = async () => { const result = mode === "login" ? await supabase.auth.signInWithPassword({ email, password }) : await supabase.auth.signUp({ email, password, options: { data: { country: country[0], country_code: country[1] } } }); if (result.error) setError(result.error.message); else close(); };
  return <Modal title={mode === "login" ? "Login" : "Sign Up"} close={close}><div className="flex gap-2"><button onClick={() => setMode("login")} className={`flex-1 rounded-xl p-3 font-black ${mode === "login" ? "bg-indigo-600 text-white" : "bg-slate-100"}`}>Login</button><button onClick={() => setMode("signup")} className={`flex-1 rounded-xl p-3 font-black ${mode === "signup" ? "bg-indigo-600 text-white" : "bg-slate-100"}`}>Sign Up</button></div><input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="mt-4 w-full rounded-xl border border-slate-200 p-3" /><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className="mt-3 w-full rounded-xl border border-slate-200 p-3" /><button onClick={submit} className="mt-4 w-full rounded-xl bg-slate-950 p-3 font-black text-white">Continue</button>{error && <p className="mt-3 text-sm font-semibold text-red-600">{error}</p>}</Modal>;
}

export default App;
