import type { RenderedBlock } from "@/lib/moteur";

function Segments({ block }: { block: RenderedBlock }) {
  return (
    <>
      {block.segments.map((s, i) =>
        s.missing ? <span key={i} className="missing">{s.text}</span> : <span key={i}>{s.text}</span>,
      )}
    </>
  );
}

export function DocumentPreview({ blocks }: { blocks: RenderedBlock[] }) {
  return (
    <div className="max-h-[80vh] overflow-y-auto rounded-xl border border-slate-200 bg-slate-100 p-3 sm:p-5">
      <div className="doc-preview mx-auto max-w-[680px] whitespace-pre-line bg-white px-6 py-8 text-[13.5px] leading-relaxed text-slate-900 shadow sm:px-12 sm:py-12">
        {blocks.map((b, i) => {
          switch (b.type) {
            case "title":
              return <h2 key={i} className="mb-2 text-center text-lg font-bold tracking-wide"><Segments block={b} /></h2>;
            case "subtitle":
              return <p key={i} className="mb-6 text-center text-xs italic text-slate-600"><Segments block={b} /></p>;
            case "heading":
              return <h3 key={i} className="mb-2 mt-5 font-bold"><Segments block={b} /></h3>;
            case "note":
              return <p key={i} className="my-4 border-l-2 border-slate-300 pl-3 italic text-slate-700"><Segments block={b} /></p>;
            case "signature": {
              const text = b.segments.map((s) => s.text).join("");
              const cols = text.split("|");
              return (
                <div key={i} className="mt-8 grid gap-6" style={{ gridTemplateColumns: `repeat(${cols.length}, minmax(0, 1fr))` }}>
                  {cols.map((c) => (
                    <div key={c} className="text-xs">
                      {c}
                      <div className="mt-12 border-b border-dashed border-slate-300" />
                    </div>
                  ))}
                </div>
              );
            }
            default:
              return <p key={i} className="mb-3 text-justify"><Segments block={b} /></p>;
          }
        })}
      </div>
    </div>
  );
}
