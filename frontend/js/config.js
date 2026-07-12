export const CONFIG = {
  appName: "Private Connections",
  version: "1.0.0",

  endpoint:
    "https://script.google.com/macros/s/AKfycbzfjkNOdkJjQA7odzKXIHOLLlJA8XuP6Lx6b_2Du8KsN-RGxpMaOrBKa97jlPWIBtjiLA/exec",

  loadingDelay: 7000,
  connectionDelay: 3300,

  maxMessageLength: 180,
  maxFileSize: 8 * 1024 * 1024,

  historyLimit: 6,
  dashboardRefreshDelay: 1500,

  progressMarks: [25, 50, 75, 95],

  screens: [
    "intro",
    "videoScreen",
    "finalGift",
    "loading",
    "connected",
    "connectionHistory"
  ]
};