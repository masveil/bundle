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
  `;
  document.head.appendChild(style);

  // Modal tombol jadwal
  const btn = document.getElementById('btn-jadwal');
  const dlg = document.getElementById('modal-jadwal');
  const content = document.getElementById('jadwal-content');

  if (btn && dlg && content) {
    btn.addEventListener('click', async (e) => {
      e.preventDefault();
      content.innerHTML = 'Memuat jadwal…';
      dlg.showModal();
      try {
        const resp = await fetch('https://jadwal.maarifdh.sch.id/embed', { credentials: 'omit' });
        if (!resp.ok) throw new Error('Gagal memuat');
        const html = await resp.text();
        content.innerHTML = html;
      } catch (err) {
        content.innerHTML = '<p>Maaf, jadwal tidak bisa dimuat sekarang.</p>';
      }
    });

    document.addEventListener('keydown', (ev) => {
      if (ev.key === 'Escape' && typeof dlg.close === 'function') dlg.close();
    });
  }

  // Tambahan: menu-button open in new tab
  document.querySelectorAll('.menu-button').forEach(link => {
    if (link.dataset.newtab !== "false") {
      link.setAttribute('target', '_blank');
      link.setAttribute('rel', 'noopener noreferrer');
    }
  });

  // Optional: background slider & progress bar (kalau dipakai)
  const imgEl = document.getElementById("slide-gambar");
  const fillEl = document.querySelector(".progress-fill");

  if (imgEl && fillEl) {
    const gambarList = [
      "https://ik.imagekit.io/maarifdh/gambar/1.jpg",
      "https://ik.imagekit.io/maarifdh/gambar/2.jpg",
      "https://ik.imagekit.io/maarifdh/gambar/3.jpg",
      "https://ik.imagekit.io/maarifdh/gambar/5.jpg",
      "https://ik.imagekit.io/maarifdh/gambar/6.jpg",
      "https://ik.imagekit.io/maarifdh/gambar/7.jpg"
    ];
    let index = 0;

    function mulaiProgress() {
      fillEl.style.transition = "none";
      fillEl.style.width = "0%";
      void fillEl.offsetWidth;
      fillEl.style.transition = "width 4s linear";
      fillEl.style.width = "100%";
    }

    function gantiSlide() {
      imgEl.classList.add("fade-out");
      setTimeout(() => {
        index = (index + 1) % gambarList.length;
        imgEl.src = gambarList[index];
        imgEl.classList.remove("fade-out");
      }, 300);
      mulaiProgress();
    }

    mulaiProgress();
    setInterval(gantiSlide, 4000);
  }

  // Fade-in body (optional)
  window.addEventListener("load", () => {
    document.body.style.opacity = "1";
  });
});