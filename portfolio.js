// PRELOADER
window.addEventListener("load", () => {
  setTimeout(() => {
    document.getElementById("preloader").classList.add("done");
  }, 1800);
});

// TYPED TEXT
const phrases = [
  "clean interfaces.",
  "modern websites.",
  "user experiences.",
  "creative solutions.",
  "pixel-perfect UIs.",
];
let phraseIndex = 0,
  currentIndex = 0,
  del = false;
const el = document.getElementById("typed-text");
function type() {
  const word = phrases[phraseIndex];
  if (!del) {
    el.textContent = word.slice(0, currentIndex + 1);
    currentIndex++;
    if (currentIndex === word.length) {
      del = true;
      setTimeout(type, 1800);
      return;
    }
  } else {
    el.textContent = word.slice(0, currentIndex - 1);
    currentIndex--;
    if (currentIndex === 0) {
      del = false;
      phraseIndex = (phraseIndex + 1) % phrases.length;
    }
  }
  setTimeout(type, del ? 60 : 90);
}
setTimeout(type, 3000);

// NAVBAR SCROLL
const navbar = document.getElementById("navbar");
const sections = document.querySelectorAll("section[id]");
const navLinks = document.querySelectorAll(".nav-links a");
window.addEventListener(
  "scroll",
  () => {
    const y = window.scrollY;
    navbar.classList.toggle("scrolled", y > 60);
    document.getElementById("back-top").classList.toggle("visible", y > 500);
    let cur = "";
    sections.forEach((s) => {
      if (y >= s.offsetTop - 120) cur = s.id;
    });
    navLinks.forEach((a) => {
      a.classList.toggle("active", a.getAttribute("href") === "#" + cur);
    });
  },
  { passive: true },
);

// BURGER MENU
const burger = document.getElementById("burger");
const mobileMenu = document.getElementById("mobileMenu");
burger.addEventListener("click", () => {
  burger.classList.toggle("open");
  mobileMenu.classList.toggle("open");
  document.body.style.overflow = mobileMenu.classList.contains("open")
    ? "hidden"
    : "";
});
document.querySelectorAll(".mob-link").forEach((a) => {
  a.addEventListener("click", () => {
    burger.classList.remove("open");
    mobileMenu.classList.remove("open");
    document.body.style.overflow = "";
  });
});

// SMOOTH SCROLL
document.querySelectorAll('a[href^="#"]').forEach((a) => {
  a.addEventListener("click", (e) => {
    const t = document.querySelector(a.getAttribute("href"));
    if (t) {
      e.preventDefault();
      t.scrollIntoView({ behavior: "smooth" });
    }
  });
});

// SCROLL REVEAL
const reveals = document.querySelectorAll(".reveal");
const ro = new IntersectionObserver(
  (entries) => {
    entries.forEach((e, i) => {
      if (e.isIntersecting) {
        setTimeout(() => e.target.classList.add("visible"), i * 80);
        ro.unobserve(e.target);
      }
    });
  },
  { threshold: 0.1 },
);
reveals.forEach((r) => ro.observe(r));

// SKILL BARS
const bars = document.querySelectorAll(".skill-fill");
const bo = new IntersectionObserver(
  (entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.style.width = e.target.dataset.w + "%";
        bo.unobserve(e.target);
      }
    });
  },
  { threshold: 0.5 },
);
bars.forEach((b) => bo.observe(b));

// PROJECT FILTER
const filterBtns = document.querySelectorAll(".filter-tab");
const cards = document.querySelectorAll(".project-card");
filterBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    filterBtns.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    const f = btn.dataset.filter;
    cards.forEach((c) => {
      const show = f === "all" || c.dataset.type === f;
      c.style.opacity = "0";
      c.style.transform = "translateY(20px)";
      setTimeout(() => {
        c.classList.toggle("hidden", !show);
        if (show) {
          requestAnimationFrame(() => {
            c.style.opacity = "1";
            c.style.transform = "none";
            c.style.transition = "opacity 0.4s,transform 0.4s";
          });
        }
      }, 200);
    });
  });
});

// CONTACT FORM
const form = document.getElementById("contactForm");
const submitBtn = document.getElementById("submitBtn");
const toast = document.getElementById("formToast");
const toastMsg = document.getElementById("toastMsg");

function showErr(id, show) {
  const el = document.getElementById("err-" + id);
  const inp = document.getElementById("f" + id);
  if (el) el.classList.toggle("show", show);
  if (inp) inp.classList.toggle("error", show);
}

function validateEmail(e) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.getElementById("fname").value.trim();
  const email = document.getElementById("femail").value.trim();
  const subject = document.getElementById("fsubject").value.trim();
  const message = document.getElementById("fmessage").value.trim();

  // Validate fields
  let valid = true;
  showErr("name", !name);
  if (!name) valid = false;
  showErr("email", !validateEmail(email));
  if (!validateEmail(email)) valid = false;
  showErr("subject", !subject);
  if (!subject) valid = false;
  showErr("message", !message);
  if (!message) valid = false;
  if (!valid) return;

  // Show loading spinner
  submitBtn.disabled = true;
  submitBtn.innerHTML =
    '<i class="bi bi-arrow-repeat" style="font-size:16px;animation:spin 1s linear infinite;display:inline-block;"></i> Sending...';

  try {
    const res = await fetch("https://formspree.io/f/mdabpgpz", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ name, email, subject, message }),
    });

    if (res.ok) {
      // Success
      toast.className = "form-toast success";
      toastMsg.textContent =
        "Message sent! I'll get back to you within 24 hours.";
      form.reset();
    } else {
      // Formspree returned an error
      toast.className = "form-toast error-t";
      toastMsg.textContent = "Something went wrong. Please try again.";
    }
  } catch (err) {
    // Network error
    toast.className = "form-toast error-t";
    toastMsg.textContent = "Network error. Please check your connection.";
  }

  // Reset button
  submitBtn.disabled = false;
  submitBtn.innerHTML =
    '<i class="bi bi-send" style="font-size:16px;"></i> Send Message';

  // Hide toast after 5 seconds
  setTimeout(() => (toast.className = "form-toast"), 5000);
});

["fname", "femail", "fsubject", "fmessage"].forEach((id) => {
  const el = document.getElementById(id);
  if (el)
    el.addEventListener("input", () => {
      const key = id.replace("f", "");
      showErr(key, false);
    });
});

// BACK TO TOP
document.getElementById("back-top").addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});

// SPIN KEYFRAME
const style = document.createElement("style");
style.textContent = "@keyframes spin{to{transform:rotate(360deg);}}";
document.head.appendChild(style);
