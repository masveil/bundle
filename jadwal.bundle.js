document.addEventListener("DOMContentLoaded", () => {
  // Inject CSS
  const style = document.createElement("style");
  style.innerHTML = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@200;300;400;600&display=swap');
    body {
      font-family: 'Inter', sans-serif;
      background: #fefefe;
      padding: 1em;
      max-width: 700px;
      margin: auto;
      color: #444;
    }
    .nav {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5em;
      background: #a7d7c5;
      border-radius: 8px;
      padding: 0.5em 1em;
      font-size: 24px;
      font-weight: 500;
    }
    .nav a {
      background: #ffe89a;
      font-size: 16px;
      padding: 6px 12px;
      border-radius: 999px;
      font-weight: 300;
      color: #444;
      text-decoration: none;
      transition: background 0.3s ease;
    }
    .nav a:hover { background: #ffd74c; }
    .nav a svg { vertical-align: middle; margin-right: 6px; }
    .nav a:last-child svg { margin-left: 6px; margin-right: 0; }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 1em;
      box-shadow: 0 0 5px rgba(0,0,0,0.05);
    }
    th, td {
      border: 1px solid #ddd;
      padding: 10px 8px;
      text-align: center;
    }
    th { background: #f0f8f5; font-weight: 600; }
    tr.aktif td {
      background: rgba(45,215,70,0.2);
      font-weight: bold;
      border-left: 2px solid #4caf50;
    }
    tr:hover td { background: #f9fff8; }
    .istirahat td {
      background: #f9f9f9 !important;
      font-style: italic;
      color: #777;
    }
    h3 {
      margin-top: 2em;
      color: #5d9b84;
    }
    .detail-row td { padding: 0; border: none; }
    .detail-content {
      max-height: 0;
      overflow: hidden;
      transition: max-height 0.4s ease;
      padding: 0 10px;
    }
    .detail-content.open {
      max-height: 1000px;
      padding: 10px;
    }
    .hari-title { font-weight: bold; margin-top: 1em; margin-bottom: 0.5em; color: #336; }
    @media (prefers-color-scheme: dark) {
  body {
    background: #1e1e1e;
    color: #e0e0e0;
  }

  .nav {
    background: #2d3e38;
  }

  .nav a {
    background: #4d634f;
    color: #fff;
  }

  .nav a:hover {
    background: #6b8a6e;
  }

  table {
    border-color: #444;
  }

  th {
    background: #2f4f3f;
    color: #fff;
  }

  td {
    border-color: #444;
  }

  tr:hover td {
    background: #2a2a2a;
  }

  tr.aktif td {
    background: rgba(45,215,70,0.2);
  }

  .istirahat td {
    background: #333 !important;
    color: #aaa;
  }

  .hari-title {
    color: #8fdc8f;
  }

  h3 {
    color: #8de1c5;
  }
}

  `;
  document.head.appendChild(style);

  // Fungsi toggle interaktif
  function pasangEventGuruToggle() {
    let lastOpenedGuruId = null;
    document.querySelectorAll(".guru-row").forEach(row => {
      row.addEventListener("click", () => {
        const guruId = row.getAttribute("data-guru");
        const detail = document.querySelector('tr[data-detail="' + guruId + '"]');
        const content = detail?.querySelector(".detail-content");
        const isOpen = content?.classList.contains("open");

        // Tutup semua
        document.querySelectorAll(".detail-content").forEach(dc => dc.classList.remove("open"));
        document.querySelectorAll(".detail-row").forEach(r => r.style.display = "none");

        if (!isOpen) {
          detail.style.display = "table-row";
          setTimeout(() => {
            content.classList.add("open");
          }, 10);
          lastOpenedGuruId = guruId;
        } else {
          lastOpenedGuruId = null;
        }
      });
    });
  }

  // Jalankan pertama kali
  pasangEventGuruToggle();

  // Support AJAX navigasi antar hari di halaman utama Worker
  document.addEventListener("click", function (e) {
    const link = e.target.closest("a[data-hari]");
    if (link) {
      e.preventDefault();
      const hari = link.getAttribute("data-hari");
      fetch("?hari=" + hari + "&mode=html")
        .then(res => res.text())
        .then(html => {
          document.getElementById("content").innerHTML = html;
          pasangEventGuruToggle(); // ulangi toggle
        });
    }
  });
});

