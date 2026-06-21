import React, { useState, useRef, useEffect } from "react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { ChevronDown, Download, FileText, FileSpreadsheet, FileJson } from "lucide-react";

interface AdvancedExportButtonProps {
  /** The raw data array */
  data: any[];
  /** Title for the exported files */
  filename: string;
  /** Title drawn on the PDF document */
  pdfTitle?: string;
  /** Metadata text drawn on the PDF document */
  pdfMetadata?: string;
  /** Array of column headers */
  headers: string[];
  /** Function to map a single raw data row into an array of values matching the headers */
  dataMapper: (row: any) => any[];
}

export default function AdvancedExportButton({
  data,
  filename,
  pdfTitle = "Exported Report",
  pdfMetadata = "",
  headers,
  dataMapper
}: AdvancedExportButtonProps) {
  const [exportOpen, setExportOpen] = useState(false);
  const exportRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (exportRef.current && !exportRef.current.contains(event.target as Node)) {
        setExportOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const exportToPDF = () => {
    if (!data || data.length === 0) {
      alert("No data available to export.");
      return;
    }

    const pdf = new jsPDF("l", "mm", "a4");
    
    // Add Header
    pdf.setFontSize(18);
    pdf.setTextColor(40, 40, 40);
    pdf.text(pdfTitle, 14, 22);
    
    // Add Metadata
    if (pdfMetadata) {
      pdf.setFontSize(10);
      pdf.setTextColor(100);
      pdf.text(pdfMetadata, 14, 30);
    }
    pdf.setFontSize(10);
    pdf.setTextColor(100);
    pdf.text(`Generated on: ${new Date().toLocaleString()}`, 14, pdfMetadata ? 36 : 30);

    const bodyData = data.map(dataMapper);

    autoTable(pdf, {
      startY: pdfMetadata ? 45 : 39,
      head: [headers],
      body: bodyData,
      theme: "striped",
      headStyles: { fillColor: [41, 128, 185] },
      styles: { fontSize: 9, cellPadding: 3 }
    });

    pdf.save(`${filename}.pdf`);
    setExportOpen(false);
  };

  const exportToExcel = () => {
    if (!data || data.length === 0) {
      alert("No data available to export.");
      return;
    }

    const formattedData = data.map(row => {
      const rowData = dataMapper(row);
      const obj: any = {};
      headers.forEach((header, index) => {
        obj[header] = rowData[index];
      });
      return obj;
    });

    const worksheet = XLSX.utils.json_to_sheet(formattedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data");

    XLSX.writeFile(workbook, `${filename}.xlsx`);
    setExportOpen(false);
  };

  const exportToCSV = () => {
    if (!data || data.length === 0) {
      alert("No data available to export.");
      return;
    }

    const csvRows = [];
    csvRows.push(headers.join(","));

    data.forEach(row => {
      const rowData = dataMapper(row);
      const csvRow = rowData.map(value => {
        const strVal = String(value || "");
        // Escape quotes and wrap in quotes if contains comma
        const escaped = strVal.replace(/"/g, '""');
        return `"${escaped}"`;
      });
      csvRows.push(csvRow.join(","));
    });

    const csvString = csvRows.join("\n");
    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${filename}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    setExportOpen(false);
  };

  return (
    <div className="relative" ref={exportRef}>
      <button
        onClick={() => setExportOpen(!exportOpen)}
        className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded shadow hover:bg-emerald-700 transition"
      >
        <Download className="w-4 h-4" />
        Advanced Export
        <ChevronDown className="w-4 h-4" />
      </button>
      
      {exportOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-50 overflow-hidden">
          <button
            onClick={exportToExcel}
            className="w-full flex items-center gap-2 px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 transition"
          >
            <FileSpreadsheet className="w-4 h-4 text-green-600" />
            Export to Excel (.xlsx)
          </button>
          <button
            onClick={exportToPDF}
            className="w-full flex items-center gap-2 px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 transition border-t border-gray-100"
          >
            <FileText className="w-4 h-4 text-red-600" />
            Export to PDF (.pdf)
          </button>
          <button
            onClick={exportToCSV}
            className="w-full flex items-center gap-2 px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 transition border-t border-gray-100"
          >
            <FileJson className="w-4 h-4 text-blue-600" />
            Export to CSV (.csv)
          </button>
        </div>
      )}
    </div>
  );
}
