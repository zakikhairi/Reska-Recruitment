import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

// Data types for reports
export interface ReportData {
  title: string;
  dateRange: string;
  stats: {
    totalApplicants: number;
    passingRate: number;
    avgScore: number;
    completionRate: number;
  };
  divisionStats: Array<{
    division: string;
    total: number;
    passed: number;
    rate: number;
  }>;
  testTypeStats: Array<{
    name: string;
    participants: number;
    avgScore: number;
  }>;
  monthlyData: Array<{
    month: string;
    applicants: number;
    passed: number;
    avgScore: number;
  }>;
}

// Custom Report Configuration
export interface ReportConfig {
  title: string;
  type: string;
  division: string;
  position: string;
  period: { month: string; year: string; quarter: string };
  dateRange: { start: string; end: string };
  includeCharts: boolean;
  includeStatistics: boolean;
  includeCandidateList: boolean;
  includeAnalysis: boolean;
}

// Format date for filename
const formatDate = () => {
  const now = new Date();
  return `${now.getDate()}-${now.getMonth() + 1}-${now.getFullYear()}`;
};

// Generate mock data based on report config
const generateMockData = (config: ReportConfig) => {
  const stats = {
    totalApplicants: Math.floor(Math.random() * 500) + 800,
    passingRate: Math.floor(Math.random() * 20) + 60,
    avgScore: Math.floor(Math.random() * 20) + 60,
    completionRate: Math.floor(Math.random() * 15) + 75,
  };

  const divisionStats = [
    { division: "On-Train Service", total: 412, passed: 298, rate: 72 },
    { division: "ResClean", total: 285, passed: 210, rate: 74 },
    { division: "IT Staff", total: 156, passed: 98, rate: 63 },
    { division: "Logistics", total: 198, passed: 145, rate: 73 },
    { division: "Admin", total: 196, passed: 141, rate: 72 },
  ];

  const testTypeStats = [
    { name: "AKHLAK", participants: 1247, avgScore: 72 },
    { name: "Hospitality", participants: 986, avgScore: 68 },
    { name: "Technical", participants: 654, avgScore: 62 },
    { name: "Aptitude", participants: 1102, avgScore: 70 },
  ];

  const monthlyData = [
    { month: "Jan", applicants: 120, passed: 85, avgScore: 65 },
    { month: "Feb", applicants: 145, passed: 102, avgScore: 68 },
    { month: "Mar", applicants: 168, passed: 120, avgScore: 70 },
    { month: "Apr", applicants: 195, passed: 142, avgScore: 72 },
    { month: "Mei", applicants: 210, passed: 155, avgScore: 71 },
    { month: "Jun", applicants: 225, passed: 168, avgScore: 74 },
    { month: "Jul", applicants: 184, passed: 120, avgScore: 68 },
  ];

  const periodLabel = config.period.month
    ? `${config.period.month.charAt(0).toUpperCase() + config.period.month.slice(1)} ${config.period.year}`
    : config.period.year;

  return {
    title: config.title || "Laporan Rekrutmen KAI Services",
    dateRange: periodLabel,
    stats,
    divisionStats: config.division && config.division !== "Semua Divisi"
      ? divisionStats.filter(d => d.division === config.division)
      : divisionStats,
    testTypeStats,
    monthlyData,
  };
};

// Export to PDF
export const exportToPDF = (config: ReportConfig) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const data = generateMockData(config);

  // Header
  doc.setFillColor(0, 32, 91);
  doc.rect(0, 0, pageWidth, 35, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("KAI Services", 14, 15);

  doc.setFontSize(14);
  doc.setFont("helvetica", "normal");
  doc.text("Laporan Rekrutmen", 14, 25);

  doc.setTextColor(0, 0, 0);

  // Title
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text(data.title, 14, 50);

  // Report Info
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 100, 100);
  doc.text(`Jenis: ${config.type} | Divisi: ${config.division} | Periode: ${data.dateRange}`, 14, 58);
  doc.text(`Generated: ${new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}`, 14, 64);

  let currentY = 75;

  // Statistics Section
  if (config.includeStatistics) {
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Ringkasan Statistik", 14, currentY);
    currentY += 5;

    const summaryData = [
      ["Total Pelamar", data.stats.totalApplicants.toLocaleString("id-ID")],
      ["Passing Rate", `${data.stats.passingRate}%`],
      ["Rata-rata Skor", data.stats.avgScore.toString()],
      ["Completion Rate", `${data.stats.completionRate}%`],
    ];

    autoTable(doc, {
      startY: currentY,
      head: [["Metrik", "Nilai"]],
      body: summaryData,
      theme: "grid",
      headStyles: { fillColor: [0, 32, 91] },
      margin: { left: 14, right: 14 },
    });
    currentY = (doc as any).lastAutoTable.finalY + 15;
  }

  // Division Stats
  if (config.includeAnalysis) {
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Statistik per Divisi", 14, currentY);
    currentY += 5;

    const divisionTableData = data.divisionStats.map((div) => [
      div.division,
      div.total.toString(),
      div.passed.toString(),
      `${div.rate}%`,
    ]);

    autoTable(doc, {
      startY: currentY,
      head: [["Divisi", "Total Pelamar", "Lulus", "Passing Rate"]],
      body: divisionTableData,
      theme: "striped",
      headStyles: { fillColor: [0, 32, 91] },
      margin: { left: 14, right: 14 },
    });
    currentY = (doc as any).lastAutoTable.finalY + 15;
  }

  // Test Type Stats
  if (config.includeCharts) {
    if (currentY > 200) {
      doc.addPage();
      currentY = 20;
    }
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Distribusi Jenis Tes", 14, currentY);
    currentY += 5;

    const testTypeData = data.testTypeStats.map((test) => [
      test.name,
      test.participants.toLocaleString("id-ID"),
      `${test.avgScore}%`,
    ]);

    autoTable(doc, {
      startY: currentY,
      head: [["Jenis Tes", "Peserta", "Rata-rata Skor"]],
      body: testTypeData,
      theme: "striped",
      headStyles: { fillColor: [0, 32, 91] },
      margin: { left: 14, right: 14 },
    });
    currentY = (doc as any).lastAutoTable.finalY + 15;
  }

  // Candidate List
  if (config.includeCandidateList) {
    if (currentY > 180) {
      doc.addPage();
      currentY = 20;
    }
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Daftar Kandidat", 14, currentY);
    currentY += 5;

    const candidateData = [
      ["1", "Ahmad Rizki Pratama", "Pramugara", "94", "Lulus"],
      ["2", "Siti Nurhaliza", "Steward", "92", "Lulus"],
      ["3", "Budi Santoso", "IT Support", "89", "Interview"],
      ["4", "Dewi Lestari", "Admin", "88", "Interview"],
      ["5", "Rizky Ramadhan", "Teknisi", "87", "Medical"],
    ];

    autoTable(doc, {
      startY: currentY,
      head: [["#", "Nama", "Posisi", "Skor", "Status"]],
      body: candidateData,
      theme: "striped",
      headStyles: { fillColor: [0, 32, 91] },
      margin: { left: 14, right: 14 },
    });
  }

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `Halaman ${i} dari ${pageCount} | KAI Services - ${data.title} | ${formatDate()}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: "center" }
    );
  }

  const filename = `${data.title.replace(/\s+/g, "_")}_${formatDate()}.pdf`;
  doc.save(filename);
};

// Export to Excel
export const exportToExcel = (config: ReportConfig) => {
  const data = generateMockData(config);
  const wb = XLSX.utils.book_new();

  // Summary Sheet
  if (config.includeStatistics) {
    const summaryData = [
      [data.title.toUpperCase()],
      [""],
      ["Informasi Laporan"],
      ["Jenis", config.type],
      ["Divisi", config.division],
      ["Posisi", config.position],
      ["Periode", data.dateRange],
      ["Tanggal Generate", new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })],
      [""],
      ["RINGKASAN STATISTIK"],
      ["Metrik", "Nilai"],
      ["Total Pelamar", data.stats.totalApplicants],
      ["Passing Rate (%)", data.stats.passingRate],
      ["Rata-rata Skor", data.stats.avgScore],
      ["Completion Rate (%)", data.stats.completionRate],
    ];
    const summaryWS = XLSX.utils.aoa_to_sheet(summaryData);
    summaryWS["!cols"] = [{ wch: 30 }, { wch: 25 }];
    XLSX.utils.book_append_sheet(wb, summaryWS, "Ringkasan");
  }

  // Division Stats Sheet
  if (config.includeAnalysis) {
    const divisionHeader = [["Divisi", "Total Pelamar", "Lulus", "Passing Rate (%)"]];
    const divisionBody = data.divisionStats.map((div) => [
      div.division,
      div.total,
      div.passed,
      div.rate,
    ]);
    const divisionWS = XLSX.utils.aoa_to_sheet([...divisionHeader, ...divisionBody]);
    divisionWS["!cols"] = [{ wch: 20 }, { wch: 15 }, { wch: 15 }, { wch: 15 }];
    XLSX.utils.book_append_sheet(wb, divisionWS, "Statistik Divisi");
  }

  // Test Type Stats Sheet
  if (config.includeCharts) {
    const testHeader = [["Jenis Tes", "Jumlah Peserta", "Rata-rata Skor (%)"]];
    const testBody = data.testTypeStats.map((test) => [
      test.name,
      test.participants,
      test.avgScore,
    ]);
    const testWS = XLSX.utils.aoa_to_sheet([...testHeader, ...testBody]);
    testWS["!cols"] = [{ wch: 15 }, { wch: 18 }, { wch: 18 }];
    XLSX.utils.book_append_sheet(wb, testWS, "Jenis Tes");
  }

  // Monthly Trend Sheet
  if (config.includeCharts) {
    const monthlyHeader = [["Bulan", "Total Pelamar", "Lulus", "Rata-rata Skor (%)"]];
    const monthlyBody = data.monthlyData.map((m) => [
      m.month,
      m.applicants,
      m.passed,
      m.avgScore,
    ]);
    const monthlyWS = XLSX.utils.aoa_to_sheet([...monthlyHeader, ...monthlyBody]);
    monthlyWS["!cols"] = [{ wch: 10 }, { wch: 15 }, { wch: 10 }, { wch: 18 }];
    XLSX.utils.book_append_sheet(wb, monthlyWS, "Tren Bulanan");
  }

  // Candidate List Sheet
  if (config.includeCandidateList) {
    const candidateHeader = [["#", "Nama", "Posisi", "Skor", "Status"]];
    const candidateBody = [
      ["1", "Ahmad Rizki Pratama", "Pramugara", "94", "Lulus"],
      ["2", "Siti Nurhaliza", "Steward", "92", "Lulus"],
      ["3", "Budi Santoso", "IT Support", "89", "Interview"],
      ["4", "Dewi Lestari", "Admin", "88", "Interview"],
      ["5", "Rizky Ramadhan", "Teknisi", "87", "Medical"],
    ];
    const candidateWS = XLSX.utils.aoa_to_sheet([...candidateHeader, ...candidateBody]);
    candidateWS["!cols"] = [{ wch: 5 }, { wch: 25 }, { wch: 15 }, { wch: 10 }, { wch: 12 }];
    XLSX.utils.book_append_sheet(wb, candidateWS, "Daftar Kandidat");
  }

  const filename = `${data.title.replace(/\s+/g, "_")}_${formatDate()}.xlsx`;
  XLSX.writeFile(wb, filename);
};

// Export to CSV
export const exportToCSV = (config: ReportConfig) => {
  const data = generateMockData(config);
  let csvContent = "﻿"; // BOM for UTF-8

  // Header
  csvContent += `${data.title.toUpperCase()}\n`;
  csvContent += `Jenis: ${config.type}\n`;
  csvContent += `Divisi: ${config.division}\n`;
  csvContent += `Posisi: ${config.position}\n`;
  csvContent += `Periode: ${data.dateRange}\n`;
  csvContent += `Tanggal Generate: ${new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}\n\n`;

  // Statistics
  if (config.includeStatistics) {
    csvContent += "RINGKASAN STATISTIK\n";
    csvContent += "Metrik;Nilai\n";
    csvContent += `Total Pelamar;${data.stats.totalApplicants}\n`;
    csvContent += `Passing Rate;${data.stats.passingRate}%\n`;
    csvContent += `Rata-rata Skor;${data.stats.avgScore}\n`;
    csvContent += `Completion Rate;${data.stats.completionRate}%\n\n`;
  }

  // Division Stats
  if (config.includeAnalysis) {
    csvContent += "STATISTIK PER DIVISI\n";
    csvContent += "Divisi;Total Pelamar;Lulus;Passing Rate\n";
    data.divisionStats.forEach((div) => {
      csvContent += `${div.division};${div.total};${div.passed};${div.rate}%\n`;
    });
    csvContent += "\n";
  }

  // Test Type Stats
  if (config.includeCharts) {
    csvContent += "DISTRIBUSI JENIS TES\n";
    csvContent += "Jenis Tes;Jumlah Peserta;Rata-rata Skor\n";
    data.testTypeStats.forEach((test) => {
      csvContent += `${test.name};${test.participants};${test.avgScore}%\n`;
    });
    csvContent += "\n";

    // Monthly Trend
    csvContent += "TREN BULANAN\n";
    csvContent += "Bulan;Total Pelamar;Lulus;Rata-rata Skor\n";
    data.monthlyData.forEach((m) => {
      csvContent += `${m.month};${m.applicants};${m.passed};${m.avgScore}%\n`;
    });
    csvContent += "\n";
  }

  // Candidate List
  if (config.includeCandidateList) {
    csvContent += "DAFTAR KANDIDAT\n";
    csvContent += "#;Nama;Posisi;Skor;Status\n";
    const candidates = [
      ["1", "Ahmad Rizki Pratama", "Pramugara", "94", "Lulus"],
      ["2", "Siti Nurhaliza", "Steward", "92", "Lulus"],
      ["3", "Budi Santoso", "IT Support", "89", "Interview"],
      ["4", "Dewi Lestari", "Admin", "88", "Interview"],
      ["5", "Rizky Ramadhan", "Teknisi", "87", "Medical"],
    ];
    candidates.forEach((c) => {
      csvContent += `${c.join(";")}\n`;
    });
  }

  // Download
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const filename = `${data.title.replace(/\s+/g, "_")}_${formatDate()}.csv`;
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
