import { useState } from "react";
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import api from "../api/client";
import FormModal from "./FormModal";

const PAGE_SIZE = 20;

function renderCell(col, row) {
  if (col.render) return col.render(row);
  const v = row[col.key];
  if (typeof v === "boolean") return v ? "Yes" : "No";
  return v === null || v === undefined || v === "" ? "—" : v;
}

export default function ResourcePage({
  title,
  endpoint,
  columns,
  fields = [],
  canCreate = true,
  canEdit = true,
  canDelete = true,
  toggleField,
  filter,
  extraActions = [],
}) {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [searchText, setSearchText] = useState("");
  const [search, setSearch] = useState("");
  const [filterValue, setFilterValue] = useState("");
  const [editing, setEditing] = useState(null); // null = closed, {} = new, row = edit

  const params = { page };
  if (search) params.search = search;
  if (filter && filterValue) params[filter.param] = filterValue;

  const list = useQuery({
    queryKey: [endpoint, params],
    queryFn: () => api.get(endpoint, { params }).then((r) => r.data),
    placeholderData: keepPreviousData,
  });

  const filterOptions = useQuery({
    queryKey: [filter?.endpoint, "options"],
    queryFn: () =>
      api
        .get(filter.endpoint, { params: { page_size: 500 } })
        .then((r) => r.data.results),
    enabled: !!filter,
  });

  const refresh = () => qc.invalidateQueries({ queryKey: [endpoint] });

  const remove = useMutation({
    mutationFn: (row) => api.delete(`${endpoint}${row.id}/`),
    onSuccess: refresh,
    onError: () => alert("Could not delete. It may be in use by other records."),
  });

  const toggle = useMutation({
    mutationFn: (row) =>
      api.patch(`${endpoint}${row.id}/`, { [toggleField]: !row[toggleField] }),
    onSuccess: refresh,
  });

  async function save(payload) {
    if (editing?.id) await api.patch(`${endpoint}${editing.id}/`, payload);
    else await api.post(endpoint, payload);
    await refresh();
    setEditing(null);
  }

  function handleSearch(e) {
    e.preventDefault();
    setPage(1);
    setSearch(searchText.trim());
  }

  const rows = list.data?.results || [];
  const totalPages = Math.max(1, Math.ceil((list.data?.count || 0) / PAGE_SIZE));
  const hasActions = canEdit || canDelete || extraActions.length > 0;

  return (
    <>
      <div className="page-head">
        <h2>{title}</h2>
        {canCreate && (
          <button className="btn primary" onClick={() => setEditing({})}>
            + Add
          </button>
        )}
      </div>

      <div className="toolbar">
        <form onSubmit={handleSearch} className="search">
          <input
            placeholder="Search..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
          <button className="btn">Search</button>
        </form>
        {filter && (
          <select
            value={filterValue}
            onChange={(e) => {
              setPage(1);
              setFilterValue(e.target.value);
            }}
          >
            <option value="">{filter.label}</option>
            {(filterOptions.data || []).map((o) => (
              <option key={o.id} value={o.id}>
                {filter.optionLabel(o)}
              </option>
            ))}
          </select>
        )}
      </div>

      {list.isLoading && <p>Loading...</p>}
      {list.error && <p className="error">Could not load data.</p>}

      {list.data && (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                {columns.map((c) => (
                  <th key={c.key}>{c.label}</th>
                ))}
                {hasActions && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && (
                <tr>
                  <td colSpan={columns.length + 1} className="muted">
                    No records found.
                  </td>
                </tr>
              )}
              {rows.map((row) => (
                <tr key={row.id}>
                  {columns.map((c) => (
                    <td key={c.key}>
                      {toggleField && c.key === toggleField && canEdit ? (
                        <button
                          className={`pill ${row[toggleField] ? "on" : "off"}`}
                          onClick={() => toggle.mutate(row)}
                        >
                          {row[toggleField] ? "Active" : "Inactive"}
                        </button>
                      ) : (
                        renderCell(c, row)
                      )}
                    </td>
                  ))}
                  {hasActions && (
                    <td className="actions">
                      {extraActions.map((a) => (
                        <button key={a.label} className="btn small" onClick={() => a.onClick(row, refresh)}>
                          {a.label}
                        </button>
                      ))}
                      {canEdit && (
                        <button className="btn small" onClick={() => setEditing(row)}>
                          Edit
                        </button>
                      )}
                      {canDelete && (
                        <button
                          className="btn small danger"
                          onClick={() => {
                            if (window.confirm("Delete this record?")) remove.mutate(row);
                          }}
                        >
                          Delete
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="pager">
        <button className="btn" disabled={page <= 1} onClick={() => setPage(page - 1)}>
          Previous
        </button>
        <span>
          Page {page} of {totalPages} ({list.data?.count ?? 0} records)
        </span>
        <button className="btn" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
          Next
        </button>
      </div>

      {editing && (
        <FormModal
          title={editing.id ? `Edit ${title}` : `Add ${title}`}
          fields={fields}
          initial={editing}
          onClose={() => setEditing(null)}
          onSave={save}
        />
      )}
    </>
  );
}