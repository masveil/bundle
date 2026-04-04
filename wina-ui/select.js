// wina-ui/select.js
(function () {
  // --- KONFIGURASI WARNA & STYLE (Bisa diubah-ubah di sini) ---
  const theme = {
    primaryColor: "#3498db",
    borderColor: "#0006"
    hoverColor: "#f0f8ff",
    textColor: "#333",
    borderRadius: "8px",
    width: "250px",
    bgContainer: "#ffffff"
  };

  // --- INJECT CSS KE HEAD ---
  const style = document.createElement('style');
  style.textContent = `
    .custom-select-wrapper {
      position: relative;
      display: inline-block;
      user-select: none;
      width: ${theme.width};
      font-family: inherit;
      color: ${theme.textColor};
      font-size: 14px;
    }
    .select-trigger {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 8px;
      background: ${theme.bgContainer};
      border: 1px solid ${theme.borderColor};
      border-radius: ${theme.borderRadius};
      cursor: pointer;
      transition: all 0.3s ease;
      margin: 0;
      background: #fff;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06);
    }
    .select-trigger:focus {
      outline: none !important;
      border-color: ${theme.primaryColor} !important;
      box-shadow: 0 0 0 4px color-mix(in srgb, ${theme.primaryColor}, transparent 80%), 0 1px 5px rgba(0, 0, 0, 0.1) !important;
    }
    .custom-options {
      position: absolute;
      top: 100%; left: 0; right: 0;
      background: white;
      border: 1px solid #ddd;
      border-radius: ${theme.borderRadius};
      margin-top: 5px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.06);
      overflow: auto;
      display: none;
      z-index: 999;
    }
    .custom-options.open { display: block; }
    .custom-option {
      padding: 8px 10px;
      display: block;
      cursor: pointer;
    }
    .custom-option:hover {
      background: ${theme.primaryColor};
      color: white;
    }
    .custom-option.selected {
      background: ${theme.hoverColor};
      color: ${theme.primaryColor};
    }
  `;
  document.head.appendChild(style);

  // --- LOGIKA CLASS CUSTOM SELECT (Sama kayak tadi) ---
  class CustomSelect {
    constructor(select) {
      this.select = select;
      this.init();
    }

    init() {
      this.select.style.display = "none";
      this.wrapper = document.createElement("div");
      this.wrapper.className = "custom-select-wrapper";

      this.trigger = document.createElement("div");
      this.trigger.className = "select-trigger";
      this.trigger.setAttribute("role", "button");
      this.trigger.tabIndex = 0;
      this.trigger.innerHTML = `
        <span>${this.select.options[this.select.selectedIndex]?.text || "Pilih"}</span>
        <span>▼</span>
      `;

      this.optionsList = document.createElement("div");
      this.optionsList.className = "custom-options";

      Array.from(this.select.options).forEach(opt => {
        const customOpt = document.createElement("span");
        customOpt.className = "custom-option";
        customOpt.innerText = opt.text;
        if (opt.selected) customOpt.classList.add("selected");

        customOpt.addEventListener("click", () => {
          this.select.value = opt.value;
          this.trigger.querySelector("span").innerText = opt.text;
          this.optionsList.querySelectorAll(".custom-option").forEach(el => el.classList.remove("selected"));
          customOpt.classList.add("selected");
          this.close();
          this.select.dispatchEvent(new Event("change"));
        });
        this.optionsList.appendChild(customOpt);
      });

      this.wrapper.appendChild(this.trigger);
      this.wrapper.appendChild(this.optionsList);
      this.select.parentNode.insertBefore(this.wrapper, this.select.nextSibling);

      this.trigger.addEventListener("click", (e) => {
        e.stopPropagation();
        CustomSelect.closeAll(this.optionsList);
        this.optionsList.classList.toggle("open");
      });
    }

    close() { this.optionsList.classList.remove("open"); }
    static closeAll(except) {
      document.querySelectorAll(".custom-options").forEach(el => {
        if (el !== except) el.classList.remove("open");
      });
    }
  }

  function initCustomSelect() {
    document.querySelectorAll("select").forEach(select => {
      if (!select.dataset.customized) {
        new CustomSelect(select);
        select.dataset.customized = "true";
      }
    });
  }

  document.addEventListener("DOMContentLoaded", initCustomSelect);
  window.addEventListener("click", () => CustomSelect.closeAll());
  window.CustomSelectInit = initCustomSelect;
})();
