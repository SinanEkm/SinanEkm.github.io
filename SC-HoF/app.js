(async () => {
  const [authors, meta] = await Promise.all([
    fetch("data/authors.json").then(r => r.json()),
    fetch("data/meta.json").then(r => r.json()),
  ]);

  document.getElementById("meta").textContent =
    `${meta.total_authors.toLocaleString()} authors · ${meta.total_papers.toLocaleString()} papers · SC ${meta.first_year}–${meta.last_year}`;

  const tbody = document.querySelector("#authors tbody");
  const search = document.getElementById("search");
  const minPapers = document.getElementById("minPapers");
  const headers = document.querySelectorAll("th.sortable, th[data-key='papers']");
  let sortKey = "papers";
  let sortDir = "desc";

  function pidToFile(pid) { return pid.replace(/\//g, "_"); }

  function render() {
    const q = search.value.trim().toLowerCase();
    const minP = parseInt(minPapers.value, 10) || 1;
    let rows = authors.filter(a => a.papers >= minP);
    if (q) rows = rows.filter(a => a.name.toLowerCase().includes(q));
    rows.sort((a, b) => {
      let av = a[sortKey], bv = b[sortKey];
      if (typeof av === "string") { av = av.toLowerCase(); bv = bv.toLowerCase(); }
      if (av < bv) return sortDir === "asc" ? -1 : 1;
      if (av > bv) return sortDir === "asc" ? 1 : -1;
      return a.name.localeCompare(b.name);
    });
    tbody.innerHTML = rows.map((a, i) => `
      <tr>
        <td class="num">${i + 1}</td>
        <td><a href="author.html?pid=${encodeURIComponent(a.pid)}">${escapeHtml(a.name)}</a></td>
        <td class="num">${a.papers}</td>
        <td class="num">${a.first_year}</td>
        <td class="num">${a.last_year}</td>
        <td class="num">${a.years_active}</td>
      </tr>
    `).join("");
  }

  function escapeHtml(s) {
    return s.replace(/[&<>"']/g, c => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    }[c]));
  }

  headers.forEach(th => {
    th.classList.add("sortable");
    th.addEventListener("click", () => {
      const key = th.dataset.key;
      if (key === "rank") return;
      if (sortKey === key) {
        sortDir = sortDir === "asc" ? "desc" : "asc";
      } else {
        sortKey = key;
        sortDir = (key === "name") ? "asc" : "desc";
      }
      headers.forEach(h => h.classList.remove("active", "asc", "desc"));
      th.classList.add("active", sortDir);
      render();
    });
  });

  search.addEventListener("input", render);
  minPapers.addEventListener("input", render);
  render();
})();
