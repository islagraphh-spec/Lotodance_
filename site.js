const STORAGE_KEY = "lotodance_registrations_v1";
const REGISTRATION_API_ENDPOINT = "";

const EVENTS = [
  {
    id: "paris-2026-04-18",
    dateISO: "2026-04-18",
    time: "18h30 - 22h30",
    location: "Centre Commercial Rives d'Or",
    city: "Paris",
    audience: "Grand public"
  },
  {
    id: "lyon-2026-05-09",
    dateISO: "2026-05-09",
    time: "17h00 - 21h30",
    location: "Place de la République",
    city: "Lyon",
    audience: "Événement communal"
  },
  {
    id: "nantes-2026-05-30",
    dateISO: "2026-05-30",
    time: "19h00 - 23h00",
    location: "Salle des Fêtes Beaulieu",
    city: "Nantes",
    audience: "Association"
  },
  {
    id: "toulouse-2026-06-13",
    dateISO: "2026-06-13",
    time: "20h00 - 00h00",
    location: "Casino du Sud",
    city: "Toulouse",
    audience: "Soirée privée"
  },
  {
    id: "lille-2026-06-27",
    dateISO: "2026-06-27",
    time: "16h30 - 20h30",
    location: "Galerie Marchande Grand Nord",
    city: "Lille",
    audience: "Centre commercial"
  },
  {
    id: "bordeaux-2026-07-11",
    dateISO: "2026-07-11",
    time: "18h00 - 22h00",
    location: "Parc des Expositions",
    city: "Bordeaux",
    audience: "Festival intergénérationnel"
  }
];

function formatDateFr(dateISO) {
  return new Intl.DateTimeFormat("fr-FR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric"
  }).format(new Date(dateISO));
}

function cleanText(value) {
  return String(value || "").trim();
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function getRegistrations() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveRegistrations(registrations) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(registrations));
}

function createEventLabel(event) {
  return `${formatDateFr(event.dateISO)} | ${event.city} | ${event.time}`;
}

async function syncRegistrationToApi(registration) {
  if (!REGISTRATION_API_ENDPOINT || typeof fetch !== "function") {
    return { synced: false };
  }

  try {
    const response = await fetch(REGISTRATION_API_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(registration)
    });

    if (!response.ok) {
      return { synced: false };
    }
    return { synced: true };
  } catch {
    return { synced: false };
  }
}

function renderNextEvents() {
  const list = document.getElementById("next-events-list");
  if (!list) return;

  const now = new Date();
  const upcoming = EVENTS.filter((event) => new Date(event.dateISO) >= now).slice(0, 3);
  const source = upcoming.length ? upcoming : EVENTS.slice(0, 3);

  list.innerHTML = source
    .map(
      (event) => `
      <li>
        <strong>${formatDateFr(event.dateISO)}</strong>
        <span>${event.location}, ${event.city} - ${event.time}</span>
      </li>
    `
    )
    .join("");
}

function renderAgenda() {
  const grid = document.getElementById("agenda-grid");
  if (!grid) return;

  grid.innerHTML = EVENTS.map(
    (event) => `
      <article class="agenda-card">
        <div class="agenda-card-head">${formatDateFr(event.dateISO)}</div>
        <div class="agenda-card-body">
          <span class="badge">${event.audience}</span>
          <h3>${event.location}</h3>
          <p class="agenda-meta"><strong>Ville :</strong> ${event.city}</p>
          <p class="agenda-meta"><strong>Horaire :</strong> ${event.time}</p>
          <a class="btn btn-ghost" href="#inscription" data-event-id="${event.id}">Participer</a>
        </div>
      </article>
    `
  ).join("");

  grid.querySelectorAll("[data-event-id]").forEach((button) => {
    button.addEventListener("click", () => {
      const select = document.getElementById("event");
      if (!select) return;
      select.value = button.getAttribute("data-event-id") || "";
    });
  });
}

function populateEventSelect() {
  const select = document.getElementById("event");
  if (!select) return;

  select.innerHTML = `<option value="">Choisir une date LOTODANCE</option>${EVENTS.map(
    (event) => `<option value="${event.id}">${createEventLabel(event)}</option>`
  ).join("")}`;
}

function initQRCode() {
  const qrImage = document.getElementById("qr-image");
  const qrLink = document.getElementById("qr-link");
  if (!qrImage || !qrLink) return;

  const isHttp = window.location.protocol === "http:" || window.location.protocol === "https:";
  const participationUrl = isHttp
    ? `${window.location.origin}${window.location.pathname}#inscription`
    : "https://lotodance.fr/#inscription";

  const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=280x280&data=${encodeURIComponent(participationUrl)}`;

  qrImage.src = qrApiUrl;
  qrLink.textContent = participationUrl;
}

function initRegistrationForm() {
  const form = document.getElementById("registration-form");
  const feedback = document.getElementById("form-feedback");
  if (!form || !feedback) return;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const firstName = cleanText(form.firstName.value);
    const lastName = cleanText(form.lastName.value);
    const email = cleanText(form.email.value);
    const eventId = cleanText(form.event.value);

    if (!firstName || !lastName || !email || !eventId) {
      feedback.className = "form-feedback error";
      feedback.textContent = "Veuillez remplir tous les champs obligatoires.";
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      feedback.className = "form-feedback error";
      feedback.textContent = "Veuillez saisir une adresse email valide.";
      return;
    }

    const selectedEvent = EVENTS.find((item) => item.id === eventId);
    if (!selectedEvent) {
      feedback.className = "form-feedback error";
      feedback.textContent = "La date sélectionnée est introuvable.";
      return;
    }

    const registrations = getRegistrations();
    const id =
      typeof window.crypto !== "undefined" && typeof window.crypto.randomUUID === "function"
        ? window.crypto.randomUUID()
        : `${Date.now()}-${Math.random()}`;

    const registration = {
      id,
      createdAt: new Date().toISOString(),
      firstName,
      lastName,
      email,
      eventId,
      eventLabel: createEventLabel(selectedEvent)
    };

    registrations.unshift(registration);
    saveRegistrations(registrations);

    feedback.className = "form-feedback success";
    feedback.textContent = `Inscription confirmée pour ${firstName} ${lastName}. À très vite sur la piste.`;
    form.reset();

    const syncState = await syncRegistrationToApi(registration);
    if (!syncState.synced) {
      feedback.textContent = `Inscription confirmée pour ${firstName} ${lastName}. Données enregistrées localement (mode secours).`;
    }
  });
}

function toCsvValue(value) {
  const cleaned = String(value || "").replace(/"/g, '""');
  return `"${cleaned}"`;
}

function exportRegistrations() {
  const registrations = getRegistrations();
  if (!registrations.length) return;

  const header = ["Date inscription", "Prénom", "Nom", "Email", "Événement"];
  const rows = registrations.map((row) => [
    new Date(row.createdAt).toLocaleString("fr-FR"),
    row.firstName,
    row.lastName,
    row.email,
    row.eventLabel
  ]);

  const csv = [header, ...rows].map((line) => line.map(toCsvValue).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = `lotodance-inscriptions-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function renderAdmin() {
  const tableBody = document.getElementById("admin-rows");
  const countNode = document.getElementById("admin-count");
  const emptyNode = document.getElementById("admin-empty");
  const exportBtn = document.getElementById("export-csv");
  const clearBtn = document.getElementById("clear-all");

  if (!tableBody || !countNode || !emptyNode || !exportBtn || !clearBtn) return;

  const registrations = getRegistrations();
  countNode.textContent = `${registrations.length} inscription(s)`;

  if (!registrations.length) {
    emptyNode.hidden = false;
    tableBody.innerHTML = "";
  } else {
    emptyNode.hidden = true;
    tableBody.innerHTML = registrations
      .map(
        (entry) => `
          <tr>
            <td>${new Date(entry.createdAt).toLocaleString("fr-FR")}</td>
            <td>${escapeHtml(entry.firstName)}</td>
            <td>${escapeHtml(entry.lastName)}</td>
            <td>${escapeHtml(entry.email)}</td>
            <td>${escapeHtml(entry.eventLabel)}</td>
          </tr>
        `
      )
      .join("");
  }

  exportBtn.onclick = exportRegistrations;
  clearBtn.onclick = () => {
    const accepted = window.confirm("Supprimer toutes les inscriptions stockées localement ?");
    if (!accepted) return;
    localStorage.removeItem(STORAGE_KEY);
    renderAdmin();
  };
}

function initRevealAnimations() {
  const items = Array.from(document.querySelectorAll("[data-reveal]"));
  if (!items.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("revealed");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.14 }
  );

  items.forEach((node) => observer.observe(node));
}

function init() {
  renderNextEvents();
  renderAgenda();
  populateEventSelect();
  initQRCode();
  initRegistrationForm();
  renderAdmin();
  initRevealAnimations();
}

document.addEventListener("DOMContentLoaded", init);
