import fs from "fs";

const ruPath = "./src/locales/ru.json";
const enPath = "./src/locales/en.json";

const ru = JSON.parse(fs.readFileSync(ruPath, "utf8"));
const en = JSON.parse(fs.readFileSync(enPath, "utf8"));

// 1. Help Categories in EN
en.help.categories = [
  {
    title: "1. Core Principles & Rank Tracking",
    items: [
      {
        q: "How does BeRanked determine Behance case rankings?",
        a: "Our automated scraper simulates organic Behance search queries across all native tags attached to your case. The robot scans search result pages in real time to locate the exact position (Page 1–10, positions #1 to #100) of your case."
      },
      {
        q: "Why do tag search positions change constantly?",
        a: "Behance algorithms continuously recalculate project rankings based on fresh views, appreciations, saves, and collection additions. BeRanked tracks these fluctuations 24/7 so you know when a keyword drops and needs optimization."
      },
      {
        q: "Is it safe to use BeRanked with my Behance account?",
        a: "100% Safe. BeRanked operates strictly using publicly accessible case URLs. We never ask for, store, or require your Behance passwords, cookies, or account access."
      }
    ]
  },
  {
    title: "2. Tag Matrix & SEO Optimization",
    items: [
      {
        q: "What are 'High Potential' tags (Rank 11–30)?",
        a: "These are keywords where your project ranks on search pages 2–3. With minor ranking boosts or refreshed engagement, these tags quickly enter the TOP-10, driving the majority of organic search impressions."
      },
      {
        q: "How does 1-Click Multi-Format Tag Export work?",
        a: "The Copy Tags dropdown lets you export tracked keywords formatted specifically for Behance case editor (comma-separated), spreadsheet columns (Excel/Sheets), or social hashtags in one click."
      }
    ]
  },
  {
    title: "3. Plans & Tag Fuel Credits",
    items: [
      {
        q: "What is Tag Fuel and how is it spent?",
        a: "Every automated search scan consumes 1 Tag Fuel credit per checked keyword. You can top up your fuel pack anytime or subscribe to Daily Fresh / Pro Stream for recurring automated checks."
      }
    ]
  }
];

// 2. Privacy Sections in EN
en.privacy.sections = [
  {
    title: "1. General Provisions",
    content: "This Privacy Policy sets forth how BeRanked ('We', 'Operator') collects, uses, and safeguards personal data submitted by users of the https://beranked.domcraft.digital website and service. We strictly adhere to GDPR principles and data privacy laws."
  },
  {
    title: "2. Personal Data We Collect",
    content: "We only collect essential technical and identification information necessary to deliver analytics services: user email address (for authentication and password recovery), hashed credentials, and publicly available URLs of Behance projects submitted for tracking."
  },
  {
    title: "3. Purpose of Processing",
    content: "User data is processed exclusively for account management, service delivery, providing real-time ranking data, processing subscription payments via certified acquiring partners, and customer support."
  },
  {
    title: "4. Data Storage & Protection",
    content: "All data transmission is encrypted via TLS 1.3 / SSL. We do not store raw credit card details or Behance account passwords. Personal data is never sold or transferred to unauthorized third parties."
  },
  {
    title: "5. User Rights",
    content: "Users hold the right to request access to, correction of, or permanent deletion of their personal information at any time by contacting our support team."
  }
];
en.privacy.requisites.support = "Support: dom.craft.digital@gmail.com";

// 3. Refund Policy Sections in EN
en.refund.sections = [
  {
    title: "1. General Refund Terms",
    content: "Customers may request a full refund within 14 calendar days from the date of initial subscription purchase or tag fuel top-up if the software was technically unavailable or failed to perform the declared rank scanning features."
  },
  {
    title: "2. Refund Eligibility Criteria",
    content: "Refunds are granted for duplicate transactions, technical service disruptions lasting over 24 hours, or accidental initial purchases prior to extensive API limit consumption."
  }
];
en.refund.steps = [
  "Send an email to dom.craft.digital@gmail.com from your registered account email.",
  "Specify the transaction date, payment amount, and reason for the refund request.",
  "Our support team will verify the payment and confirm the refund approval within 24 business hours."
];

// 4. Public Offer Sections in EN
en.offer.sections = [
  {
    title: "1. Subject of the Offer",
    content: "The Contractor provides the Customer with cloud-based analytics services for scanning, monitoring, and analyzing search keyword rankings of creative portfolios published on the public Behance network."
  },
  {
    title: "2. Acceptance & Registration",
    content: "Registering an account on the Website or completing a subscription payment constitutes full and unconditional acceptance of all terms contained within this Public Offer."
  },
  {
    title: "3. Rights and Obligations",
    content: "The Contractor undertakes to maintain 99.5% service availability and accurate rank tracking. The Customer agrees not to abuse automated bots or disrupt service operations."
  },
  {
    title: "4. Pricing & Payment Terms",
    content: "Service fees are defined according to current published pricing plans (Daily Fresh, Pro Stream, Fuel Packs). Payments are processed via licensed electronic payment processors."
  }
];
en.offer.requisites.support = "Direct Support: dom.craft.digital@gmail.com";

fs.writeFileSync(enPath, JSON.stringify(en, null, 2), "utf8");
console.log("Legal and Help English sections successfully written!");
