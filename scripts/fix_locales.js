import fs from "fs";

const enPath = "./src/locales/en.json";
const ruPath = "./src/locales/ru.json";

const en = JSON.parse(fs.readFileSync(enPath, "utf8"));
const ru = JSON.parse(fs.readFileSync(ruPath, "utf8"));

// Dashboard Header
en.dashboard.header = {
  viewOnBehance: "View on Behance",
  robotActive: "ROBOT ACTIVE ({{days}}d)",
  tagFuel: "FUEL: {{count}} TAGS",
  shareReport: "Share Report",
  videoGuide: "Video Tour",
  deleteProject: "Delete Project",
  updateBtn: "Update Rankings",
  updateBtnPending: "⏳ Queued",
  updateBtnProcessing: "🤖 Scanning..."
};

// Dashboard Chart
en.dashboard.chart = {
  empty: "Select tags in the matrix below \nto visualize position history",
  proBadge: "Pro",
  historyPaywallTitle: "Position History by Day",
  historyPaywallSubtitle: "14-day position history charts are available on Daily Fresh & Pro Stream plans",
  learnMore: "Learn More",
  showDetailed: "Show Detailed Position History Charts",
  hideDetailed: "Hide Detailed Charts",
  showDetailedSubtitle: "Click to view 14-day ranking changes",
  hideDetailedSubtitle: "Track individual keyword positions over time",
  expandBtn: "▼ Expand",
  collapseBtn: "▲ Collapse",
  noHistory: "History data will appear after several automated checks",
  tagsCount: "{{count}} tags",
  moreTags: "+ {{count}} more tags"
};

// Dashboard Matrix
en.dashboard.matrix = {
  title: "Tag Matrix",
  tagListTitle: "Case Tags Matrix ({{count}})",
  tagListSubtitle: "Live search rankings of your project in Behance search results",
  searchPlaceholder: "Search tags...",
  smartTagsTitle: "Smart tags from case title & niche:",
  smartTagsSubtitle: "Click ＋ or add all at once in 1 click",
  addAllBtn: "⚡ Add All ({{count}})",
  addingAll: "⏳ Adding...",
  addTagBtn: "＋ Add Tag",
  cancelBtn: "✕ Cancel",
  copyDropdown: "Copy Tags",
  copyComma: "Comma-separated (for Behance)",
  copyExcel: "Column for Excel / Sheets",
  copyHashtags: "With hashtags (#branding)",
  copyQuotes: 'In quotes ("tag")',
  copyOnlyTop10: "TOP-10 only (comma-separated)",
  copyTop10Excel: "TOP-10 only (column for Excel)",
  filterAll: "All",
  filterTop10: "🟢 TOP 1–10",
  filterPotential: "🟡 TOP 11–30",
  filterLost: "⚪ Outside TOP-100",
  filterRising: "🚀 Rising",
  inputPlaceholder: "Enter comma-separated tags (e.g. figma, branding, ui/ux)...",
  checkBtn: "Check",
  checkingBtn: "Checking...",
  statusTop: "At the very TOP of Behance search",
  statusPotential: "High potential (Page 1-2)",
  statusLost: "Outside TOP-100 search",
  statusChecking: "Checking rankings...",
  emptyState: "This project has no tracked tags yet",
  emptySearch: "No tags matched your search",
  emptyFilter: "No tags in this category. Switch filter above.",
  copiedTagsToast: "Copied {{count}} tags to clipboard! 📋",
  deleteConfirmTitle: "Delete #{{tag}}?",
  deleteConfirmMsg: "Tag #{{tag}} will no longer be tracked for this project.",
  deleteConfirmBtn: "Delete",
  deleteCancelBtn: "Cancel",
  tagCopiedToast: "Tag #{{tag}} copied!",
  noTagsToCopy: "No tags available to copy"
};

// Dashboard Metrics
en.dashboard.metrics = {
  testedTitle: "Checked {{count}} tags",
  top10Title: "IN TOP-10 (Drive views)",
  top10Subtitle: "Case is on the first search places",
  potentialTitle: "On the approach (11–30 rank)",
  potentialSubtitle: "Close to TOP, high growth potential",
  lostTitle: "Outside search (Not found)",
  lostSubtitle: "No organic search traffic here yet",
  statsViews: "Views",
  statsLikes: "Appreciations",
  statsComments: "Comments",
  statsPrefix: "Behance project stats:"
};

// Sidebar
en.sidebar = {
  monitoredCases: "Monitored Cases",
  newProjectBtn: "＋ New Project",
  addProjectBtn: "＋ Add Project",
  plansBtn: "Plans",
  upgradeBtn: "Upgrade",
  profileBtn: "Personal Account",
  adminBtn: "Admin Panel",
  logoutBtn: "Log Out",
  limitBadge: "Limit Reached"
};

// Footer
en.footer = {
  developed: "Product by DomCraft Digital",
  guides: "Guides & SEO",
  help: "Manual & Help",
  terms: "Offer & Terms",
  privacy: "Privacy Policy",
  refund: "Refund Policy",
  legal: {
    offer: "Offer & Terms",
    privacy: "Privacy Policy",
    refund: "Refund Policy"
  }
};

ru.footer.guides = "Гайды и SEO";

fs.writeFileSync(enPath, JSON.stringify(en, null, 2), "utf8");
fs.writeFileSync(ruPath, JSON.stringify(ru, null, 2), "utf8");
console.log("Locales successfully synchronized!");
