# PHASE 12 — INVOICE & PDF GENERATION

## Goal
Build the automated invoice generation engine with sequential unique numbering, itemized tax calculation, and server-side PDF document rendering.

## Key Tasks
1. Implement atomic, collision-free sequential invoice numbering generator (e.g., `AP-INV-YYYYMM-XXXX`).
2. Build invoice data engine calculating itemized services, spare parts, labor, applicable GST/taxes, and discounts.
3. Build branded PDF generation pipeline rendering professional Auto Pro invoices.
4. Store generated PDF documents in secure object storage and issue expiring signed URLs for downloads.
5. Build APIs for fetching invoice details and generating on-demand PDF downloads (`/api/v1/invoices/:id/download`).
6. Integrate invoice viewer and download actions in `customer-mobile/` and `admin/`.
7. Write unit tests for invoice tax math, currency rounding, and PDF generator integrity.
8. Update `PROJECT_STATE.md`.

## Do NOT
- Produce duplicate invoice serial numbers or non-atomic counter increments.
- Omit mandatory tax breakdown or business registration details from the invoice layout.
- Expose invoice PDFs publicly without authenticated or signed URL access.

## Deliverables
- Invoice module in `backend/src/modules/invoices/`.
- Branded PDF generation template and renderer.
- Cloud storage integration for invoice assets.
- Mobile and web invoice preview and download features.
- Updated `PROJECT_STATE.md`.
