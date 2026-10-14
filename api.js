"use strict";

const API_BASE = "/api";

async function apiRequest(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    }
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || `API error: ${response.status}`);
  }

  return data;
}

async function loadProviderPlans() {
  return apiRequest("/providers");
}

async function saveEstimate({
  projectName,
  monthlyCompute,
  monthlyStorage,
  monthlyNetwork
}) {
  return apiRequest("/estimates", {
    method: "POST",
    body: JSON.stringify({
      projectName,
      monthlyCompute,
      monthlyStorage,
      monthlyNetwork
    })
  });
}

async function loadSavedEstimates() {
  return apiRequest("/estimates");
}

async function checkApiHealth() {
  return apiRequest("/health");
}
