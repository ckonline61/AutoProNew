export type RecordData = Record<string, unknown>;
export interface Field { key: string; label: string; type?: 'number'|'boolean'|'textarea'|'list'|'date'|'reference'|'configValue'; required?: boolean; immutable?: boolean; referenceRoles?: string[]; options?: string[]; reference?: string; referenceLabel?: string; referenceValue?: string; default?: string|boolean|number; }
export interface RowAction { label: string; path: (row: RecordData) => string; method: 'post'|'put'; fields?: Field[]; body?: (row: RecordData) => RecordData; }
export interface ModuleSpec { title: string; description: string; path: string; columns: { key: string; label: string; money?: boolean }[]; fields?: Field[]; createPath?: string; updatePath?: (row: RecordData) => string; saveMethod?: 'post'|'put'; savePath?: (payload: RecordData) => string; actions?: RowAction[]; }
export const recordId = (value: unknown): string => typeof value === 'string' ? value : value && typeof value === 'object' ? String((value as RecordData).id || (value as RecordData)._id || '') : '';
export function fieldValue(row: RecordData, key: string): unknown { return key.split('.').reduce<unknown>((value,part) => value && typeof value === 'object' ? (value as RecordData)[part] : undefined,row); }
export function formPayload(fields: Field[], values: Record<string,string|boolean>): RecordData {
  const payload: RecordData = {};
  fields.forEach(field => {
    const value = values[field.key];
    if (field.type === 'boolean') { payload[field.key] = Boolean(value); return; }
    const text = String(value ?? '').trim();
    if (!text) { if (field.required) throw new Error(`${field.label} is required.`); return; }
    if (field.type === 'number') { const number = Number(text); if (!Number.isFinite(number)) throw new Error(`${field.label} must be a number.`); payload[field.key] = number; }
    else if (field.type === 'list') payload[field.key] = text.split('\n').map(value => value.trim()).filter(Boolean);
    else if (field.type === 'date') { const date = new Date(text); if (!Number.isFinite(date.getTime())) throw new Error(`${field.label} is invalid.`); payload[field.key] = date.toISOString(); }
    else if (field.type === 'configValue') {
      const type = values.type;
      if (type === 'NUMBER') { const number = Number(text); if (!Number.isFinite(number)) throw new Error('Configuration value must be a number.'); payload[field.key] = number; }
      else if (type === 'BOOLEAN') { if (!['true','false'].includes(text)) throw new Error('Boolean value must be true or false.'); payload[field.key] = text === 'true'; }
      else if (type === 'JSON') { try { payload[field.key] = JSON.parse(text); } catch { throw new Error('Configuration value is not valid JSON.'); } }
      else payload[field.key] = text;
    } else payload[field.key] = text;
  });
  return payload;
}
