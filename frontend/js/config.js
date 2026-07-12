/**
 * ==========================================
 * Private Connections
 * config.js
 * ==========================================
 */

const ENVIRONMENTS = {
  development: {
    environment: "development",

    appUrl:
      "http://127.0.0.1:5500",

    backendUrl:
      "https://script.google.com/macros/s/AKfycbzfjkNOdkJjQA7odzKXIHOLLlJA8XuP6Lx6b_2Du8KsN-RGxpMaOrBKa97jlPWIBtjiLA/exec",

    allowedOrigin:
      "http://127.0.0.1:5500",

    loadingDelay: 1000,
    connectionDelay: 700,
    dashboardRefreshDelay: 1500
  },

  production: {
    environment: "production",

    appUrl:
      "https://profalexandretolentino.github.io/private-connections/",

    backendUrl:
      "https://script.google.com/macros/s/AKfycbz9Hs01tluXk4-Pjry3YoUNucDhIvlLxgud9bQ5TnA3S9eYwZ8OPGBMnjE0qTVhx6O5/exec",

    allowedOrigin:
      "https://profalexandretolentino.github.io",

    loadingDelay: 7000,
    connectionDelay: 3300,
    dashboardRefreshDelay: 1500
  }
};

function detectEnvironment() {
  const hostname = window.location.hostname;

  const developmentHosts = [
    "localhost",
    "127.0.0.1"
  ];

  return developmentHosts.includes(hostname)
    ? "development"
    : "production";
}

const currentEnvironment =
  detectEnvironment();

const environmentConfig =
  ENVIRONMENTS[currentEnvironment];

export const CONFIG = {
  appName: "Private Connections",
  version: "1.0.0",

  environment:
    environmentConfig.environment,

  appUrl:
    environmentConfig.appUrl,

  backendUrl:
    environmentConfig.backendUrl,

  allowedOrigin:
    environmentConfig.allowedOrigin,

  loadingDelay:
    environmentConfig.loadingDelay,

  connectionDelay:
    environmentConfig.connectionDelay,

  dashboardRefreshDelay:
    environmentConfig.dashboardRefreshDelay,

  maxMessageLength: 180,

  maxFileSize:
    8 * 1024 * 1024,

  historyLimit: 6,

  progressMarks: [
    25,
    50,
    75,
    95
  ],

  screens: [
    "intro",
    "videoScreen",
    "finalGift",
    "loading",
    "connected",
    "connectionHistory"
  ]
};