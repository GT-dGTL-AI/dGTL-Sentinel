/**
 * dGTL Sentinel — Reference data pools used by the seed generator.
 * All values are synthetic and used only to produce realistic-looking
 * demo records for a BFSI (life insurance / pension) risk platform.
 */

window.SentinelNameData = {
  firstNamesMale: [
    "Aarav", "Vivaan", "Aditya", "Vihaan", "Arjun", "Reyansh", "Krishna", "Ishaan",
    "Rohan", "Kabir", "Aryan", "Dhruv", "Karan", "Nikhil", "Rahul", "Siddharth",
    "Varun", "Amit", "Sanjay", "Rajesh", "Suresh", "Manoj", "Vikram", "Ashok",
    "Anand", "Deepak", "Gaurav", "Harsh", "Imran", "Farhan", "Zaid", "Sameer",
    "Mohammed", "Aakash", "Naveen", "Prateek", "Rakesh", "Sunil", "Vishal", "Yash",
    "Abhishek", "Tarun", "Nitin", "Pankaj", "Ravi", "Ajay", "Sandeep", "Alok",
    "Jaideep", "Manish", "Gurpreet", "Harpreet", "Jaspreet", "Simranjeet", "Balwinder"
  ],
  firstNamesFemale: [
    "Ananya", "Diya", "Ishita", "Kavya", "Myra", "Saanvi", "Aadhya", "Anika",
    "Riya", "Sneha", "Pooja", "Neha", "Priya", "Kiran", "Meera", "Divya",
    "Shreya", "Nisha", "Rekha", "Sunita", "Anita", "Geeta", "Lata", "Kavita",
    "Swati", "Preeti", "Ritu", "Sarika", "Vandana", "Yamini", "Zara", "Fatima",
    "Ayesha", "Naina", "Simran", "Harleen", "Gurleen", "Manpreet", "Jasleen",
    "Aditi", "Kritika", "Nikita", "Pallavi", "Rashmi", "Shalini", "Tanvi", "Urvashi",
    "Vidya", "Deepika", "Komal", "Radhika", "Sapna", "Trisha"
  ],
  lastNames: [
    "Sharma", "Verma", "Gupta", "Kapoor", "Malhotra", "Chopra", "Mehta", "Shah",
    "Patel", "Reddy", "Rao", "Nair", "Menon", "Iyer", "Krishnan", "Pillai",
    "Joshi", "Desai", "Pandey", "Mishra", "Tiwari", "Dubey", "Saxena", "Agarwal",
    "Bhatt", "Trivedi", "Chauhan", "Rathore", "Bhatia", "Khanna", "Anand", "Bose",
    "Chatterjee", "Banerjee", "Mukherjee", "Ghosh", "Das", "Sengupta", "Sinha", "Roy",
    "Kaur", "Singh", "Gill", "Sandhu", "Chawla", "Ahluwalia", "Khan", "Sheikh",
    "Ansari", "Siddiqui", "Qureshi", "D'Souza", "Fernandes", "Pereira", "Rodrigues", "Coelho"
  ],
  productTypes: [
    { code: "PENSION-ADV", name: "Guaranteed Pension Advantage", category: "Pension" },
    { code: "PENSION-SEC", name: "Secure Retirement Plan", category: "Pension" },
    { code: "ANNUITY-IMM", name: "Immediate Annuity Plus", category: "Annuity" },
    { code: "ANNUITY-DEF", name: "Deferred Annuity Builder", category: "Annuity" },
    { code: "ULIP-WEALTH", name: "Wealth Builder ULIP", category: "ULIP" },
    { code: "TERM-FAMILY", name: "Family Protect Term Plan", category: "Term Life" },
    { code: "ENDOW-SAVE", name: "Assured Savings Endowment", category: "Endowment" },
    { code: "WHOLE-LIFE", name: "Whole Life Assurance", category: "Whole Life" }
  ],
  channels: ["Online Portal", "Mobile App", "Branch Visit", "Call Centre", "Agent-Assisted"],
  transactionTypes: [
    "Withdrawal", "Partial Surrender", "Full Surrender", "Premium Payment",
    "Fund Switch", "Loan Against Policy", "Address Change", "Nominee Change", "Bank Detail Update"
  ],
  cities: [
    { city: "Mumbai", state: "Maharashtra" },
    { city: "Pune", state: "Maharashtra" },
    { city: "Delhi", state: "Delhi" },
    { city: "Gurugram", state: "Haryana" },
    { city: "Bengaluru", state: "Karnataka" },
    { city: "Hyderabad", state: "Telangana" },
    { city: "Chennai", state: "Tamil Nadu" },
    { city: "Kolkata", state: "West Bengal" },
    { city: "Ahmedabad", state: "Gujarat" },
    { city: "Surat", state: "Gujarat" },
    { city: "Jaipur", state: "Rajasthan" },
    { city: "Lucknow", state: "Uttar Pradesh" },
    { city: "Kochi", state: "Kerala" },
    { city: "Chandigarh", state: "Chandigarh" },
    { city: "Indore", state: "Madhya Pradesh" },
    { city: "Nagpur", state: "Maharashtra" },
    { city: "Bhopal", state: "Madhya Pradesh" },
    { city: "Patna", state: "Bihar" },
    { city: "Coimbatore", state: "Tamil Nadu" },
    { city: "Visakhapatnam", state: "Andhra Pradesh" }
  ],
  foreignLocations: [
    { city: "Dubai", state: "UAE" },
    { city: "Singapore", state: "Singapore" },
    { city: "London", state: "United Kingdom" },
    { city: "Toronto", state: "Canada" },
    { city: "Sharjah", state: "UAE" }
  ],
  devices: [
    "iPhone 14 Pro — Safari 17", "iPhone 13 — Sentinel App iOS 4.2", "Samsung Galaxy S23 — Sentinel App Android 4.2",
    "OnePlus 11 — Chrome Mobile", "Windows 11 — Chrome 124", "Windows 10 — Edge 123",
    "MacBook Pro — Safari 17.3", "Redmi Note 12 — Sentinel App Android 4.1",
    "iPad Air — Safari 17", "Windows 11 — Firefox 122", "Vivo V27 — Chrome Mobile",
    "Realme 11 Pro — Sentinel App Android 4.0"
  ],
  analystRoles: ["Risk Analyst", "Senior Reviewer", "Business Admin"],
  scenarioDefs: [
    {
      id: "BEHAVIOURAL_DEVIATION",
      label: "Behavioural Pattern Deviation",
      category: "Behavioural Anomaly"
    },
    {
      id: "IP_DEVICE_CHANGE",
      label: "IP Address / Device Change on Pension Account",
      category: "Access Anomaly"
    },
    {
      id: "UNUSUAL_ACCESS_WITHDRAWAL",
      label: "Unusual Account Access for Withdrawal",
      category: "Access Anomaly"
    },
    {
      id: "STRUCTURED_WITHDRAWALS",
      label: "Structured / Small-Value Withdrawals",
      category: "Structuring Pattern"
    },
    {
      id: "WITHDRAWAL_PATTERN_DEVIATION",
      label: "Withdrawal Pattern Deviation",
      category: "Behavioural Anomaly"
    }
  ]
};
