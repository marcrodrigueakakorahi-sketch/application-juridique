"use client";
// Génération des fichiers PDF et Word côté navigateur.

import type { ActDefinition } from "./types";
import { plainText, type RenderedBlock } from "./moteur";

const DISCLAIMER =
  "Document généré à partir d'un modèle et de vos réponses. Il ne remplace pas le conseil personnalisé d'un professionnel du droit.";

// Les polices standard du PDF ne savent pas afficher les espaces fines insécables.
const clean = (s: string) => s.replace(/[  ]/g, " ").replace(/[’]/g, "'");

function fileName(act: ActDefinition, ext: string) {
  const date = new Date().toISOString().slice(0, 10);
  return `${act.id}-${date}.${ext}`;
}

function saveBlob(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export async function exportPDF(act: ActDefinition, blocks: RenderedBlock[]) {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const M = 20;
  const W = 210 - 2 * M;
  const BOTTOM = 297 - 22;
  let y = M;

  const ensure = (h: number) => {
    if (y + h > BOTTOM) {
      doc.addPage();
      y = M;
    }
  };

  const write = (text: string, size: number, style: "normal" | "bold" | "italic", align: "left" | "center" | "justify" = "left", gapAfter = 3) => {
    doc.setFont("times", style);
    doc.setFontSize(size);
    const lh = size * 0.45;
    for (const para of clean(text).split("\n")) {
      const lines: string[] = doc.splitTextToSize(para, W);
      lines.forEach((line, i) => {
        ensure(lh);
        const last = i === lines.length - 1;
        if (align === "center") doc.text(line, 105, y, { align: "center" });
        else if (align === "justify" && !last) doc.text(line, M, y, { align: "justify", maxWidth: W });
        else doc.text(line, M, y);
        y += lh;
      });
    }
    y += gapAfter;
  };

  for (const b of blocks) {
    const text = plainText(b);
    switch (b.type) {
      case "title":
        write(text, 16, "bold", "center", 4);
        break;
      case "subtitle":
        write(text, 10, "italic", "center", 6);
        break;
      case "heading":
        y += 2;
        write(text, 12, "bold", "left", 2);
        break;
      case "note":
        write(text, 10, "italic", "left", 4);
        break;
      case "signature": {
        const cols = text.split("|");
        ensure(35);
        y += 6;
        doc.setFont("times", "normal");
        doc.setFontSize(11);
        const colW = W / cols.length;
        cols.forEach((c, i) => {
          const lines: string[] = doc.splitTextToSize(clean(c), colW - 6);
          doc.text(lines, M + i * colW, y);
        });
        y += 30;
        break;
      }
      default:
        write(text, 11, "normal", "justify");
    }
  }

  const pages = doc.getNumberOfPages();
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(120);
    doc.text(doc.splitTextToSize(clean(DISCLAIMER), W - 25), M, 297 - 12);
    doc.text(`Page ${i} / ${pages}`, 210 - M, 297 - 12, { align: "right" });
    doc.setTextColor(0);
  }

  doc.save(fileName(act, "pdf"));
}

export async function exportDOCX(act: ActDefinition, blocks: RenderedBlock[]) {
  const docx = await import("docx");
  const { Document, Packer, Paragraph, TextRun, AlignmentType, HeadingLevel, Footer, Table, TableRow, TableCell, WidthType, BorderStyle } = docx;

  const runs = (text: string, opts: { bold?: boolean; italics?: boolean; size?: number } = {}) =>
    text.split("\n").map((line, i) => new TextRun({ text: line, break: i > 0 ? 1 : undefined, font: "Times New Roman", size: opts.size ?? 22, bold: opts.bold, italics: opts.italics }));

  const noBorder = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
  const children = blocks.map((b) => {
    const text = plainText(b);
    switch (b.type) {
      case "title":
        return new Paragraph({ alignment: AlignmentType.CENTER, heading: HeadingLevel.TITLE, spacing: { after: 200 }, children: runs(text, { bold: true, size: 32 }) });
      case "subtitle":
        return new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 300 }, children: runs(text, { italics: true, size: 20 }) });
      case "heading":
        return new Paragraph({ heading: HeadingLevel.HEADING_2, spacing: { before: 240, after: 120 }, children: runs(text, { bold: true, size: 24 }) });
      case "note":
        return new Paragraph({ spacing: { after: 200 }, children: runs(text, { italics: true, size: 20 }) });
      case "signature": {
        const cols = text.split("|");
        return new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          borders: { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder, insideHorizontal: noBorder, insideVertical: noBorder },
          rows: [
            new TableRow({
              children: cols.map(
                (c) => new TableCell({ width: { size: 100 / cols.length, type: WidthType.PERCENTAGE }, children: [new Paragraph({ spacing: { before: 400, after: 1200 }, children: runs(c) })] }),
              ),
            }),
          ],
        });
      }
      default:
        return new Paragraph({ alignment: AlignmentType.JUSTIFIED, spacing: { after: 160 }, children: runs(text) });
    }
  });

  const doc = new Document({
    creator: "ActeFacile",
    title: act.title,
    sections: [
      {
        properties: { page: { margin: { top: 1134, bottom: 1134, left: 1134, right: 1134 } } },
        footers: { default: new Footer({ children: [new Paragraph({ children: [new TextRun({ text: DISCLAIMER, size: 14, color: "777777" })] })] }) },
        children,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  saveBlob(blob, fileName(act, "docx"));
}
