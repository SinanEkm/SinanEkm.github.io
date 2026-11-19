(async () => {
  const params = new URLSearchParams(location.search);
  const pid = params.get("pid");
  if (!pid) { document.getElementById("name").textContent = "Missing pid"; return; }
  const safe = pid.replace(/\//g, "_");
  const data = await fetch(`data/author/${safe}.json`).then(r => {
    if (!r.ok) throw new Error("Not found");
    return r.json();
  }).catch(() => null);

  if (!data) {
    document.getElementById("name").textContent = "Author not found";
    return;
  }

  document.getElementById("name").textContent = data.name;
  document.getElementById("summary").textContent =
    `${data.papers} papers · SC ${data.first_year}–${data.last_year} · ${data.years_active} years active`;
  document.getElementById("dblp-link").href = `https://dblp.org/pid/${pid}.html`;

  const tbody = document.querySelector("#papers tbody");
  tbody.innerHTML = data.papers.map(p => {
    const authors = p.authors.map(a =>
      a.pid === pid
        ? `<strong>${escapeHtml(a.name)}</strong>`
        : `<a href="author.html?pid=${encodeURIComponent(a.pid)}">${escapeHtml(a.name)}</a>`
    ).join(", ");
    const title = p.ee
      ? `<a href="${escapeHtml(p.ee)}" target="_blank" rel="noopener">${escapeHtml(p.title)}</a>`
      : escapeHtml(p.title);
    return `
      <tr>
        <td class="num">${p.year}</td>
        <td>${title}</td>
        <td>${authors}</td>
      </tr>
    `;
  }).join("");

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, c => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    }[c]));
  }
})();
