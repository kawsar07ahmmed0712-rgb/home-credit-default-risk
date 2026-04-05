import { useMemo, useState } from "react";

export default function SearchableSelect({
  label,
  value,
  onChange,
  options,
  placeholder = "Search...",
  getLabel = (option) => option.label ?? option.value ?? option,
  getValue = (option) => option.value ?? option.column ?? option,
  helperText,
  query,
  onQueryChange,
  loading = false,
  emptyText = "No matching options.",
  selectedLabel,
}) {
  const [localQuery, setLocalQuery] = useState("");
  const [open, setOpen] = useState(false);
  const currentQuery = query ?? localQuery;
  const isAsyncSearch = typeof onQueryChange === "function";

  const selectedOption = useMemo(
    () => options.find((option) => getValue(option) === value),
    [getValue, options, value]
  );

  const filteredOptions = useMemo(() => {
    if (isAsyncSearch) {
      return options;
    }

    const search = currentQuery.trim().toLowerCase();
    if (!search) return options.slice(0, 20);
    return options
      .filter((option) => getLabel(option).toLowerCase().includes(search))
      .slice(0, 20);
  }, [currentQuery, getLabel, isAsyncSearch, options]);

  function updateQuery(nextValue) {
    if (isAsyncSearch) {
      onQueryChange(nextValue);
      return;
    }

    setLocalQuery(nextValue);
  }

  const closedValue =
    selectedOption ? getLabel(selectedOption) : selectedLabel ?? (typeof value === "string" ? value : "");

  return (
    <div className="relative">
      <label className="block">
        <span className="mb-2 block text-sm text-slate-300">{label}</span>
        <input
          type="text"
          value={open ? currentQuery : closedValue}
          onChange={(event) => {
            updateQuery(event.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          className="w-full rounded-[1.15rem] border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400/40"
        />
      </label>
      {helperText ? <p className="mt-2 text-xs text-slate-500">{helperText}</p> : null}

      {open ? (
        <div className="absolute z-20 mt-2 max-h-64 w-full overflow-auto rounded-[1.2rem] border border-white/10 bg-slate-950/95 p-2 shadow-[0_24px_60px_rgba(2,6,23,0.5)]">
          {loading ? (
            <div className="px-3 py-4 text-sm text-slate-400">Loading options...</div>
          ) : filteredOptions.length ? (
            filteredOptions.map((option) => {
              const optionValue = getValue(option);

              return (
                <button
                  type="button"
                  key={optionValue}
                  onClick={() => {
                    onChange(optionValue, option);
                    updateQuery(getLabel(option));
                    setOpen(false);
                  }}
                  className={`flex w-full items-start justify-between rounded-[1rem] px-3 py-3 text-left text-sm transition hover:bg-white/5 ${
                    optionValue === value ? "bg-cyan-400/10 text-cyan-200" : "text-slate-200"
                  }`}
                >
                  <span>{getLabel(option)}</span>
                </button>
              );
            })
          ) : (
            <div className="px-3 py-4 text-sm text-slate-400">{emptyText}</div>
          )}
        </div>
      ) : null}
    </div>
  );
}
