async function exportSelectedToXLSX_Styled(){
  const rows = (typeof getSelectedRows === 'function') ? getSelectedRows() : [];
  if (!rows.length){ (typeof toast==='function') && toast('Belum ada yang dipilih'); return; }
  if (!window.ExcelJS){ (typeof toast==='function') && toast('ExcelJS belum dimuat'); return; }

  // ====== KONFIG SEKOLAH ======
  const SCHOOL_NAME_TOP1 = "LEMBAGA PENDIDIKAN MA’ARIF NU SUKOHARJO";
  const SCHOOL_NAME_TOP2 = "MTs MA’ARIF DARUL HASAN POLOKARTO";
  const SCHOOL_ACC       = "TERAKREDITASI “A”";
  const SCHOOL_IDS       = "NSM: 121233110017     NPSN: 70008609";
  const SCHOOL_ADDR      = "Alamat: Dk. Jatisari, Mranggen, Polokarto, Sukoharjo";
  const SCHOOL_CONTACT   = "Email: mtsmaarif.darulhasan@gmail.com     Website: www.maarifdh.sch.id";
  const LOGO_URL         = "https://ik.imagekit.io/maarifdh/aset-gambar/logo-mts.png";

  const isMasuk = (typeof currentType !== 'undefined') ? (currentType === 'masuk') : true;

  // Header & keys sesuai tab
  const headers = isMasuk
    ? ['Agenda','Nomor Surat','Tanggal','Asal','Perihal','Penerima','Catatan']
    : ['Agenda','Nomor Surat','Tanggal','Tujuan','Perihal','Penandatangan','Catatan'];

  const keys = isMasuk
    ? ['nomor_agenda','nomor_surat','tanggal','asal','perihal','penerima','catatan']
    : ['nomor_agenda','nomor_surat','tanggal','tujuan','perihal','penandatangan','catatan'];

  // Lebar kolom (boleh disesuaikan nanti)
  const COLS = isMasuk
    ? [10, 28, 14, 26, 44, 22, 32]
    : [10, 28, 14, 26, 44, 22, 32];

  // ====== WORKBOOK & SHEET ======
  const wb = new ExcelJS.Workbook();
  wb.creator = 'Buku Surat';
  wb.created = new Date();

  const ws = wb.addWorksheet(isMasuk ? 'Masuk' : 'Keluar', {
    views: [{ state:'frozen', ySplit:8 }], // freeze sampai baris 8 (di atas header tabel)
    pageSetup: {
      paperSize: 9, // A4
      orientation: 'landscape',
      fitToPage: true, fitToWidth: 1, fitToHeight: 0,
      margins: { left:0.5, right:0.5, top:0.6, bottom:0.6, header:0.3, footer:0.3 }
    },
    properties: { defaultRowHeight: 18 }
  });

  // ====== KOP / HEADER LEBAR ======
  const lastCol = headers.length;                       // 7
  const lastColLetter = String.fromCharCode(64+lastCol);// 'G'

  // merge baris 1..6 ke seluruh kolom (A..G)
  for (let r = 1; r <= 6; r++) ws.mergeCells(`A${r}:${lastColLetter}${r}`);

  ws.getCell('A1').value = SCHOOL_NAME_TOP1;
  ws.getCell('A2').value = SCHOOL_NAME_TOP2;
  ws.getCell('A3').value = SCHOOL_ACC;
  ws.getCell('A4').value = SCHOOL_IDS;
  ws.getCell('A5').value = SCHOOL_ADDR;
  ws.getCell('A6').value = SCHOOL_CONTACT;

  ws.getCell('A1').font = { bold:true, size:16 };
  ws.getCell('A2').font = { bold:true, size:16 };
  ws.getCell('A3').font = { bold:true, size:13 };
  ws.getCell('A4').font = { size:12 };
  ws.getCell('A5').font = { size:11 };
  ws.getCell('A6').font = { size:11 };

  for (let r = 1; r <= 6; r++){
    ws.getCell(`A${r}`).alignment = { horizontal:'center', vertical:'middle', wrapText:true };
  }

  // Logo kiri besar (A1:B6)
  try{
    const resp = await fetch(LOGO_URL);
    const buf  = await resp.arrayBuffer();
    const ext  = LOGO_URL.toLowerCase().endsWith('.png') ? 'png' : 'jpeg';
    const imgId = wb.addImage({ buffer: buf, extension: ext });
    ws.addImage(imgId, 'A1:B6');
  }catch(_){ /* skip kalau gagal ambil logo */ }

  // Garis tebal 1 di bawah header → pakai border thick di baris 7 (A7..G7)
  const borderRow = 7;
  for (let c = 1; c <= lastCol; c++){
    const cell = ws.getCell(borderRow, c);
    cell.border = { bottom: { style:'thick', color:{ argb:'FF000000' } } };
  }

  // Baris 8 kosong sebagai spacer, TABEL mulai baris 9
  const headerRowIdx = 9;

  // ====== HEADER TABEL ======
  ws.getRow(headerRowIdx).values = headers;
  ws.getRow(headerRowIdx).eachCell(cell=>{
    cell.font = { bold:true };
    cell.alignment = { vertical:'middle', horizontal:'center', wrapText:true };
    cell.fill = { type:'pattern', pattern:'solid', fgColor:{argb:'FFEFEFEF'} };
    cell.border = { top:{style:'thin'}, left:{style:'thin'}, right:{style:'thin'}, bottom:{style:'thin'} };
  });
  ws.getRow(headerRowIdx).height = 22;

  // Set lebar kolom
  ws.columns = COLS.map(w => ({ width:w }));

  // ====== ISI DATA ======
  let rIdx = headerRowIdx + 1;
  const dateCol = headers.findIndex(h => h.toLowerCase().includes('tanggal')) + 1; // 1-based

  for (const r of rows){
    const rowVals = keys.map(k => r[k] ?? '');

    // konversi tanggal "YYYY-MM-DD" → Date
    if (dateCol > 0){
      const iso = r[keys[dateCol-1]];
      if (typeof iso === 'string' && /^\d{4}-\d{2}-\d{2}/.test(iso)){
        rowVals[dateCol-1] = new Date(iso.slice(0,10)+'T00:00:00');
      }
    }

    ws.getRow(rIdx).values = rowVals;

    // border + alignment
    ws.getRow(rIdx).eachCell((cell, c)=>{
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

  // ====== AUTOFILTER & PRINT ======
  const lastRow = rIdx - 1;
  ws.autoFilter = {
    from: { row: headerRowIdx, column: 1 },
    to:   { row: headerRowIdx, column: lastCol }
  };

  ws.pageSetup.printTitlesRow = `${headerRowIdx}:${headerRowIdx}`; // ulangi header tabel di tiap halaman
  ws.pageSetup.printArea = `A1:${lastColLetter}${lastRow}`;

  // Footer: nama sekolah & nomor halaman
  ws.headerFooter = {
    oddFooter: `&L${SCHOOL_NAME_TOP2}&CHalaman &P dari &N&R&F`
  };

  // ====== SIMPAN FILE ======
  const stamp = new Date().toISOString().slice(0,19).replace(/[:T]/g,'-');
  const fname = `surat-${isMasuk?'masuk':'keluar'}-terpilih-${stamp}.xlsx`;
  const blob  = await wb.xlsx.writeBuffer().then(ab => new Blob([ab], {type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'}));

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = fname;
  document.body.appendChild(a); a.click(); a.remove();
  URL.revokeObjectURL(url);

  (typeof toast==='function') && toast('Diexport (siap cetak) ✅');
}
