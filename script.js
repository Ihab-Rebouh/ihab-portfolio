const root = document.documentElement;
const themeToggle = document.querySelector(".theme-toggle");
const themeLabel = document.querySelector(".theme-label");
const themeIcon = document.querySelector(".theme-icon");
const menuToggle = document.querySelector(".menu-toggle");
const navigation = document.querySelector(".primary-nav");
const navLinks = [...document.querySelectorAll('.primary-nav a[href^="#"]')];
const sections = [...document.querySelectorAll("main section[id]")];
const form = document.querySelector("#contact-form");
const formStatus = document.querySelector("#form-status");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

function applyTheme(theme) {
  root.dataset.theme = theme;
  const isDark = theme === "dark";
  themeToggle.setAttribute(
    "aria-label",
    `Switch to ${isDark ? "light" : "dark"} mode`,
  );
  themeToggle.title = `Switch to ${isDark ? "light" : "dark"} mode`;
  themeLabel.textContent = `${isDark ? "Light" : "Dark"} mode`;
  themeIcon.textContent = isDark ? "◐" : "◑";
  document.querySelector('meta[name="theme-color"]').content = isDark
    ? "#0d1118"
    : "#f0f6f4";
}

let savedTheme = "";
try {
  savedTheme = localStorage.getItem("ihab-theme") || "";
} catch {
  savedTheme = "";
}
applyTheme(savedTheme === "light" ? "light" : "dark");

themeToggle.addEventListener("click", () => {
  const next = root.dataset.theme === "dark" ? "light" : "dark";
  applyTheme(next);
  try {
    localStorage.setItem("ihab-theme", next);
  } catch {
    return;
  }
});

function closeMenu(returnFocus = false) {
  menuToggle.setAttribute("aria-expanded", "false");
  menuToggle.setAttribute("aria-label", "Open navigation");
  navigation.classList.remove("is-open");
  if (returnFocus) menuToggle.focus();
}

menuToggle.addEventListener("click", () => {
  const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
  menuToggle.setAttribute("aria-expanded", String(!isOpen));
  menuToggle.setAttribute(
    "aria-label",
    isOpen ? "Open navigation" : "Close navigation",
  );
  navigation.classList.toggle("is-open", !isOpen);
  if (!isOpen) navigation.querySelector("a").focus();
});

document.addEventListener("keydown", (event) => {
  if (
    event.key === "Escape" &&
    menuToggle.getAttribute("aria-expanded") === "true"
  )
    closeMenu(true);
});

navLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    const target = document.querySelector(link.getAttribute("href"));
    if (!target) return;
    event.preventDefault();
    closeMenu();
    history.pushState(null, "", link.getAttribute("href"));
    target.scrollIntoView({
      behavior: reducedMotion.matches ? "auto" : "smooth",
      block: "start",
    });
    window.setTimeout(
      () => target.focus({ preventScroll: true }),
      reducedMotion.matches ? 0 : 350,
    );
  });
});

document
  .querySelectorAll('a[href^="#"]:not(.primary-nav a)')
  .forEach((link) => {
    link.addEventListener("click", (event) => {
      const target = document.querySelector(link.getAttribute("href"));
      if (!target) return;
      event.preventDefault();
      history.pushState(null, "", link.getAttribute("href"));
      target.scrollIntoView({
        behavior: reducedMotion.matches ? "auto" : "smooth",
        block: "start",
      });
    });
  });

const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      navLinks.forEach((link) => {
        const active = link.hash === `#${entry.target.id}`;
        if (active) link.setAttribute("aria-current", "location");
        else link.removeAttribute("aria-current");
        link.classList.toggle("active", active);
      });
    });
  },
  { rootMargin: "-28% 0px -62% 0px" },
);
sections.forEach((section) => sectionObserver.observe(section));

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.08 },
);
document
  .querySelectorAll(
    ".intro-grid, .project-card, .timeline-entry, .education-entry, .cap-panel, .language-strip, .contact-grid",
  )
  .forEach((element) => {
    element.classList.add("reveal");
    revealObserver.observe(element);
  });

form.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!form.reportValidity()) return;
  const data = new FormData(form);
  const subject = encodeURIComponent(data.get("subject").trim());
  const body = encodeURIComponent(
    `Hello Ihab,\n\n${data.get("message").trim()}\n\nBest regards,\n${data.get("name").trim()}\n${data.get("email").trim()}`,
  );
  const mailto = `mailto:ihab.rebouh@stud.th-owl.de?subject=${subject}&body=${body}`;
  formStatus.textContent =
    "Your email app will open with a prefilled draft. Nothing has been sent.";
  window.location.href = mailto;
});

document.querySelector("#year").textContent = new Date().getFullYear();

window.addEventListener("resize", () => {
  if (window.innerWidth > 767) closeMenu();
});
