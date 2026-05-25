(function () {
  var body = document.body;
  var root = document.documentElement;
  var prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var header = document.querySelector("[data-header]");
  var navToggle = document.querySelector(".nav-toggle");
  var nav = document.querySelector(".site-nav");
  var progress = document.querySelector(".scroll-progress i");
  var motionPercent = document.querySelector("[data-motion-percent]");
  var scrollEngine = null;

  body.classList.add("js-enabled");

  function splitText() {
    document.querySelectorAll("[data-split]").forEach(function (node) {
      if (node.dataset.splitReady) return;
      var charIndex = 0;
      Array.prototype.slice.call(node.childNodes).forEach(function (child) {
        if (child.nodeType === Node.TEXT_NODE) {
          var fragment = document.createDocumentFragment();
          child.textContent.split("").forEach(function (char) {
            if (char === " ") {
              fragment.appendChild(document.createTextNode(" "));
              return;
            }
            var span = document.createElement("span");
            span.className = "split-char";
            span.style.setProperty("--char-index", charIndex++);
            span.textContent = char;
            fragment.appendChild(span);
          });
          child.replaceWith(fragment);
        } else if (child.nodeName === "BR") {
          return;
        } else if (child.nodeType === Node.ELEMENT_NODE) {
          child.setAttribute("data-split-child", "");
          child.innerHTML = child.textContent.split("").map(function (char) {
            if (char === " ") return " ";
            return "<span class=\"split-char\" style=\"--char-index:" + charIndex++ + "\">" + char + "</span>";
          }).join("");
        }
      });
      node.dataset.splitReady = "true";
    });
  }

  function setLoaderDone(loader) {
    if (loader) loader.classList.add("is-hidden");
    body.classList.remove("is-loading");
    body.classList.add("ready");
    root.classList.add("is-ready");
    revealFirstFold();
    if (scrollEngine && scrollEngine.resize) window.setTimeout(function () { scrollEngine.resize(); }, 80);
  }

  function runLoader() {
    var loader = document.querySelector("[data-loader]");
    var alreadyPlayed = false;
    try {
      alreadyPlayed = window.sessionStorage.getItem("mianchi-loader-played") === "yes";
    } catch (error) {
      alreadyPlayed = false;
    }

    if (!loader || prefersReducedMotion || alreadyPlayed) {
      setLoaderDone(loader);
      return;
    }

    body.classList.add("is-loading");
    var count = loader.querySelector("[data-loader-count]");
    var value = 0;
    var timer = window.setInterval(function () {
      value += Math.ceil(Math.random() * 12);
      value = Math.min(value, 100);
      if (count) count.textContent = String(value).padStart(2, "0");
      loader.style.setProperty("--loader-progress", value + "%");
      if (value >= 100) {
        window.clearInterval(timer);
        try {
          window.sessionStorage.setItem("mianchi-loader-played", "yes");
        } catch (error) {}
        window.setTimeout(function () { setLoaderDone(loader); }, 280);
      }
    }, 48);
  }

  function revealFirstFold() {
    document.querySelectorAll(".hero .reveal, .sub-hero .reveal, main > section:first-child .reveal").forEach(function (item) {
      item.classList.add("is-visible");
    });
  }

  function closeNavigation() {
    body.classList.remove("nav-open");
    if (navToggle) navToggle.setAttribute("aria-expanded", "false");
  }

  function initNavigation() {
    if (!navToggle || !nav) return;
    navToggle.addEventListener("click", function () {
      var open = body.classList.toggle("nav-open");
      navToggle.setAttribute("aria-expanded", String(open));
    });
    nav.addEventListener("click", function (event) {
      if (event.target.tagName === "A") {
        closeNavigation();
      }
    });
  }

  function getScrollY() {
    if (scrollEngine && scrollEngine.lenisInstance) return scrollEngine.lenisInstance.scroll || window.scrollY;
    return window.scrollY;
  }

  function updateScrollChrome() {
    var y = getScrollY();
    var max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    var pct = Math.max(0, Math.min(1, y / max));
    if (progress) progress.style.setProperty("--scroll-progress", (pct * 100).toFixed(2) + "%");
    if (motionPercent) motionPercent.textContent = String(Math.round(pct * 100)).padStart(2, "0") + "%";
    if (header) header.classList.toggle("is-scrolled", y > 24);
    root.style.setProperty("--hero-spin", (pct * 720).toFixed(2) + "deg");
    root.style.setProperty("--page-scroll", pct.toFixed(4));
  }

  function initLocomotiveScroll() {
    if (prefersReducedMotion || !window.locomotiveScroll || !document.querySelector("[data-scroll-container]")) {
      window.addEventListener("scroll", updateScrollChrome, { passive: true });
      return;
    }
    try {
      scrollEngine = new window.locomotiveScroll({
        lenisOptions: {
          duration: 1.25,
          smoothWheel: true,
          wheelMultiplier: 0.92,
          touchMultiplier: 1.12,
          lerp: 0.08,
          anchors: true
        },
        scrollCallback: updateScrollChrome
      });
      window.mianchiScroll = scrollEngine;
      root.classList.add("has-scroll-smooth");
    } catch (error) {
      console.warn("Locomotive Scroll fallback:", error);
      window.addEventListener("scroll", updateScrollChrome, { passive: true });
    }
  }

  function initReveals() {
    var revealItems = document.querySelectorAll(".reveal");

    function syncReveals() {
      revealItems.forEach(function (item) {
        if (item.classList.contains("is-visible")) return;
        var rect = item.getBoundingClientRect();
        var enters = rect.top < window.innerHeight * 0.94 && rect.bottom > -window.innerHeight * 0.12;
        if (enters) item.classList.add("is-visible");
      });
    }

    if (!("IntersectionObserver" in window)) {
      revealItems.forEach(function (item) { item.classList.add("is-visible"); });
      return;
    }
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) entry.target.classList.add("is-visible");
      });
    }, { threshold: 0.14, rootMargin: "0px 0px -6% 0px" });
    revealItems.forEach(function (item) { revealObserver.observe(item); });
    syncReveals();
    window.addEventListener("scroll", syncReveals, { passive: true });
    window.addEventListener("resize", syncReveals);
    window.setTimeout(syncReveals, 480);
    window.setTimeout(syncReveals, 1280);
  }

  function initCursor() {
    var glow = document.querySelector(".cursor-glow");
    if (!glow || prefersReducedMotion || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    window.addEventListener("pointermove", function (event) {
      body.classList.add("has-cursor");
      glow.style.transform = "translate3d(" + (event.clientX - 170) + "px," + (event.clientY - 170) + "px,0)";
    }, { passive: true });
    document.addEventListener("pointerleave", function () {
      body.classList.remove("has-cursor");
    });
  }

  function initMagnetic() {
    document.querySelectorAll(".magnetic").forEach(function (item) {
      item.addEventListener("pointermove", function (event) {
        if (prefersReducedMotion) return;
        var rect = item.getBoundingClientRect();
        var x = (event.clientX - rect.left - rect.width / 2) / rect.width;
        var y = (event.clientY - rect.top - rect.height / 2) / rect.height;
        item.style.setProperty("--mx", (x * 12).toFixed(2) + "px");
        item.style.setProperty("--my", (y * 12).toFixed(2) + "px");
      });
      item.addEventListener("pointerleave", function () {
        item.style.removeProperty("--mx");
        item.style.removeProperty("--my");
      });
    });

    document.querySelectorAll("[data-tilt]").forEach(function (card) {
      card.addEventListener("pointermove", function (event) {
        if (prefersReducedMotion) return;
        var rect = card.getBoundingClientRect();
        var x = (event.clientX - rect.left) / rect.width - 0.5;
        var y = (event.clientY - rect.top) / rect.height - 0.5;
        card.style.transform = "perspective(1000px) rotateY(" + (x * 7).toFixed(2) + "deg) rotateX(" + (-y * 7).toFixed(2) + "deg) translate3d(var(--mx,0),var(--my,0),0)";
      });
      card.addEventListener("pointerleave", function () {
        card.style.transform = "";
      });
    });
  }

  function scrollToTarget(selector, options) {
    if (scrollEngine && scrollEngine.scrollTo) scrollEngine.scrollTo(selector, options || { duration: 1.1 });
    else {
      if (typeof selector === "number") {
        window.scrollTo({ top: selector, behavior: "smooth" });
        return;
      }
      var target = typeof selector === "string" ? document.querySelector(selector) : selector;
      if (target && target.scrollIntoView) target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  function normalizePath(pathname) {
    return pathname.replace(/\/index\.html$/, "/").replace(/\/$/, "/");
  }

  function samePageUrl(url) {
    return url.origin === window.location.origin && normalizePath(url.pathname) === normalizePath(window.location.pathname);
  }

  function initAnchorLinks() {
    document.querySelectorAll("a[href]").forEach(function (link) {
      link.addEventListener("click", function (event) {
        if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        var href = link.getAttribute("href");
        if (!href || href === "#") return;
        var url;
        try {
          url = new URL(href, window.location.href);
        } catch (error) {
          return;
        }
        if (!samePageUrl(url)) return;
        if (!url.hash) {
          event.preventDefault();
          closeNavigation();
          scrollToTarget(0, { duration: 0.95 });
          return;
        }
        var target = document.querySelector(url.hash);
        if (!target) return;
        event.preventDefault();
        closeNavigation();
        scrollToTarget(target, { offset: -20, duration: 1.15 });
      });
    });
  }

  function initStory() {
    var story = document.querySelector("[data-story]");
    if (!story) return;
    var title = story.querySelector("[data-story-title]");
    var text = story.querySelector("[data-story-text]");
    var indexText = story.querySelector("[data-story-index]");
    var steps = Array.prototype.slice.call(story.querySelectorAll("[data-story-step]"));
    var activeStory = -1;
    var slides = [
      {
        title: "文明从陶纹醒来",
        text: "仰韶村遗址、彩陶纹样与博物馆展陈，是渑池最有辨识度的文化名片。",
        image: "url('/img/generated-culture.png')"
      },
      {
        title: "峡谷把黄河切开",
        text: "黄河丹峡以红色石英砂岩、U 型峡谷、深潭清溪构成强烈的自然画面。",
        image: "url('/img/generated-canyon.png')"
      },
      {
        title: "会盟让历史有声",
        text: "秦赵会盟、完璧归赵相关故事，让渑池不只是风景，更是可以讲述的历史现场。",
        image: "url('/img/mingchi-scenic-02.png')"
      },
      {
        title: "烟火落回街巷",
        text: "仰韶大杏、坻坞小米、柿饼、丹参和地方小吃，把家乡味道写进日常。",
        image: "url('/img/generated-life.png')"
      }
    ];

    function setStory(active) {
      active = Math.max(0, Math.min(slides.length - 1, active));
      if (active === activeStory) return;
      activeStory = active;
      var slide = slides[active];
      story.style.setProperty("--story-image", slide.image);
      story.style.setProperty("--story-scale", (1.06 + active * 0.035).toFixed(2));
      story.style.setProperty("--story-rotate", (-active * 10) + "deg");
      story.dataset.activeStory = String(active);
      if (title) {
        title.textContent = slide.title;
        title.removeAttribute("data-split-ready");
        splitText();
        if (title.closest(".story-head")) title.closest(".story-head").classList.add("is-visible");
      }
      if (text) text.textContent = slide.text;
      if (indexText) indexText.textContent = String(active + 1).padStart(2, "0");
      steps.forEach(function (step, index) {
        step.classList.toggle("is-active", index === active);
      });
    }

    function updateStoryByScroll() {
      var y = getScrollY();
      var start = story.offsetTop;
      var max = Math.max(1, story.offsetHeight - window.innerHeight);
      var pct = Math.max(0, Math.min(1, (y - start) / max));
      var active = Math.min(slides.length - 1, Math.floor(pct * slides.length));
      story.style.setProperty("--story-y", (pct * -100).toFixed(1) + "px");
      story.style.setProperty("--story-progress", pct.toFixed(3));
      story.style.setProperty("--story-hotspot", (16 + pct * 58).toFixed(2) + "%");
      story.style.setProperty("--story-glow-x", (28 + pct * 42).toFixed(2) + "%");
      story.style.setProperty("--story-scan-x", (pct * -80).toFixed(2) + "px");
      story.style.setProperty("--story-ring-scale", (1 + pct * 0.12).toFixed(3));
      story.style.setProperty("--story-head-y", (pct * -34).toFixed(2) + "px");
      story.style.setProperty("--story-step-y", ((pct - 0.5) * -18).toFixed(2) + "px");
      setStory(active);
    }

    setStory(0);
    updateStoryByScroll();
    window.addEventListener("scroll", updateStoryByScroll, { passive: true });
    window.addEventListener("resize", updateStoryByScroll);
    if (scrollEngine && scrollEngine.lenisInstance) scrollEngine.lenisInstance.on("scroll", updateStoryByScroll);

    steps.forEach(function (step) {
      step.addEventListener("click", function () {
        var i = Number(step.getAttribute("data-story-step"));
        var max = story.offsetHeight - window.innerHeight;
        scrollToTarget(story.offsetTop + max * (i / slides.length + 0.045), { duration: 1.15 });
      });
    });
  }

  function initMotionLab() {
    var lab = document.querySelector("[data-motion-lab]");
    if (!lab) return;
    var cards = Array.prototype.slice.call(lab.querySelectorAll("[data-lab-card]"));

    function updateLab() {
      var rect = lab.getBoundingClientRect();
      var total = Math.max(1, rect.height + window.innerHeight);
      var pct = Math.max(0, Math.min(1, (window.innerHeight - rect.top) / total));
      lab.style.setProperty("--lab-progress", pct.toFixed(4));
      lab.style.setProperty("--lab-hotspot", (8 + pct * 72).toFixed(2) + "%");
      lab.style.setProperty("--lab-rotate", (pct * 220).toFixed(2) + "deg");
      lab.style.setProperty("--lab-grid-x", (pct * -120).toFixed(2) + "px");
      lab.style.setProperty("--lab-grid-y", (pct * -60).toFixed(2) + "px");
      lab.style.setProperty("--lab-scan-x", (-38 + pct * 420).toFixed(2) + "%");
      lab.style.setProperty("--lab-card-x", ((pct - 0.5) * 44).toFixed(2) + "px");
      lab.style.setProperty("--lab-img-scale", (1.02 + pct * 0.08).toFixed(3));
      lab.style.setProperty("--lab-img-y", (pct * -20).toFixed(2) + "px");
      cards.forEach(function (card, index) {
        var cardRect = card.getBoundingClientRect();
        var active = cardRect.top < window.innerHeight * 0.72 && cardRect.bottom > window.innerHeight * 0.18;
        card.classList.toggle("is-active", active);
        card.style.setProperty("--lab-card", String(index));
        card.style.setProperty("--lab-card-rot", ((index - 1.5) * 1.4).toFixed(2) + "deg");
      });
    }

    updateLab();
    window.addEventListener("scroll", updateLab, { passive: true });
    window.addEventListener("resize", updateLab);
  }

  function initTabs() {
    document.querySelectorAll("[data-tabs]").forEach(function (tabs) {
      var buttons = tabs.querySelectorAll("[data-tab]");
      var panels = tabs.querySelectorAll("[data-panel]");
      buttons.forEach(function (button) {
        button.addEventListener("click", function () {
          var key = button.getAttribute("data-tab");
          buttons.forEach(function (item) { item.classList.toggle("is-active", item === button); });
          panels.forEach(function (panel) { panel.classList.toggle("is-active", panel.getAttribute("data-panel") === key); });
        });
      });
    });
  }

  function initForms() {
    document.querySelectorAll("[data-message-form]").forEach(function (form) {
      var status = form.querySelector(".form-status");
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        if (!form.checkValidity()) {
          if (status) {
            status.textContent = "请先补全必填信息，我才能生成你的渑池计划。";
            status.style.color = "#f3c96b";
          }
          form.reportValidity();
          return;
        }
        var data = new FormData(form);
        var name = data.get("name") || "同学";
        var interest = data.get("interest") || "渑池";
        if (status) {
          status.textContent = name + "，你的“" + interest + "”主题计划已生成，本地模拟提交成功。";
          status.style.color = "#67ddcf";
        }
        form.reset();
      });
    });
  }

  splitText();
  initNavigation();
  initLocomotiveScroll();
  initReveals();
  initCursor();
  initMagnetic();
  initAnchorLinks();
  initStory();
  initMotionLab();
  initTabs();
  initForms();
  updateScrollChrome();
  runLoader();
})();
