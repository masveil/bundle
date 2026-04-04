(function () {
  const theme = {
    primaryColor: "#3498db",
    borderColor: "#0006",
    hoverColor: "#f0f8ff",
    textColor: "#333",
    borderRadius: "8px",
    width: "250px",
    bgContainer: "#ffffff"
  };

  const style = document.createElement('style');
  style.textContent = `
    .custom-select-wrapper {
      position: relative;
      display: inline-block;
      width: ${theme.width};
      font-family: inherit;
      color: ${theme.textColor};
      font-size: 14px;
      vertical-align: middle;
    }

    /* Bikin select asli jadi transparan dan nutupin wrapper */
    .custom-select-wrapper select {
      position: absolute;
      top: 0; left: 0; width: 100%; height: 100%;
      opacity: 0;
      cursor: pointer;
      z-index: 2; /* Di atas trigger */
    }

    .select-trigger {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 8px;
      background: #fff;
      border: 1px solid ${theme.borderColor};
      border-radius: ${theme.borderRadius};
      transition: all 0.3s ease;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06);
      position: relative;
      z-index: 1;
    }

    /* Style pas select asli difokuskan */
    .custom-select-wrapper select:focus + .select-trigger {
      border-color: ${theme.primaryColor};
      box-shadow: 0 0 0 4px color-mix(in srgb, ${theme.primaryColor}, transparent 80%);
    }

    .custom-options {
      position: absolute;
      top: 100%; left: 0; right: 0;
      background: white;
      border: 1px solid #ddd;
      border-radius: ${theme.borderRadius};
      margin-top: 5px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      max-height: 200px;
      overflow-y: auto;
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
      font-weight: bold;
    }
  `;
  document.head.appendChild(style);

  class CustomSelect {
    constructor(select) {
      this.select = select;
      this.init();
    }

    init() {
      // Bungkus select aslinya, JANGAN disembunyiin (display: none)
      this.wrapper = document.createElement("div");
      this.wrapper.className = "custom-select-wrapper";
      
      this.select.parentNode.insertBefore(this.wrapper, this.select);
      this.wrapper.appendChild(this.select);

      // Bikin trigger (tampilan visual select-nya)
      this.trigger = document.createElement("div");
      this.trigger.className = "select-trigger";
      this.trigger.innerHTML = `
        <span>${this.select.options[this.select.selectedIndex]?.text || "Pilih"}</span>
        <span>▼</span>
      `;
      this.wrapper.appendChild(this.trigger);

      // Bikin list dropdown
      this.optionsList = document.createElement("div");
      this.optionsList.className = "custom-options";

      this.renderOptions();
      this.wrapper.appendChild(this.optionsList);

      // CEGAT KLIK ASLI
      this.select.addEventListener("mousedown", (e) => {
        // Mencegah dropdown asli muncul di beberapa browser
        e.preventDefault();
        this.select.focus();
        this.toggleDropdown();
      });

      // Tetap sinkron kalau select diubah lewat script lain
      this.select.addEventListener("change", () => {
        this.updateTrigger();
      });
    }

    renderOptions() {
      this.optionsList.innerHTML = "";
      Array.from(this.select.options).forEach(opt => {
        const customOpt = document.createElement("span");
        customOpt.className = "custom-option";
        customOpt.innerText = opt.text;
        if (opt.selected) customOpt.classList.add("selected");

        customOpt.addEventListener("click", (e) => {
          e.stopPropagation();
          this.select.value = opt.value;
          this.updateTrigger();
          this.close();
          // Trigger event change manual biar aplikasi lain tahu
          this.select.dispatchEvent(new Event("change"));
        });
        this.optionsList.appendChild(customOpt);
      });
    }

    updateTrigger() {
      this.trigger.querySelector("span").innerText = this.select.options[this.select.selectedIndex]?.text;
      this.optionsList.querySelectorAll(".custom-option").forEach((el, index) => {
        el.classList.toggle("selected", index === this.select.selectedIndex);
      });
    }

    toggleDropdown() {
      const isOpen = this.optionsList.classList.contains("open");
      CustomSelect.closeAll();
      if (!isOpen) this.optionsList.classList.add("open");
    }

    close() { this.optionsList.classList.remove("open"); }

    static closeAll() {
      document.querySelectorAll(".custom-options").forEach(el => el.classList.remove("open"));
    }
  }

  function init() {
    document.querySelectorAll("select").forEach(s => {
      if (!s.dataset.customized) {
        new CustomSelect(s);
        s.dataset.customized = "true";
      }
    });
  }

  document.addEventListener("DOMContentLoaded", init);
  window.addEventListener("click", (e) => {
    if (!e.target.closest(".custom-select-wrapper")) CustomSelect.closeAll();
  });
})();
