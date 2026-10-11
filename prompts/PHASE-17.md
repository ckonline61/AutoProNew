# PHASE 17 — SPARE PARTS MARKETPLACE

## Goal
Implement the Auto Pro spare parts marketplace featuring OEM/aftermarket catalog browsing, vehicle compatibility matching, cart and checkout workflows, and atomic inventory tracking.

## Key Tasks
1. Build spare parts catalog data models and APIs: category, OEM part number, specs, vehicle compatibility matrix (make, model, year, trim), pricing, and stock count.
2. Build search and filter endpoints supporting part number lookup and compatibility auto-matching against the user's garage.
3. Implement cart and order checkout services with atomic inventory reservation and stock depletion.
4. Implement order status lifecycle (`PLACED`, `PROCESSING`, `DISPATCHED`, `DELIVERED`, `CANCELLED`).
5. Build inventory management and stock alert dashboard in `admin/`.
6. Implement parts marketplace UI screens in `customer-mobile/` and `web/`.
7. Write unit and concurrency tests for cart operations, stock reservations, and race condition prevention.
8. Update `PROJECT_STATE.md`.

## Do NOT
- Allow overselling or race conditions during high-concurrency checkout.
- Trust client prices, shipping calculations, or inventory counts.
- Permit purchases of parts incompatible with customer's selected vehicle without an explicit compatibility warning.

## Deliverables
- Spare parts marketplace module in `backend/src/modules/parts/`.
- Atomic inventory reservation engine.
- Marketplace UI in mobile and web applications.
- Inventory administration views in `admin/`.
- Updated `PROJECT_STATE.md`.
