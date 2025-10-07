// === RENDER MARKDOWN SIMPLE ===
function renderMarkdown(md) {
  if (!md) return '';
  return md
    .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')   // **bold**
    .replace(/\*(.*?)\*/g, '<i>$1</i>')       // *italic*
    .replace(/__(.*?)__/g, '<u>$1</u>')       // __underline__
    .replace(/`(.*?)`/g, '<code>$1</code>')   // `inline code`
    .replace(/\n/g, '<br>');                  // enter → <br>
}

// === INLINE MARKDOWN EDITOR ===
document.addEventListener('DOMContentLoaded', function() {
  const editor = document.getElementById('catatan');
  const hidden = document.querySelector('input[name="catatan"]');
  if (!editor || !hidden) return;

  // pas load awal (biar isi lama juga tampil)
  if (hidden.value) {
    editor.innerHTML = renderMarkdown(hidden.value);
  }

  editor.addEventListener('input', function() {
    // ambil posisi kursor
    let sel = window.getSelection();
    let range = sel.rangeCount ? sel.getRangeAt(0) : null;
    let pos = range ? range.startOffset : 0;

    // render markdown
    editor.innerHTML = renderMarkdown(editor.textContent);

    // balikin posisi kursor
    if (range) {
      const newRange = document.createRange();
      const firstNode = editor.firstChild || editor;
      try {
        newRange.setStart(firstNode, Math.min(pos, firstNode.length || 0));
        newRange.collapse(true);
        sel.removeAllRanges();
        sel.addRange(newRange);
      } catch(e) {}
    }

    // simpan teks mentah ke input hidden
    hidden.value = editor.textContent;
  });

  // efek fokus biar cantik dikit 😍
  editor.addEventListener('focus', ()=>{ editor.style.outline = '2px solid #16a34a44'; });
  editor.addEventListener('blur', ()=>{ editor.style.outline = 'none'; });
});
