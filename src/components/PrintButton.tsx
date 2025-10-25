"use client";

export default function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="bg-green-700 text-white px-4 py-2 rounded hover:bg-green-800"
    >
      🖨️ Print / Save as PDF
    </button>
  );
}
