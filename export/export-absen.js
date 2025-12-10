// export-absen.js

// Catatan: Fungsi ini akan di-attach ke window, atau dijalankan langsung.

// =================================================================
// FUNGSI BANTUAN BUAT STYLE (HARUS DI EXPORT JIKA DI-MODULE-KAN)
// Tapi karena kita pakai script tag biasa, kita buat sebagai fungsi global dulu.
// =================================================================

// FUNGSI BANTUAN BUAT STYLE
// Style standar: Arial, Size 10, Border Thin
function setStyleStandar(cell, isHeaderTable = false, isMinggu = false) {
  cell.font = { name: 'Arial', size: 10 };
  cell.border = {
    top: { style: 'thin' },
    left: { style: 'thin' },
    bottom: { style: 'thin' },
    right: { style: 'thin' }
  };
   
  if (isHeaderTable) {
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFD3D3D3' } // Abu-abu
    };
    cell.font = { name: 'Arial', size: 10, bold: true };
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
  }

  if (isMinggu) {
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFFFC0CB' } // Merah Muda
    };
  }
}

// FUNGSI BUAT HEADER KOP SURAT
function buatHeaderKop(ws, mergeToColumn) {
  // Isi Konten Header
  ws.getCell('A1').value = "LEMBAGA PENDIDIKAN MA’ARIF NU SUKOHARJO";
  ws.getCell('A2').value = "MTs MA’ARIF DARUL HASAN POLOKARTO";
  ws.getCell('A3').value = "TERAKREDITASI “A”";
  ws.getCell('A4').value = "NSM: 121233110017      NPSN: 70008609";
  ws.getCell('A5').value = "Alamat: Dk. Jatisari, Mranggen, Polokarto, Sukoharjo";
  ws.getCell('A6').value = "Email: mtsmaarif.darulhasan@gmail.com      Website: www.maarifdh.sch.id";

  // Merge Cells
  ws.mergeCells('A1:' + mergeToColumn + '1');
  ws.mergeCells('A2:' + mergeToColumn + '2');
  ws.mergeCells('A3:' + mergeToColumn + '3');
  ws.mergeCells('A4:' + mergeToColumn + '4');
  ws.mergeCells('A5:' + mergeToColumn + '5');
  ws.mergeCells('A6:' + mergeToColumn + '6');

  // Styling Font Header
  const centerStyle = { horizontal: 'center', vertical: 'middle' };
   
  ws.getCell('A1').font = { name: 'Arial', size: 16, bold: true };
  ws.getCell('A1').alignment = centerStyle;

  ws.getCell('A2').font = { name: 'Arial', size: 16, bold: true };
  ws.getCell('A2').alignment = centerStyle;

  ws.getCell('A3').font = { name: 'Arial', size: 12, bold: true };
  ws.getCell('A3').alignment = centerStyle;

  ws.getCell('A4').font = { name: 'Arial', size: 11 };
  ws.getCell('A4').alignment = centerStyle;

  ws.getCell('A5').font = { name: 'Arial', size: 10 };
  ws.getCell('A5').alignment = centerStyle;

  ws.getCell('A6').font = { name: 'Arial', size: 10 };
  ws.getCell('A6').alignment = centerStyle;

  // Garis 2 Tebal di bawah baris 6
  const colCount = ws.getColumn(mergeToColumn).number;
  for(let c = 1; c <= colCount; c++) {
      ws.getRow(6).getCell(c).border = {
          bottom: { style: 'double', color: { argb: 'FF000000' } } // Garis Double Hitam
      };
  }
}


// =================================================================
// FUNGSI UTAMA EXPORT (Ini yang akan dipanggil di HTML admin.js)
// =================================================================
async function runExportBulanan() {
    // 1. Ambil data API
    const bulanDipilih = document.getElementById("selectBulan").value;
    const res = await fetch("/api/rekap-bulanan?bulan=" + bulanDipilih);
    const data = await res.json();
    if (!data.ok) return;

    // Pastikan ExcelJS sudah tersedia (dari tag <script>)
    if (typeof ExcelJS === 'undefined') {
        alert("Library ExcelJS belum dimuat! Cek tag <script> di HTML.");
        return;
    }

    const wb = new ExcelJS.Workbook();
    const bulanNama = [
      "Januari", "Februari", "Maret", "April", "Mei", "Juni",
      "Juli", "Agustus", "September", "Oktober", "November", "Desember"
    ];

    const bulan = bulanNama[data.meta.bulan - 1];
    const totalHari = data.meta.total_hari;

    // Logika Hitung Hari Efektif (Pindahkan juga)
    const hariEfektif = (() => {
      let h = 0;
      const y = data.meta.tahun;
      const m = data.meta.bulan - 1;
      for (let i = 1; i <= totalHari; i++) {
        const d = new Date(y, m, i);
        const day = d.getDay(); 
        if (day !== 0) h++;
      }
      return h;
    })();

    // ===============================
    // SHEET 1: REKAP SEMUA GURU
    // ===============================
    const wsRekap = wb.addWorksheet("Rekap", {
      pageSetup: { paperSize: 9, orientation: 'portrait' }
    });
    buatHeaderKop(wsRekap, "D");

    wsRekap.getCell("A8").value = "Rekap Kehadiran Guru";
    wsRekap.getCell("A8").font = { name: 'Arial', size: 10, bold: true };
    wsRekap.getCell("A9").value = "Bulan: " + bulan + " " + data.meta.tahun;
    wsRekap.getCell("A9").font = { name: 'Arial', size: 10 };

    const headerRowRekap = wsRekap.getRow(10);
    headerRowRekap.values = ["Nama Guru", "Total Hadir", "Hari Efektif", "Persentase"];
    headerRowRekap.eachCell((cell) => { setStyleStandar(cell, true); });

    // Logika Hitung Data
    const guruMap = {};
    data.data.forEach(r => {
      if (!guruMap[r.nama_guru]) { guruMap[r.nama_guru] = 0; }
      if (r.jam_masuk) { guruMap[r.nama_guru]++; }
    });

    Object.keys(guruMap).forEach(nama => {
      const hadir = guruMap[nama];
      const persen = Math.ceil((hadir / hariEfektif) * 100) + "%";
      const row = wsRekap.addRow([nama, hadir, hariEfektif, persen]);
      row.eachCell(cell => { setStyleStandar(cell, false); });
    });

    wsRekap.getColumn(1).width = 30;
    wsRekap.getColumn(2).width = 15;
    wsRekap.getColumn(3).width = 15;
    wsRekap.getColumn(4).width = 15;


    // ===============================
    // SHEET PER GURU (HORIZONTAL)
    // ===============================
    const absensi = {};
    data.data.forEach(r => {
      if (!absensi[r.nama_guru]) absensi[r.nama_guru] = {};
      if (!r.tanggal) return;
      const t = parseInt(r.tanggal.split("-")[2]);
      absensi[r.nama_guru][t] = {
        masuk: r.jam_masuk ? true : false,
        pulang: r.jam_pulang ? true : false
      };
    });

    const hariNamaPendek = ["Min","Sen","Sel","Rab","Kam","Jum","Sab"];
    const tahun = data.meta.tahun;
    const bulanIdx = data.meta.bulan - 1;

    Object.keys(absensi).forEach(namaGuru => {

      const ws = wb.addWorksheet(namaGuru.substring(0, 28), {
          pageSetup: { paperSize: 9, orientation: 'landscape' }
      });

      buatHeaderKop(ws, "AF");

      ws.getCell("A8").value = "Rekap Absensi Guru";
      ws.getCell("A8").font = { name: 'Arial', size: 10, bold: true };
      ws.getCell("A9").value = "Nama: " + namaGuru;
      ws.getCell("A9").font = { name: 'Arial', size: 10 };
      ws.getCell("A10").value = "Bulan: " + bulan + " " + tahun;
      ws.getCell("A10").font = { name: 'Arial', size: 10 };

      const rowTanggal = ws.getRow(12);
      const rowHari = ws.getRow(13);

      rowTanggal.getCell(1).value = "Keterangan";
      rowHari.getCell(1).value = "";

      for (let t = 1; t <= totalHari; t++) {
        const colIdx = t + 1;
        rowTanggal.getCell(colIdx).value = t;
        const d = new Date(tahun, bulanIdx, t);
        const hariIdx = d.getDay(); 
        rowHari.getCell(colIdx).value = hariNamaPendek[hariIdx];
      }

      rowTanggal.eachCell((cell, colNumber) => {
          let isSunday = false;
          if(colNumber > 1) {
             const t = colNumber - 1;
             const d = new Date(tahun, bulanIdx, t);
             if(d.getDay() === 0) isSunday = true;
          }
          setStyleStandar(cell, true, isSunday);
      });

      rowHari.eachCell((cell, colNumber) => {
          let isSunday = false;
          if(colNumber > 1) {
             const t = colNumber - 1;
             const d = new Date(tahun, bulanIdx, t);
             if(d.getDay() === 0) isSunday = true;
          }
          setStyleStandar(cell, true, isSunday);
      });

      const rowMasuk = ws.getRow(14);
      const rowPulang = ws.getRow(15);

      rowMasuk.getCell(1).value = "Absen Masuk";
      rowPulang.getCell(1).value = "Absen Pulang";

      let totalHadirGuru = 0;

      for (let t = 1; t <= totalHari; t++) {
        const colIdx = t + 1;
        const dataHari = absensi[namaGuru][t];
        
        const d = new Date(tahun, bulanIdx, t);
        const isSunday = (d.getDay() === 0);

        const cellMasuk = rowMasuk.getCell(colIdx);
        if (dataHari && dataHari.masuk) {
          cellMasuk.value = "✔";
          cellMasuk.alignment = { horizontal: 'center' };
          totalHadirGuru++;
        }
        setStyleStandar(cellMasuk, false, isSunday);

        const cellPulang = rowPulang.getCell(colIdx);
        if (dataHari && dataHari.pulang) {
          cellPulang.value = "✔";
          cellPulang.alignment = { horizontal: 'center' };
        }
        setStyleStandar(cellPulang, false, isSunday);
      }
      
      setStyleStandar(rowMasuk.getCell(1), false, false);
      setStyleStandar(rowPulang.getCell(1), false, false);

      const rTotal = ws.addRow(["Total Hadir", totalHadirGuru]);
      setStyleStandar(rTotal.getCell(1));
      setStyleStandar(rTotal.getCell(2));

      const rEfektif = ws.addRow(["Hari Efektif", hariEfektif]);
      setStyleStandar(rEfektif.getCell(1));
      setStyleStandar(rEfektif.getCell(2));

      const rPersen = ws.addRow(["Persentase", Math.ceil((totalHadirGuru / hariEfektif) * 100) + "%"]);
      setStyleStandar(rPersen.getCell(1));
      setStyleStandar(rPersen.getCell(2));

      ws.getColumn(1).width = 20;
      for(let c = 2; c <= 33; c++){
          ws.getColumn(c).width = 4;
      }
    });

    // ===============================
    // DOWNLOAD
    // ===============================
    const buf = await wb.xlsx.writeBuffer();

    const blob = new Blob([buf], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    });

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "rekap-absen-" + bulan + "-" + data.meta.tahun + ".xlsx";
    link.click();
}

// Pasang fungsi utama ke global scope agar bisa dipanggil di admin.js
window.runExportBulanan = runExportBulanan;
