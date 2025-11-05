import { useState, useEffect, useContext } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { ThemeContext } from "../context/ThemeContext";
import BahiKhataLogo from "../assets/images/BahiKhata.png";

export default function MonthlyIncomeReport({ isOpen, onClose, income, user }) {
  const { theme } = useContext(ThemeContext);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [filteredIncome, setFilteredIncome] = useState([]);

  // ✅ Filter income by month
  useEffect(() => {
    const filtered = income
      .filter((inc) => inc.date.startsWith(selectedMonth))
      .map((inc) => ({
        ...inc,
        dateFormatted: new Date(inc.date).toLocaleDateString("en-GB", {
          day: "numeric",
          month: "short",
          year: "2-digit",
        }),
      }));
    setFilteredIncome(filtered);
  }, [income, selectedMonth]);

  const totalIncome = filteredIncome.reduce((a, b) => a + Number(b.amount || 0), 0);

  // ✅ Convert image to Base64 for logo in PDF
  const getBase64Image = (url) =>
    new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "Anonymous";
      img.src = url;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL("image/png"));
      };
      img.onerror = (err) => reject(err);
    });

  // ✅ Export as PDF
  const exportPDF = async () => {
    const doc = new jsPDF();
    try {
      const logoBase64 = await getBase64Image(BahiKhataLogo);
      doc.addImage(logoBase64, "PNG", 10, 5, 30, 20);
    } catch (err) {
      console.error("Failed to load logo for PDF", err);
    }

    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("BahiKhata Monthly Income Report", 50, 15);

    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(`User Name: ${user?.name}`, 50, 25);
    doc.text(
      `Month: ${new Date(selectedMonth + "-01").toLocaleString("en-GB", {
        month: "long",
        year: "numeric",
      })}`,
      50,
      32
    );
    doc.setFont("helvetica", "bold");
    doc.text(`Total Income: ₹ ${totalIncome}`, 50, 39);

    const headers = [["Date", "Source", "Note", "Amount"]];
    const rows = filteredIncome.map((inc) => [
      inc.dateFormatted,
      inc.source || "-",
      inc.note || "-",
      `₹ ${inc.amount}`,
    ]);

    autoTable(doc, {
      startY: 45,
      head: headers,
      body: rows,
      styles: { fontSize: 10, textColor: "#000" },
      headStyles: { fillColor: "#16a34a", textColor: "#fff", fontStyle: "bold" },
      alternateRowStyles: { fillColor: "#f2f2f2" },
      margin: { left: 10, right: 10 },
      tableLineColor: [211, 211, 211],
      tableLineWidth: 0.3,
    });

    doc.save(`monthly-income-report-${selectedMonth}.pdf`);
  };

  // ✅ Export as XLSX
  const exportXLSX = () => {
    const wsData = filteredIncome.map((inc) => ({
      Date: inc.dateFormatted,
      Source: inc.source,
      Note: inc.note,
      Amount: inc.amount,
    }));
    const ws = XLSX.utils.json_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Income");
    XLSX.writeFile(wb, `monthly-income-report-${selectedMonth}.xlsx`);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
      <div
        className={`relative w-full max-w-2xl max-h-[90vh] p-6 rounded-xl shadow-xl pointer-events-auto overflow-y-auto
          ${theme === "dark" ? "bg-gray-900 text-white" : "bg-white text-gray-900"}
        `}
        style={{
          top: "50%",
          transform: "translateY(-50%)",
          position: "fixed",
        }}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Monthly Income Report</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            Close
          </button>
        </div>

        {/* Month Selector */}
        <div className="flex items-center gap-4 mb-4">
          <label>Month:</label>
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className={`px-2 py-1 rounded border ${
              theme === "dark"
                ? "border-gray-600 bg-gray-800 text-white"
                : "border-gray-300 bg-white text-gray-900"
            }`}
          />
        </div>

        {/* Download Buttons */}
        <div className="flex gap-4 mb-4">
          <button
            onClick={exportPDF}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Download as PDF
          </button>
          <button
            onClick={exportXLSX}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Download as XLSX
          </button>
        </div>

        {/* Income Table */}
        <div className="overflow-y-auto max-h-[60vh]">
          <table className="w-full table-auto border border-gray-300 dark:border-gray-700">
            <thead>
              <tr className={theme === "dark" ? "bg-gray-700" : "bg-green-600"}>
                <th className="border px-2 py-1 text-white">Date</th>
                <th className="border px-2 py-1 text-white">Source</th>
                <th className="border px-2 py-1 text-white">Note</th>
                <th className="border px-2 py-1 text-white">Amount</th>
              </tr>
            </thead>
            <tbody>
              {filteredIncome.length === 0 ? (
                <tr>
                  <td
                    colSpan="4"
                    className="text-center py-4 text-gray-500 dark:text-gray-400"
                  >
                    No income added this month.
                  </td>
                </tr>
              ) : (
                filteredIncome.map((inc) => (
                  <tr key={inc.income_id}>
                    <td className="border px-2 py-1">{inc.dateFormatted}</td>
                    <td className="border px-2 py-1">{inc.source}</td>
                    <td className="border px-2 py-1">{inc.note}</td>
                    <td className="border px-2 py-1">₹ {inc.amount}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
