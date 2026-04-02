// wina-ui/select.js
(function () {
  class CustomSelect {
    constructor(select) {
      this.select = select;
      this.init();
    }

    init() {
      // sembunyikan select asli
      this.select.style.display = "none";

      // wrapper
      this.wrapper = document.createElement("div");
      this.wrapper.className = "custom-select-wrapper";

      // trigger
      this.trigger = document.createElement("div");
      this.trigger.className = "select-trigger";
      this.trigger.setAttribute("role", "button");
      this.trigger.tabIndex = 0;

      this.trigger.innerHTML = `
        <span>${this.select.options[this.select.selectedIndex]?.text || "Pilih"}</span>
        <span>▼</span>
      `;

      // options container
      this.optionsList = document.createElement("div");
      this.optionsList.className = "custom-options";
      this.optionsList.setAttribute("role", "listbox");

      // generate options
      Array.from(this.select.options).forEach(opt => {
        const customOpt = document.createElement("span");
        customOpt.className = "custom-option";
        customOpt.innerText = opt.text;
        customOpt.dataset.value = opt.value;

        // default selected
        if (opt.selected) {
          customOpt.classList.add("selected");
        }

        customOpt.addEventListener("click", () => {
          this.select.value = opt.value;
          this.trigger.querySelector("span").innerText = opt.text;

          this.optionsList.querySelectorAll(".custom-option")
            .forEach(el => el.classList.remove("selected"));

          customOpt.classList.add("selected");

          this.close();
          this.select.dispatchEvent(new Event("change"));
        });

        this.optionsList.appendChild(customOpt);
      });

      this.wrapper.appendChild(this.trigger);
      this.wrapper.appendChild(this.optionsList);

      this.select.parentNode.insertBefore(this.wrapper, this.select.nextSibling);

      // event click trigger
      this.trigger.addEventListener("click", (e) => {
        e.stopPropagation();
        CustomSelect.closeAll(this.optionsList);
        this.optionsList.classList.toggle("open");
      });

      // keyboard support
      this.trigger.addEventListener("keydown", (e) => {
        if (e.key === "Enter") this.optionsList.classList.toggle("open");
        if (e.key === "Escape") this.close();
      });
    }

    close() {
      this.optionsList.classList.remove("open");
    }

    static closeAll(except) {
      document.querySelectorAll(".custom-options").forEach(el => {
        if (el !== except) el.classList.remove("open");
      });
    }
  }

  // init semua select
  function initCustomSelect() {
    document.querySelectorAll("select").forEach(select => {
      if (!select.dataset.customized) {
        new CustomSelect(select);
        select.dataset.customized = "true";
      }
    });
  }

  // auto init saat load
  document.addEventListener("DOMContentLoaded", initCustomSelect);

  // close saat klik luar
  window.addEventListener("click", () => {
    CustomSelect.closeAll();
  });

  // expose ke global (opsional, kalau mau re-init manual)
  window.CustomSelectInit = initCustomSelect;
})();
