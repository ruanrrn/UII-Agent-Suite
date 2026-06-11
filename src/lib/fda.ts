// src/lib/fda.ts —— K 号 → FDA 官方 510(k) summary PDF（accessdata 规范 URL，无冗余存储）
export function fdaPdfUrl(kNumber: string): string {
  return `https://www.accessdata.fda.gov/cdrh_docs/pdf${kNumber.slice(1, 3)}/${kNumber}.pdf`;
}
