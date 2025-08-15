document.addEventListener("DOMContentLoaded", () => {
  const style = document.createElement("style");
  style.innerHTML = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@200;300;400;600&display=swap');

#jadwal-content {
  font-family: 'Inter', sans-serif;
  background: #fefefe;
  color: #444;
  padding: 1em;
  max-width: 700px;
  margin: auto;
}

#jadwal-content .nav {
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
#jadwal-content .nav a {
  background: #ffe89a;
  font-size: 16px;
  padding: 6px 12px;
  border-radius: 999px;
  font-weight: 300;
  color: #444;
  text-decoration: none;
  transition: background 0.3s ease;
}
#jadwal-content .nav a:hover { background: #ffd74c; }
#jadwal-content .nav a svg { vertical-align: middle; margin-right: 6px; }
#jadwal-content .nav a:last-child svg { margin-left: 6px; margin-right: 0; }

#jadwal-content table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 1em;
  box-shadow: 0 0 5px rgba(0,0,0,0.05);
}
#jadwal-content th, #jadwal-content td {
  border: 1px solid #ddd;
  padding: 10px 8px;
  text-align: center;
}
#jadwal-content th {
  background: #f0f8f5;
  font-weight: 600;
}
#jadwal-content tr.aktif td {
  background: rgba(45,215,70,0.2);
  font-weight: bold;
  border-left: 2px solid #4caf50;
}
#jadwal-content tr:hover td {
  background: #f9fff8;
}
#jadwal-content .istirahat td {
  background: #f9f9f9 !important;
  font-style: italic;
  color: #777;
}
#jadwal-content h3 {
  margin-top: 2em;
  color: #5d9b84;
}
#jadwal-content .detail-row td { padding: 0; border: none; }
#jadwal-content .detail-content {
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.4s ease;
  padding: 0 10px;
}
#jadwal-content .detail-content.open {
  max-height: 1000px;
  padding: 10px;
}
#jadwal-content .hari-title {
  font-weight: bold;
  margin-top: 1em;
  margin-bottom: 0.5em;
  color: #336;
}

/* DARK MODE */
@media (prefers-color-scheme: dark) {
  #jadwal-content {
    background: #1e1e1e;
    color: #e0e0e0;
  }
  #jadwal-content .nav {
    background: #2d3e38;
  }
  #jadwal-content .nav a {
    background: #4d634f;
    color: #fff;
  }
  #jadwal-content .nav a:hover {
    background: #6b8a6e;
  }
  #jadwal-content table {
    border-color: #444;
  }
  #jadwal-content th {
    background: #2f4f3f;
    color: #fff;
  }
  #jadwal-content td {
    border-color: #444;
  }
  #jadwal-content tr:hover td {
    background: #2a2a2a;
  }
  #jadwal-content tr.aktif td {
    background: rgba(45,215,70,0.2);
  }
  #jadwal-content .istirahat td {
    background: #333 !important;
    color: #aaa;
  }
  #jadwal-content .hari-title {
    color: #8fdc8f;
  }
  #jadwal-content h3 {
    color: #8de1c5;
  }
}
  `;
  const target = document.getElementById("jadwal-content") || document.body;
  target.prepend(style);

  // Toggle guru
  function pasangEventGuruToggle() {
    let lastOpenedGuruId = null;
    document.querySelectorAll(".guru-row").forEach(row => {
      row.addEventListener("click", () => {
        const guruId = row.getAttribute("data-guru");
        const detail = document.querySelector(`tr[data-detail="${guruId}"]`);
        const content = detail?.querySelector(".detail-content");
        const isOpen = content?.classList.contains("open");

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

  pasangEventGuruToggle();

  document.addEventListener("click", function (e) {
    const link = e.target.closest("a[data-hari]");
    if (link) {
      e.preventDefault();
      const hari = link.getAttribute("data-hari");
      fetch("?hari=" + hari + "&mode=html")
        .then(res => res.text())
        .then(html => {
          document.getElementById("content").innerHTML = html;
          pasangEventGuruToggle();
        });
    }
  });
});
