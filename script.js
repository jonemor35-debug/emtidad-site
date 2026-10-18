// ===== إعدادات سهلة التعديل =====
const SALES_EMAIL = "sales@emtidad-alnajah.sa"; // الإيميل اللي هيوصله الطلب

document.addEventListener("DOMContentLoaded", () => {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];

  // السنة في الفوتر
  $("#year").textContent = new Date().getFullYear();

  /* ===== القائمة في الموبايل ===== */
  const burger = $("#burger");
  const nav = $("#nav");
  burger.addEventListener("click", () => {
    burger.classList.toggle("open");
    nav.classList.toggle("open");
  });
  $$(".nav__link").forEach(link =>
    link.addEventListener("click", () => {
      burger.classList.remove("open");
      nav.classList.remove("open");
    })
  );

  /* ===== الهيدر + زرار للأعلى + اللينك النشط ===== */
  const header = $("#header");
  const toTop = $("#toTop");
  const sections = $$("section[id]");
  const navLinks = $$(".nav__link");

  function onScroll() {
    const y = window.scrollY;
    header.classList.toggle("scrolled", y > 10);
    toTop.classList.toggle("show", y > 500);

    let current = "home";
    sections.forEach(sec => {
      if (y + 120 >= sec.offsetTop) current = sec.id;
    });
    if (window.innerHeight + y >= document.body.scrollHeight - 5) current = "contact";
    navLinks.forEach(a => a.classList.toggle("active", a.getAttribute("href") === "#" + current));
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
  toTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

  /* ===== سلايدر المطاعم ===== */
  const track = $("#track");
  const cards = $$(".client", track);
  const dotsWrap = $("#dots");
  let index = 0;
  let timer;

  const perView = () => {
    const w = window.innerWidth;
    if (w <= 560) return 2;
    if (w <= 900) return 3;
    if (w <= 1024) return 4;
    return 5;
  };
  const maxIndex = () => Math.max(0, cards.length - perView());

  function buildDots() {
    dotsWrap.innerHTML = "";
    for (let i = 0; i <= maxIndex(); i++) {
      const d = document.createElement("button");
      d.className = "dot";
      d.setAttribute("aria-label", "شريحة " + (i + 1));
      d.addEventListener("click", () => { goTo(i); restart(); });
      dotsWrap.appendChild(d);
    }
  }

  function goTo(i) {
    const max = maxIndex();
    if (i > max) i = 0;
    if (i < 0) i = max;
    index = i;
    const step = cards[0].offsetWidth + 14; // عرض الكارت + المسافة
    track.style.transform = `translateX(${index * step}px)`; // الصفحة RTL
    $$(".dot", dotsWrap).forEach((d, n) => d.classList.toggle("active", n === index));
  }

  const restart = () => {
    clearInterval(timer);
    timer = setInterval(() => goTo(index + 1), 3500);
  };

  $("#nextBtn").addEventListener("click", () => { goTo(index + 1); restart(); });
  $("#prevBtn").addEventListener("click", () => { goTo(index - 1); restart(); });
  const slider = $(".slider");
  slider.addEventListener("mouseenter", () => clearInterval(timer));
  slider.addEventListener("mouseleave", restart);

  // سحب باللمس في الموبايل
  let startX = 0;
  track.addEventListener("touchstart", e => (startX = e.touches[0].clientX), { passive: true });
  track.addEventListener("touchend", e => {
    const dx = e.changedTouches[0].clientX - startX;
    if (Math.abs(dx) > 40) { goTo(dx > 0 ? index + 1 : index - 1); restart(); }
  });

  window.addEventListener("resize", () => { buildDots(); goTo(Math.min(index, maxIndex())); });
  buildDots();
  goTo(0);
  restart();

  /* ===== نافذة طلب التوريد ===== */
  const modal = $("#orderModal");
  const form = $("#orderForm");
  const success = $("#successMsg");
  const errorBox = $("#formError");

  function openModal(product) {
    form.hidden = false;
    success.hidden = true;
    errorBox.textContent = "";
    if (product) $("#fProduct").value = product;
    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    setTimeout(() => $("#fName").focus(), 200);
  }
  function closeModal() {
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  $$(".js-open-order").forEach(btn =>
    btn.addEventListener("click", () => {
      burger.classList.remove("open");
      nav.classList.remove("open");
      openModal(btn.dataset.product);
    })
  );
  $("#closeModal").addEventListener("click", closeModal);
  $("#successClose").addEventListener("click", closeModal);
  modal.addEventListener("click", e => { if (e.target === modal) closeModal(); });
  document.addEventListener("keydown", e => { if (e.key === "Escape") closeModal(); });

  form.addEventListener("submit", e => {
    e.preventDefault();
    let ok = true;
    $$("input[required]", form).forEach(inp => {
      const empty = !inp.value.trim();
      inp.classList.toggle("invalid", empty);
      if (empty) ok = false;
    });
    const phone = $("#fPhone");
    if (phone.value.trim() && !/^[+0-9\s-]{8,15}$/.test(phone.value.trim())) {
      phone.classList.add("invalid");
      errorBox.textContent = "اكتب رقم جوال صحيح.";
      return;
    }
    if (!ok) {
      errorBox.textContent = "من فضلك املأ الحقول المطلوبة.";
      return;
    }
    errorBox.textContent = "";

    const d = Object.fromEntries(new FormData(form));
    const body =
      `اسم المنشأة: ${d.company}\n` +
      `اسم المسؤول: ${d.person}\n` +
      `الجوال: ${d.phone}\n` +
      `نوع النشاط: ${d.type}\n` +
      `المنتج: ${d.product}\n` +
      `المدينة: ${d.city}\n` +
      `التفاصيل: ${d.notes || "-"}`;

    // بيفتح برنامج الإيميل والطلب مكتوب جاهز
    window.location.href =
      `mailto:${SALES_EMAIL}?subject=${encodeURIComponent("طلب توريد - " + d.company)}&body=${encodeURIComponent(body)}`;

    form.reset();
    form.hidden = true;
    success.hidden = false;
  });

  $$("input", form).forEach(inp => inp.addEventListener("input", () => inp.classList.remove("invalid")));
});
