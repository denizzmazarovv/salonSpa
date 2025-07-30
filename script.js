// Mobile Navigation
const hamburger = document.getElementById("hamburger");
const navMenu = document.getElementById("nav-menu");

hamburger.addEventListener("click", () => {
  navMenu.classList.toggle("active");
  hamburger.innerHTML = navMenu.classList.contains("active")
    ? '<i class="fas fa-times"></i>'
    : '<i class="fas fa-bars"></i>';
});

// Close mobile menu when clicking on a link
document.querySelectorAll(".nav-menu a").forEach((link) => {
  link.addEventListener("click", () => {
    navMenu.classList.remove("active");
    hamburger.innerHTML = '<i class="fas fa-bars"></i>';
  });
});

// Sticky header on scroll
window.addEventListener("scroll", onScroll, { passive: true });

function onScroll() {
  const header = document.querySelector("header");
  header.classList.toggle("sticky", window.scrollY > 100);
}

// Gallery Modal
const modal = document.getElementById("imageModal");
const modalImg = document.getElementById("modalImage");
const closeModal = document.getElementById("closeModal");

function openModal(src) {
  modal.style.display = "flex";
  modalImg.src = src;
  document.body.style.overflow = "hidden";
}

closeModal.addEventListener("click", () => {
  modal.style.display = "none";
  document.body.style.overflow = "auto";
});

// Close modal when clicking outside
window.addEventListener("click", (e) => {
  if (e.target === modal) {
    modal.style.display = "none";
    document.body.style.overflow = "auto";
  }
});

// ! гугл штс
const sheetID = "1cKc67MDcElKNNLDF4YL-ll5Mt5cgbwdQEXrHL7ZBRW4"; // вставь сюда свой ID таблицы
const url = `https://docs.google.com/spreadsheets/d/${sheetID}/gviz/tq?tqx=out:json`;

fetch(url)
  .then((res) => res.text())
  .then((data) => {
    const json = JSON.parse(data.substr(47).slice(0, -2));
    const rows = json.table.rows;

    // Находим все элементы с классом "price"
    const priceElements = document.querySelectorAll(".service-card .price");

    // Обновляем цены из таблицы
    priceElements.forEach((el, index) => {
      const cell = rows[index]?.c?.[1]?.v;
      if (cell) {
        el.textContent = `от ${cell} сум`;
      }
    });
  });

// ! new worked
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("contact-form");
  const status = document.getElementById("status");
  const nameInput = document.getElementById("name");
  const phoneInput = document.getElementById("phone");
  const messageInput = document.getElementById("message");
  const nameError = document.getElementById("nameError");
  const phoneError = document.getElementById("phoneError");
  const submitButton = form.querySelector("button[type='submit']");

  let submitting = false;

  // Универсальная защита от XSS
  function escapeHtml(unsafe) {
    if (typeof unsafe !== "string") return unsafe;
    return unsafe
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  // Валидация телефона
  function validatePhone(phone) {
    const digits = phone.replace(/\D/g, "");
    return /^(998\d{9}|9\d{8})$/.test(digits);
  }

  // Проверка лимита отправок
  function isRateLimited() {
    const now = Date.now();
    const windowMs = 10 * 60 * 1000;

    const stored = localStorage.getItem("successfulSubmissions");
    const submissions = stored ? JSON.parse(stored) : [];

    const recent = submissions.filter((time) => now - time <= windowMs);
    return recent.length >= 5;
  }

  // Запись успешной отправки
  function recordSubmission() {
    const now = Date.now();

    const stored = localStorage.getItem("successfulSubmissions");
    const submissions = stored ? JSON.parse(stored) : [];

    submissions.push(now);
    localStorage.setItem("successfulSubmissions", JSON.stringify(submissions));
  }

  // Обработка формы
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (submitting) return;
    submitting = true;
    submitButton.disabled = true;

    // Сброс ошибок
    nameError.style.display = "none";
    phoneError.style.display = "none";
    status.textContent = "";

    const rawName = nameInput.value.trim();
    const rawPhone = phoneInput.value.trim();
    const rawMessage = messageInput.value.trim();

    // Валидация имени
    const nameRegex = /^[A-Za-zА-Яа-яЁё\s]{2,}$/;
    let valid = true;

    if (!nameRegex.test(rawName)) {
      nameError.style.display = "block";
      nameError.textContent = "Только буквы и пробелы (мин. 2 символа)";
      valid = false;
    }

    if (!validatePhone(rawPhone)) {
      phoneError.style.display = "block";
      phoneError.textContent = "Формат: 00-123-45-67 или 998xxxxxxxxx";
      valid = false;
    }

    if (!valid) {
      status.textContent = "⚠️ Исправьте ошибки в форме.";
      submitting = false;
      submitButton.disabled = false;
      return;
    }

    // Проверка лимита
    if (isRateLimited()) {
      status.textContent = "⛔ Лимит: 5 заявок за 10 минут!";
      submitting = false;
      submitButton.disabled = false;
      return;
    }

    // Подготовка данных с защитой XSS
    const formData = new FormData();
    formData.append("name", escapeHtml(rawName));
    formData.append("phone", escapeHtml(rawPhone));
    formData.append("message", escapeHtml(rawMessage));

    status.textContent = "⏳ Отправка...";

    try {
      const res = await fetch(
        "https://script.google.com/macros/s/AKfycbwlxGw1VxXE02iNO7Je8oCUgUA64cIVpLXx1PYMQzqSRKzLrilVmEn8tjVEfp0qFqHQYg/exec",
        {
          method: "POST",
          body: new URLSearchParams(formData),
        }
      );

      const text = await res.text();

      if (text === "OK") {
        status.textContent = "✅ Успешно отправлено!";
        recordSubmission();
        form.reset();
      } else {
        status.textContent = "⚠️ Ошибка сервера";
      }
    } catch (err) {
      console.error("Ошибка:", err);
      status.textContent = "❌ Ошибка при отправке";
    } finally {
      submitting = false;
      submitButton.disabled = false;
    }
  });
});
