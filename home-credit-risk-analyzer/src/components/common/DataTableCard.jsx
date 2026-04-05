export default function DataTableCard({ title, subtitle, columns, rows }) {
  return (
    <div className="soft-card p-6">
      <div className="max-w-2xl">
        <h3 className="text-xl font-semibold text-white">{title}</h3>
        {subtitle ? <p className="mt-3 text-sm leading-7 text-slate-400">{subtitle}</p> : null}
      </div>

      <div className="mt-6 overflow-hidden rounded-[1.5rem] border border-white/10 bg-slate-950/70">
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.03]">
                {columns.map((column) => (
                  <th
                    key={column.key}
                    className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-400 ${
                      column.align === "right" ? "text-right" : ""
                    }`}
                  >
                    {column.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, rowIndex) => (
                <tr
                  key={row.id ?? rowIndex}
                  className="border-b border-white/5 last:border-b-0"
                >
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className={`px-4 py-3 text-sm text-slate-200 ${
                        column.align === "right" ? "text-right" : ""
                      }`}
                    >
                      {column.render ? column.render(row[column.key], row) : row[column.key]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
