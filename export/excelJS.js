//export via exceljs
async function exportSelectedToXLSX_Styled(){
  const rows = getSelectedRows();
  if (!rows.length){ toast('Belum ada yang dipilih'); return; }
  if (!window.ExcelJS){ toast('ExcelJS belum dimuat'); return; }

  // ====== KONFIG KAMU ======
  const SCHOOL_NAME = "MTs Ma'arif Darul Hasan Polokarto";
  const SCHOOL_ADDR = "Jl. Contoh No. 123, Kota — Telp. 0812-xxx-xxx";
  const LOGO_URL    = "https://ik.imagekit.io/maarifdh/aset-gambar/logo-mts.png"; // JPG/PNG oke

  // Header & keys sesuai tab
  const isMasuk = (currentType === 'masuk');
  const headers = isMasuk
    ? ['Agenda','Nomor Surat','Tanggal','Asal','Perihal','Penerima','Catatan']
    : ['Agenda','Nomor Surat','Tanggal','Tujuan','Perihal','Penandatangan','Catatan'];

  const keys = isMasuk
    ? ['nomor_agenda','nomor_surat','tanggal','asal','perihal','penerima','catatan']
    : ['nomor_agenda','nomor_surat','tanggal','tujuan','perihal','penandatangan','catatan'];

  // Lebar kolom (satuan karakter, kira-kira)
  const COLS = isMasuk
    ? [8, 24, 12, 22, 40, 20, 30]
    : [8, 24, 12, 24, 40, 20, 30];

  // ====== MULAI BIKIN FILE ======
  const wb = new ExcelJS.Workbook();
  wb.creator = 'Buku Surat';
  wb.created = new Date();

  const ws = wb.addWorksheet(isMasuk ? 'Masuk' : 'Keluar', {
    views: [{ state:'frozen', ySplit:5 }], // freeze sampai baris 5 (judul+kop)
    pageSetup: {
      orientation: 'landscape',
      fitToPage: true, fitToWidth: 1, fitToHeight: 0,
      margins: { left:0.5, right:0.5, top:0.6, bottom:0.6, header:0.3, footer:0.3 }
    },
    properties: { defaultRowHeight: 18 }
  });

  // ====== KOP / HEADER CETAK ======
  // Sisakan 4 baris untuk logo + nama madrasah
  ws.mergeCells('A1:G1');
  ws.mergeCells('A2:G2');
  ws.mergeCells('A3:G3');
  ws.getCell('A1').value = SCHOOL_NAME;
  ws.getCell('A2').value = "Rekap " + (isMasuk ? "Surat Masuk" : "Surat Keluar");
  ws.getCell('A3').value = SCHOOL_ADDR;

  ws.getCell('A1').font = { bold:true, size:16 };
  ws.getCell('A2').font = { bold:true, size:12 };
  ws.getCell('A3').font = { size:10, color:{argb:'FF555555'} };
  ws.getCell('A1').alignment = { horizontal:'center' };
  ws.getCell('A2').alignment = { horizontal:'center' };
  ws.getCell('A3').alignment = { horizontal:'center' };

  // LOGO (opsional). Ambil gambar dari URL → ArrayBuffer
  try{
    const resp = await fetch(LOGO_URL);
    const buf  = await resp.arrayBuffer();
    const ext  = LOGO_URL.toLowerCase().endsWith('.png') ? 'png' : 'jpeg';
    const imgId = wb.addImage({
      buffer: buf,
      extension: ext // 'png' atau 'jpeg'
    });
    // Tempatkan logo di kiri-atas (sekitar A1), ukuran piksel (sesuaikan)
    ws.addImage(imgId, {
      tl: { col: 0, row: 0 }, // pojok kiri atas (kolom/baris 0-based)
      ext:{ width: 90, height: 90 }
    });
  }catch(e){
    // kalau gagal ambil logo, lanjut saja
  }

  // ====== TABEL: mulai di baris 5 untuk header kolom ======
  const headerRowIdx = 5;
  ws.getRow(headerRowIdx).values = headers;

  // Styling header tabel
  ws.getRow(headerRowIdx).eachCell(cell=>{
    cell.font = { bold:true };
    cell.alignment = { vertical:'middle', horizontal:'center', wrapText:true };
    cell.fill = { type:'pattern', pattern:'solid', fgColor:{argb:'FFEFEFEF'} };
    cell.border = {
      top:{style:'thin'}, left:{style:'thin'}, right:{style:'thin'}, bottom:{style:'thin'}
    };
  });
  ws.getRow(headerRowIdx).height = 22;

  // Lebar kolom
  ws.columns = COLS.map(w => ({ width:w }));

  // Data mulai baris 6
  let rIdx = headerRowIdx + 1;
  const dateCol = headers.findIndex(h => h.toLowerCase().includes('tanggal')) + 1; // 1-based

  for (const r of rows){
    const rowVals = keys.map(k => r[k] ?? '');
    // konversi tanggal "YYYY-MM-DD" jadi Date
    if (dateCol > 0){
      const iso = r[keys[dateCol-1]];
      if (typeof iso === 'string' && /^\d{4}-\d{2}-\d{2}/.test(iso)){
        rowVals[dateCol-1] = new Date(iso.slice(0,10)+'T00:00:00');
      }
    }
    ws.getRow(rIdx).values = rowVals;

    // border tiap sel + alignment dasar
    ws.getRow(rIdx).eachCell((cell, c)=>{
      cell.border = {
        top:{style:'thin'}, left:{style:'thin'},
        right:{style:'thin'}, bottom:{style:'thin'}
      };
      // rata kiri default, kecuali tanggal & agenda center
      if (c === 1 || c === dateCol){
        cell.alignment = { horizontal:'center', vertical:'middle', wrapText:true };
      }else{
        cell.alignment = { horizontal:'left', vertical:'top', wrapText:true };
      }
      if (c === dateCol && cell.value instanceof Date){
        cell.numFmt = 'dd/mm/yyyy';
      }
    });
    rIdx++;
  }

  // Autofilter (headerRowIdx sampai kolom terakhir & baris terakhir)
  const lastCol = headers.length;
  const lastRow = rIdx - 1;
  ws.autoFilter = {
    from: { row: headerRowIdx, column: 1 },
    to:   { row: headerRowIdx, column: lastCol }
  };

  // Print settings: ulangi header baris 5 di setiap halaman
  ws.pageSetup.printTitlesRow = `${headerRowIdx}:${headerRowIdx}`;
  // Print area seluruh tabel + kop
  ws.pageSetup.printArea = `A1:${String.fromCharCode(64+lastCol)}${lastRow}`;

  // Footer teks (nomor halaman)
  ws.headerFooter = {
    oddFooter: "&L" + SCHOOL_NAME + "&CHalaman &P dari &N&R&F"
  };

  // ====== SIMPAN FILE ======
  const stamp = new Date().toISOString().slice(0,19).replace(/[:T]/g,'-');
  const fname = `surat-${currentType}-terpilih-${stamp}.xlsx`;
  const blob  = await wb.xlsx.writeBuffer().then(ab => new Blob([ab], {type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'}));

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = fname;
  document.body.appendChild(a); a.click(); a.remove();
  URL.revokeObjectURL(url);

  toast('Diexport (siap cetak) ✅');
}
