import React, { useCallback, useEffect, useRef, useState } from 'react';
import { isAxiosError } from 'axios';
import api from '../config/api';
import { PageHeader } from '../components/common/PageHeader';
import { fieldValue, formPayload, recordId, Field, ModuleSpec, RecordData, RowAction } from '../modules/resource-types';
const message = (error: unknown) => isAxiosError(error) ? error.response?.data?.message || 'The API is unavailable. Retry the request.' : error instanceof Error ? error.message : 'Unable to complete the request.';
const display = (value: unknown): string => value == null ? '—' : typeof value === 'boolean' ? value ? 'Yes' : 'No' : Array.isArray(value) ? value.map(item => item && typeof item === 'object' ? String((item as RecordData).message || (item as RecordData).name || JSON.stringify(item)) : String(item)).join('; ') : typeof value === 'object' ? JSON.stringify(value) : String(value);
interface FormState { title: string; fields: Field[]; path: string; method: 'post'|'put'; initial: RecordData; }
export const ResourceModulePage: React.FC<{ spec: ModuleSpec }> = ({ spec }) => {
  const [rows, setRows] = useState<RecordData[]>([]); const [page, setPage] = useState(1); const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(false); const [error, setError] = useState(''); const [busy, setBusy] = useState(false);
  const [form, setForm] = useState<FormState>(); const [values, setValues] = useState<Record<string,string|boolean>>({});
  const [references, setReferences] = useState<Record<string,RecordData[]>>({}); const [search, setSearch] = useState('');
  const requestId = useRef(0);
  const load = useCallback(async (signal?: AbortSignal) => {
    const active = ++requestId.current; setLoading(true); setError('');
    try { const response = await api.get(spec.path,{ params: { page, limit: 25 }, signal }); if (!Array.isArray(response.data?.data)) throw new Error('Invalid list response from server.'); if (active !== requestId.current || signal?.aborted) return; setRows(response.data.data); setPages(Math.max(1,Number(response.data.pagination?.totalPages || 1))); }
    catch (error) { if (active === requestId.current && !signal?.aborted) setError(message(error)); }
    finally { if (active === requestId.current && !signal?.aborted) setLoading(false); }
  },[spec.path,page]);
  useEffect(() => { const controller = new AbortController(); setRows([]); void load(controller.signal); return () => controller.abort(); },[load]);
  useEffect(() => {
    if (!form) return; let cancelled = false;
    const loadReferences = async () => {
      try { const entries = await Promise.all(form.fields.filter(field => field.reference).map(async field => {
        const items: RecordData[] = []; let page = 1; let pages = 1;
        do { const response = await api.get(field.reference!,{ params: { page, limit: 100 } }); if (!Array.isArray(response.data.data)) throw new Error('Invalid selection options.'); items.push(...response.data.data); pages = Number(response.data.pagination?.totalPages || 1); page++; } while (page <= pages);
        return [field.key,items] as const;
      })); if (!cancelled) setReferences(Object.fromEntries(entries)); }
      catch (error) { if (!cancelled) setError(message(error)); }
    }; void loadReferences(); return () => { cancelled = true; };
  },[form]);
  const open = (form: FormState) => {
    const initial: Record<string,string|boolean> = {};
    form.fields.forEach(field => {
      const value = fieldValue(form.initial,field.key) ?? field.default ?? '';
      initial[field.key] = field.type === 'boolean' ? Boolean(value) : field.type === 'reference' ? recordId(value) : field.type === 'list' ? Array.isArray(value) ? value.join('\n') : '' : field.type === 'configValue' && form.initial.type === 'JSON' ? JSON.stringify(value,null,2) : field.type === 'date' && value ? new Date(String(value)).toISOString().slice(0,16) : String(value);
    }); setValues(initial); setForm(form); setReferences({}); setError('');
  };
  const action = async (action: RowAction, row: RecordData) => {
    if (action.fields) { open({ title: action.label, fields: action.fields, path: action.path(row), method: action.method, initial: row }); return; }
    if (busy) return; setBusy(true); setError('');
    try { await api[action.method](action.path(row),action.body?.(row) || {}); await load(); }
    catch (error) { setError(message(error)); } finally { setBusy(false); }
  };
  const save = async (event: React.FormEvent) => {
    event.preventDefault(); if (!form || busy) return; setBusy(true); setError('');
    try { const payload = formPayload(form.fields,values); const path = spec.savePath && !form.initial._id ? spec.savePath(payload) : form.path; await api[form.method](path,payload); setForm(undefined); await load(); }
    catch (error) { setError(message(error)); } finally { setBusy(false); }
  };
  const visibleRows = rows.filter(row => !search || spec.columns.some(column => display(fieldValue(row,column.key)).toLowerCase().includes(search.toLowerCase())));
  return <div><PageHeader title={spec.title} description={spec.description} /><div className="mb-4 flex flex-wrap gap-3"><button disabled={loading || busy} onClick={() => void load()} className="px-4 py-2 rounded-lg border bg-white">{loading ? 'Loading...' : 'Refresh'}</button>{spec.createPath && spec.fields && <button disabled={busy} onClick={() => open({ title: `Add ${spec.title}`, fields: spec.fields!, path: spec.createPath!, method: spec.saveMethod || 'post', initial: {} })} className="px-4 py-2 rounded-lg bg-blue-600 text-white">Add record</button>}<input value={search} onChange={event => setSearch(event.target.value)} aria-label="Search current page" placeholder="Search this page" className="px-3 py-2 rounded-lg border" /></div>
    {!!error && <p role="alert" className="mb-4 p-3 rounded-lg bg-red-50 text-red-700">{error}</p>}
    <div className="bg-white rounded-xl border overflow-x-auto"><table className="w-full text-sm"><thead><tr>{spec.columns.map(column => <th key={column.key} className="text-left p-3 border-b">{column.label}</th>)}<th className="p-3 border-b">Actions</th></tr></thead><tbody>{!visibleRows.length && <tr><td className="p-8 text-center text-gray-500" colSpan={spec.columns.length+1}>{loading ? 'Loading records...' : 'No records found'}</td></tr>}{visibleRows.map(row => <tr key={recordId(row) || String(row.key)} className="border-b">{spec.columns.map(column => <td key={column.key} className="p-3 max-w-sm break-words">{column.money ? new Intl.NumberFormat('en-IN',{style:'currency',currency:'INR'}).format(Number(fieldValue(row,column.key) || 0)) : display(fieldValue(row,column.key))}</td>)}<td className="p-3"><div className="flex flex-wrap gap-2">{spec.updatePath && spec.fields && <button disabled={busy} className="text-blue-600" onClick={() => open({ title: 'Edit record', fields: spec.fields!, path: spec.updatePath!(row), method: 'put', initial: row })}>Edit</button>}{spec.actions?.map(actionSpec => <button key={actionSpec.label} disabled={busy} className="text-blue-600" onClick={() => void action(actionSpec,row)}>{actionSpec.label}</button>)}{!spec.actions?.length && !spec.updatePath && <span className="text-gray-400">View only</span>}</div></td></tr>)}</tbody></table></div>
    <div className="mt-4 flex items-center gap-4"><button disabled={page <= 1 || loading} onClick={() => setPage(page-1)}>Previous</button><span>Page {page} of {pages}</span><button disabled={page >= pages || loading} onClick={() => setPage(page+1)}>Next</button></div>
    {form && <div role="dialog" aria-modal="true" aria-label={form.title} className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"><form onSubmit={save} className="bg-white rounded-xl p-6 w-full max-w-xl max-h-[90vh] overflow-auto space-y-4"><h2 className="font-bold text-xl">{form.title}</h2>{!!error && <p role="alert" className="text-red-700">{error}</p>}{form.fields.map(field => <label key={field.key} className="block text-sm font-medium">{field.label}{field.required ? ' *' : ''}{field.type === 'boolean' ? <input type="checkbox" className="ml-3" checked={Boolean(values[field.key])} onChange={event => setValues(previous => ({ ...previous,[field.key]: event.target.checked }))} /> : field.options || field.reference ? <select required={field.required} value={String(values[field.key] || '')} onChange={event => setValues(previous => ({ ...previous,[field.key]: event.target.value }))} className="block w-full border rounded-lg p-2 mt-1"><option value="">Choose...</option>{field.options?.map(option => <option key={option}>{option}</option>)}{references[field.key]?.filter(row => row.isActive !== false && (!field.referenceRoles || field.referenceRoles.includes(String(row.role)))).map(row => { const id = field.referenceValue ? recordId(fieldValue(row,field.referenceValue)) : recordId(row); return <option key={id} value={id}>{display(fieldValue(row,field.referenceLabel || 'name'))}</option>; })}</select> : ['textarea','list','configValue'].includes(field.type || '') ? <textarea required={field.required} value={String(values[field.key] || '')} onChange={event => setValues(previous => ({ ...previous,[field.key]: event.target.value }))} rows={field.type === 'list' ? 3 : 5} className="block w-full border rounded-lg p-2 mt-1" placeholder={field.type === 'list' ? 'One item per line' : undefined} /> : <input disabled={busy || (!!field.immutable && !!recordId(form.initial))} required={field.required} type={field.type === 'number' ? 'number' : field.type === 'date' ? 'datetime-local' : 'text'} step={field.type === 'number' ? 'any' : undefined} value={String(values[field.key] || '')} onChange={event => setValues(previous => ({ ...previous,[field.key]: event.target.value }))} className="block w-full border rounded-lg p-2 mt-1" />}</label>)}<div className="flex gap-3"><button disabled={busy} type="submit" className="bg-blue-600 text-white rounded-lg px-4 py-2">{busy ? 'Saving...' : 'Save'}</button><button disabled={busy} type="button" onClick={() => setForm(undefined)} className="border rounded-lg px-4 py-2">Cancel</button></div></form></div>}
  </div>;
};
