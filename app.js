
"use strict";

// Illustrative starting estimates only.
// Verify official pricing before publishing or purchasing.
// INR conversion is an example rate, not a live FX feed.

const USD_TO_INR = 90;
const HOURS_PER_MONTH = 730;

const providers = [
  {
    id: "vercel",
    name: "Vercel",
    symbol: "▲",
    category: "Frontend",
    tags: ["Frontend", "Development"],
    plan: "Hobby",
    price: 0,
    priceLabel: "Free plan",
    cpu: "Managed",
    ram: "Managed",
    storage: "Plan limits",
    bandwidth: "Plan limits",
    description:
      "Frontend hosting for Next.js, previews, Git-based deployments and CDN delivery. Hobby is intended for personal, non-commercial use.",
    pricingUrl: "https://vercel.com/pricing",
    popular: "Frontend",
    extra: "Usage and plan limits apply"
  },
  {
    id: "digitalocean",
    name: "DigitalOcean",
    symbol: "D",
    category: "VPS",
    tags: ["VPS", "Development", "Production"],
    plan: "Basic Droplet",
    price: 6,
    cpu: "1 vCPU",
    ram: "1 GiB",
    storage: "25 GiB SSD",
    bandwidth: "1,000 GiB",
    description:
      "A simple Linux VPS for small APIs, Docker experiments, development environments and lightweight services.",
    pricingUrl: "https://www.digitalocean.com/pricing/droplets",
    popular: "Developer friendly",
    extra: "Starting-plan estimate"
  },
  {
    id: "hetzner",
    name: "Hetzner Cloud",
    symbol: "H",
    category: "VPS",
    tags: ["VPS", "Development", "Production"],
    plan: "CX23 example",
    price: 6.49,
    cpu: "Plan dependent",
    ram: "Plan dependent",
    storage: "Plan dependent",
    bandwidth: "Plan dependent",
    description:
      "Budget-focused cloud servers for Linux administration, self-managed Docker, CI runners and testing.",
    pricingUrl: "https://www.hetzner.com/cloud/",
    popular: "Budget option",
    extra: "Check region and IPv4 fees"
  },
  {
    id: "aws",
    name: "AWS EC2",
    symbol: "aws",
    category: "Cloud",
    tags: ["VPS", "Development", "Production"],
    plan: "t3.nano example",
    price: null,
    cpu: "2 vCPU credits",
    ram: "0.5 GiB",
    storage: "EBS billed separately",
    bandwidth: "Usage dependent",
    description:
      "Flexible cloud compute for Linux servers, networking, IAM, automation and scalable infrastructure.",
    pricingUrl: "https://aws.amazon.com/ec2/pricing/on-demand/",
    popular: "Highly configurable",
    extra: "Use AWS Calculator for pricing"
  }
];

let activeFilter = "All";

const grid = document.getElementById("provider-grid");
const currencySelect = document.getElementById("currency");
const billingSelect = document.getElementById("billing");
const searchInput = document.getElementById("search");
const resultCount = document.getElementById("result-count");

function formatMoney(usd, currency = currencySelect.value) {
  if (usd === null || usd === undefined) {
    return "Calculate";
  }

  const amount = currency === "INR" ? usd * USD_TO_INR : usd;
  const locale = currency === "INR" ? "en-IN" : "en-US";

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: amount < 1 ? 3 : 2
  }).format(amount);
}

function getDisplayedPrice(provider) {
  if (provider.price === null) return null;

  let price = provider.price;

  if (billingSelect.value === "hourly") {
    price /= HOURS_PER_MONTH;
  }

  return price;
}

function getPricePeriod() {
  return billingSelect.value === "hourly" ? "/hour*" : "/month*";
}

function renderProviders() {
  const query = searchInput.value.trim().toLowerCase();

  const visibleProviders = providers.filter(provider => {
    const matchesFilter =
      activeFilter === "All" ||
      provider.tags.includes(activeFilter);

    const searchable = [
      provider.name,
      provider.plan,
      provider.category,
      provider.description,
      ...provider.tags
    ].join(" ").toLowerCase();

    return matchesFilter && searchable.includes(query);
  });

  resultCount.textContent =
    `${visibleProviders.length} provider${visibleProviders.length === 1 ? "" : "s"}`;

  if (visibleProviders.length === 0) {
    grid.innerHTML = '<div class="empty-state">No matching providers. Try another search or filter.</div>';
    return;
  }

  grid.innerHTML = visibleProviders.map(provider => {
    const price = getDisplayedPrice(provider);
    const priceText = price === null
      ? "Calculate"
      : formatMoney(price);

    const period = price === null ? "" : getPricePeriod();

    return `
      <article class="provider-card">
        <div class="card-top">
          <div class="provider-logo">${provider.symbol}</div>
          <div>
            <h3>${provider.name}</h3>
            <p>${provider.category} hosting</p>
          </div>
          <span class="tag">${provider.popular}</span>
        </div>

        <div class="price-row">
          <span class="price">${priceText}</span>
          <span class="price-period">${period}</span>
        </div>

        <div class="plan-name">${provider.plan}</div>

        <div class="specs">
          <div class="spec">
            <span>CPU</span>
            <strong>${provider.cpu}</strong>
          </div>
          <div class="spec">
            <span>Memory</span>
            <strong>${provider.ram}</strong>
          </div>
          <div class="spec">
            <span>Storage</span>
            <strong>${provider.storage}</strong>
          </div>
          <div class="spec">
            <span>Transfer</span>
            <strong>${provider.bandwidth}</strong>
          </div>
        </div>

        <p class="card-description">${provider.description}</p>

        <div class="card-footer">
          <small>${provider.extra}</small>
          <a class="provider-link"
             href="${provider.pricingUrl}"
             target="_blank"
             rel="noopener noreferrer">
             Official pricing ↗
          </a>
        </div>
      </article>
    `;
  }).join("");
}

function setupFilters() {
  document.querySelectorAll(".filter").forEach(button => {
    button.addEventListener("click", () => {
      activeFilter = button.dataset.filter;

      document.querySelectorAll(".filter").forEach(item => {
        item.classList.toggle("active", item === button);
      });

      renderProviders();
    });
  });
}

function setupCalculator() {
  const providerSelect = document.getElementById("calc-provider");
  const countInput = document.getElementById("server-count");
  const hoursInput = document.getElementById("server-hours");
  const totalElement = document.getElementById("estimate-total");
  const noteElement = document.getElementById("estimate-note");

  providers.forEach(provider => {
    const option = document.createElement("option");
    option.value = provider.id;
    option.textContent = `${provider.name} — ${provider.plan}`;
    providerSelect.appendChild(option);
  });

  providerSelect.value = "digitalocean";

  function updateEstimate() {
    const provider = providers.find(item => item.id === providerSelect.value);

    const count = Math.min(
      100,
      Math.max(1, Number(countInput.value) || 1)
    );

    const hours = Math.min(
      744,
      Math.max(1, Number(hoursInput.value) || 1)
    );

    if (!provider || provider.price === null) {
      totalElement.textContent = "Use calculator";
      noteElement.textContent =
        "AWS costs depend on region, instance type, storage, IP and data transfer.";

      return;
    }

    const total = provider.price * count * (hours / HOURS_PER_MONTH);

    totalElement.textContent = formatMoney(total);
    noteElement.textContent =
      `${count} server(s) × ${hours} hours. ${provider.extra}. Excludes taxes and additional charges.`;
  }

  [providerSelect, countInput, hoursInput].forEach(element => {
    element.addEventListener("input", updateEstimate);
    element.addEventListener("change", updateEstimate);
  });

  currencySelect.addEventListener("change", updateEstimate);

  updateEstimate();
}

currencySelect.addEventListener("change", renderProviders);
billingSelect.addEventListener("change", renderProviders);
searchInput.addEventListener("input", renderProviders);

document.getElementById("year").textContent = new Date().getFullYear();

setupFilters();
setupCalculator();
renderProviders();
