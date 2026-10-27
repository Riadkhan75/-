# Security Specification & Threat Model for মানবতার সেবা (Manobotar Sheba)

## 1. Data Invariants
1. A citizen's help request (`/help_requests/{id}`) must have `ownerId == request.auth.uid` on creation. Citizens cannot self-approve their own requests (`status` must default to `pending`).
2. Only an authorized administrator (`isAdmin()`) or superadmin can alter the `status` of a help request to `approved`, `rejected`, or `completed`, or edit `adminNotes`.
3. Donations (`/donations/{id}`) can be created by donors with initial status `pending_verification`. Donors CANNOT self-verify transactions (`status == 'verified'`). Only an admin can set `status == 'verified'`.
4. Blood donor private phone numbers and full address details must not be exposed to arbitrary scrapers; donor documents can be read when searching blood donors, but mutations require `userId == request.auth.uid`.
5. Public visitors can read active campaigns, published events, active announcements, active blood requests, and approved public help requests.
6. Audit logs (`/audit_logs/{id}`) can only be written by authenticated administrators and cannot be altered or deleted once written.
7. Role escalation: Users cannot grant themselves `admin` or `superadmin` in `/users/{uid}`. Admin checks are validated against `/admins/{uid}` or pre-bootstrapped authorized admin email `nazrulpost75@gmail.com`.

## 2. The "Dirty Dozen" Threat Payloads
1. **Self-Approve Help Request**: User submits `status: "approved"` directly on create. (Rejected: must be `pending`).
2. **Shadow Donation Verification**: User creates donation with `status: "verified"` and `amount: 50000`. (Rejected: must be `pending_verification`).
3. **Admin Escalation in User Profile**: User sets `role: "admin"` in `/users/{uid}`. (Rejected: non-admins cannot write admin role).
4. **Spoof Help Request Owner**: Attacker sets `ownerId: "victim_123"`. (Rejected: `ownerId` must match `request.auth.uid`).
5. **Denial of Wallet ID/String Poisoning**: Attacker sends a 500KB string in `description` or `referenceNo`. (Rejected: max length bounds enforced).
6. **Orphaned Registration**: Creating event registration for a non-existent event ID. (Rejected).
7. **Tamper Verified Donation**: Modifying amount of an already verified donation. (Rejected: terminal status protection).
8. **Delete Audit Log**: Admin or attacker attempts `delete` on `/audit_logs/{id}`. (Rejected: audit logs are append-only).
9. **Blood Donor Phone Scrape Blanket Read**: Unauthenticated bots attempting mass collection reads. (Regulated through safe queries).
10. **Campaign Target Inflation**: Non-admin attempting to create or alter relief campaigns. (Rejected: only admins can create/update campaigns).
11. **Expense Fabricator**: Non-admin creating expense entries under `/expenses/{id}`. (Rejected: admin only).
12. **Ghost Update Attack**: Sending extra unapproved fields during update. (Rejected: strict key check via `affectedKeys()`).
