async function exportSelectedToXLSX_Styled(){
  const rows = (typeof getSelectedRows === 'function') ? getSelectedRows() : [];
  if (!rows.length){ (typeof toast==='function') && toast('Belum ada yang dipilih'); return; }
  if (!window.ExcelJS){ (typeof toast==='function') && toast('ExcelJS belum dimuat'); return; }

  // ===== KONFIG HEADER =====
  const SCHOOL_NAME_TOP1 = "LEMBAGA PENDIDIKAN MA’ARIF NU SUKOHARJO";
  const SCHOOL_NAME_TOP2 = "MTs MA’ARIF DARUL HASAN POLOKARTO";
  const SCHOOL_ACC       = "TERAKREDITASI “A”";
  const SCHOOL_IDS       = "NSM: 121233110017     NPSN: 70008609";
  const SCHOOL_ADDR      = "Alamat: Dk. Jatisari, Mranggen, Polokarto, Sukoharjo";
  const SCHOOL_CONTACT   = "Email: mtsmaarif.darulhasan@gmail.com     Website: www.maarifdh.sch.id";
  const LOGO_URL         = "https://ik.imagekit.io/maarifdh/aset-gambar/logo-mts.png";

  const isMasuk = (typeof currentType !== 'undefined') ? (currentType === 'masuk') : true;

  const headers = isMasuk
    ? ['Agenda','Nomor Surat','Tanggal','Asal','Perihal','Penerima','Catatan']
    : ['Agenda','Nomor Surat','Tanggal','Tujuan','Perihal','Penandatangan','Catatan'];

  const keys = isMasuk
    ? ['nomor_agenda','nomor_surat','tanggal','asal','perihal','penerima','catatan']
    : ['nomor_agenda','nomor_surat','tanggal','tujuan','perihal','penandatangan','catatan'];

  const COLS = isMasuk
    ? [10, 28, 14, 26, 44, 22, 32]
    : [10, 28, 14, 26, 44, 22, 32];

  // ===== WORKBOOK & SHEET =====
  const wb = new ExcelJS.Workbook();
  wb.creator = 'Buku Surat';
  wb.created = new Date();

  const ws = wb.addWorksheet(isMasuk ? 'Masuk' : 'Keluar', {
    // no freeze panes
    pageSetup: {
      paperSize: 9, // A4
      orientation: 'landscape',
      fitToPage: true, fitToWidth: 1, fitToHeight: 0,
      margins: { left:0.5, right:0.5, top:0.6, bottom:0.6, header:0.3, footer:0.3 }
    },
    properties: { defaultRowHeight: 18 }
  });

  // ===== HEADER LEBAR + FONT ARIAL =====
  const lastCol = headers.length; // 7
  const lastColLetter = String.fromCharCode(64 + lastCol); // 'G'
  for (let r = 1; r <= 6; r++) ws.mergeCells(`A${r}:${lastColLetter}${r}`);

  const setHeaderCell = (addr, text, size, bold=false) => {
    const c = ws.getCell(addr);
    c.value = text;
    c.font = { name:'Arial', size, bold };
    c.alignment = { horizontal:'center', vertical:'middle', wrapText:true };
  };

  setHeaderCell('A1', SCHOOL_NAME_TOP1, 16, true);
  setHeaderCell('A2', SCHOOL_NAME_TOP2, 16, true);
  setHeaderCell('A3', SCHOOL_ACC,       12, true);
  setHeaderCell('A4', SCHOOL_IDS,       11, false);
  setHeaderCell('A5', SCHOOL_ADDR,      10, false);
  setHeaderCell('A6', SCHOOL_CONTACT,   10, false);

  // Logo kiri – pakai ukuran pixel supaya gak kebesaran
  try{
    const resp = await fetch(LOGO_URL);
    const buf  = await resp.arrayBuffer();
    const ext  = LOGO_URL.toLowerCase().endsWith('.png') ? 'png' : 'jpeg';
    const imgId = wb.addImage({ buffer: buf, extension: ext });
    ws.addImage(imgId, {
      tl:  { col: 0, row: 0 },       // pojok A1
      ext: { width: 120, height: 120 } // atur ukuran di sini (px)
    });
  }catch(_){}

  // Garis tebal 1 di bawah header (baris 7)
  const borderRow = 7;
  for (let c = 1; c <= lastCol; c++){
    ws.getCell(borderRow, c).border = { bottom: { style:'thick', color:{ argb:'FF000000' } } };
  }

  // Spacer 1 baris → tabel mulai baris 9
  const headerRowIdx = 9;

  // ===== HEADER TABEL =====
  ws.getRow(headerRowIdx).values = headers;
  ws.getRow(headerRowIdx).eachCell(cell=>{
    cell.font = { name:'Arial', size:10, bold:true };
    cell.alignment = { vertical:'middle', horizontal:'center', wrapText:true };
    cell.fill = { type:'pattern', pattern:'solid', fgColor:{argb:'FFEFEFEF'} };
    cell.border = { top:{style:'thin'}, left:{style:'thin'}, right:{style:'thin'}, bottom:{style:'thin'} };
  });
  ws.getRow(headerRowIdx).height = 22;

  // Lebar kolom tabel
  ws.columns = COLS.map(w => ({ width:w }));

  // ===== DATA ROWS (font default Arial 10) =====
  let rIdx = headerRowIdx + 1;
  const dateCol = headers.findIndex(h => h.toLowerCase().includes('tanggal')) + 1; // 1-based

  for (const r of rows){
    const rowVals = keys.map(k => r[k] ?? '');
    if (dateCol > 0){
      const iso = r[keys[dateCol-1]];
      if (typeof iso === 'string' && /^\d{4}-\d{2}-\d{2}/.test(iso)){
        rowVals[dateCol-1] = new Date(iso.slice(0,10)+'T00:00:00');
      }
    }

    ws.getRow(rIdx).values = rowVals;

    ws.getRow(rIdx).eachCell((cell, c)=>{
      cell.font = { name:'Arial', size:10 };
      cell.border = { top:{style:'thin'}, left:{style:'thin'}, right:{style:'thin'}, bottom:{style:'thin'} };
      if (c === 1 || c === dateCol){
        cell.alignment = { horizontal:'center', vertical:'middle', wrapText:true };
      } else {
        cell.alignment = { horizontal:'left', vertical:'top', wrapText:true };
      }
      if (c === dateCol && cell.value instanceof Date){
        cell.numFmt = 'dd/mm/yyyy';
      }
    });

    rIdx++;
  }

  // ===== PRINT & FOOTER =====
  const lastRow = rIdx - 1;
  ws.autoFilter = { from:{row:headerRowIdx, column:1}, to:{row:headerRowIdx, column:lastCol} };
  ws.pageSetup.printTitlesRow = `${headerRowIdx}:${headerRowIdx}`;
  ws.pageSetup.printArea = `A1:${lastColLetter}${lastRow}`;
  ws.headerFooter = { oddFooter: `&L${SCHOOL_NAME_TOP2}&CHalaman &P dari &N&R&F` };

  // ===== SAVE =====
  const stamp = new Date().toISOString().slice(0,19).replace(/[:T]/g,'-');
  const fname = `surat-${isMasuk?'masuk':'keluar'}-terpilih-${stamp}.xlsx`;
  const blob  = await wb.xlsx.writeBuffer().then(ab => new Blob([ab], {type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'}));

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = fname;
  document.body.appendChild(a); a.click(); a.remove();
  URL.revokeObjectURL(url);

  (typeof toast==='function') && toast('Diexport (siap cetak) ✅');
}
