# PHASE 16 — NO-CODE CMS & DYNAMIC LAYOUT SYSTEM

## Goal
Implement a configuration-driven CMS enabling marketing and ops teams to customize mobile and web landing screens, promotional banners, and service highlights using predefined UI components.

## Key Tasks
1. Design CMS schemas for page layouts, modular sections (hero banners, category carousels, promo cards, FAQs, testimonials), and publishing states.
2. Build backend CMS endpoints (`/api/v1/cms/pages/:slug`) with caching and draft/published state handling.
3. Build CMS manager in `admin/` with drag-and-drop section ordering, image asset upload, and real-time preview.
4. Build dynamic layout renderer components in `web/` and `customer-mobile/` mapping JSON schema blocks to native/web UI components.
5. Enforce sanitization on all rich-text content to eliminate XSS risks.
6. Write tests for schema validation, draft filtering, and unknown component fallback handling.
7. Update `PROJECT_STATE.md`.

## Do NOT
- Permit raw unescaped HTML or script injection through CMS content fields.
- Allow draft or expired CMS configurations to appear in production customer views.
- Crash client apps when rendering an unknown or deprecated section type.

## Deliverables
- CMS content engine in `backend/src/modules/cms/`.
- Admin CMS layout builder and banner manager in `admin/`.
- Dynamic component renderer in mobile and web frontends.
- Automated tests verifying content validation and rendering.
- Updated `PROJECT_STATE.md`.
