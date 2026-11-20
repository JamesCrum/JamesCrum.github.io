(function () {
  var pages = ["home", "research", "lecturing", "lab", "elenca"];
  var titles = {
    home: "James Crum, PhD",
    research: "Research — James Crum, PhD",
    lecturing: "Lecturing — James Crum, PhD",
    lab: "CRUM Lab — James Crum, PhD",
    elenca: "Elenca — James Crum, PhD"
  };

  function pageFor(raw) {
    if (!raw || raw === "home" || raw === "contact" || raw === "main") return "home";
    if (raw === "modules" || raw === "consulting" || raw === "exercises") return "elenca";
    if (pages.indexOf(raw) !== -1) return raw;
    return "home";
  }

  function mark() {
    var page = pageFor((location.hash || "").replace(/^#/, ""));
    document.querySelectorAll("[data-nav]").forEach(function (link) {
      if (link.getAttribute("data-nav") === page) link.setAttribute("aria-current", "page");
      else link.removeAttribute("aria-current");
    });
    document.title = titles[page];
    if (page === "home") window.dispatchEvent(new Event("resize"));
  }

  window.addEventListener("hashchange", mark);
  mark();
})();
