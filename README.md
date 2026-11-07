# GymPass Enterprise Admin Portal (`apps/admin`)

Desktop-first, enterprise administration workspace for the Gym Marketplace, Voucher Lifecycle & Merchant Platform.

Built with **React 19**, **TypeScript**, **Tailwind CSS**, **shadcn UI patterns**, and **TanStack Table v8**.

---

## 🌟 Key Architecture & Capabilities

### 1. Role-Based Access Control (RBAC) & Dynamic Navigation
The portal features 4 granular staff roles:
* 👑 **Super Admin (`super_admin`)**: Full unconstrained access across all modules, settings, staff credentials, and financial overrides.
* 💳 **Finance Desk (`finance`)**: Authorized for Payment Verification, Bank Reconciliation, Vouchers, Refund Payouts, Financial Reports, and Platform Fee Settings.
* 🛡️ **Moderator (`moderator`)**: Authorized for Gym Onboarding Approvals, Document Audits, Facility Media Moderation, Review Moderation, and Localities/Cities.
* 🎧 **Customer & Gym Support (`support`)**: Authorized for Member Management, Voucher Timelines, Support Tickets, and Broadcast Announcements.

> **Live Persona Switcher**: Use the quick role dropdown in the top header or the 1-click persona buttons on the Login page to seamlessly preview how navigation menus, route access, and action capabilities dynamically adapt.

---

### 2. Universal Operational Rules (Fully Implemented)
* **100% Immutable Audit Trail**: Every single administrative action (payment approvals, rejections, gym onboarding checklist items, suspensions, blocks, refunds, setting adjustments, broadcasts) writes a structured entry to the central audit log with actor ID, role, IP address, timestamp, description, and JSON state diff.
* **Safety Confirmation Dialogs**: Destructive or high-impact actions (blocking users/gyms, suspending partners, rejecting applications, issuing bank refunds) require explicit modal confirmation and mandatory explanation notes.
* **Unified TanStack Table v8**: Every table across all 15 screens features:
  - Real-time global and column search
  - Faceted status/category dropdown filters
  - Multi-column sort
  - Pagination (page size selector 10/20/30/50/100, page jumps, total counts)
  - 1-click CSV Export.

---

## 🖥️ Screen Directory & Feature Guide

### 1. Login (`/login`)
* Email & password authentication with credential validation.
* Optional Two-Factor Authentication (2FA) with 6-digit authenticator OTP (demo code: `123456`).
* 1-Click Demo Persona shortcuts for instant evaluation as Super Admin, Finance, Moderator, or Support.

### 2. Platform Dashboard (`/dashboard`)
* KPI Cards: Total Gyms (by status: Active, Pending, Suspended, Blocked), Registered Users, Platform Fee Revenue, and Featured Ad Revenue.
* Real-time SLA Alert Banner when any pending payment breaches the 30-minute target window.
* Recharts Data Visualizations:
  - Weekly GTV vs Platform Commission vs Featured Revenue (Area Chart).
  - Voucher Lifecycle Status Composition (Donut / Pie Chart).
* Operational Queues: Immediate access to urgent payment verifications and pending gym applications.

### 3. Payment Verification Desk (`/payments`) — *Most Important Screen*
* Real-time table of vouchers in `FEE_PENDING_VERIFICATION` status.
* Live SLA Countdown Timer badge for every transaction (turns to animated warning under 10 minutes; pulses red with breached countdown if over 30 minutes).
* **Duplicate UTR Detection Engine**: Flags identical transaction references across multiple vouchers with an amber warning badge and a popup detailing conflicting claims.
* 1-Click Single **Verify** (instant pass activation) and **Reject** (requires policy justification).
* **Bulk CSV Bank Statement Auto-Match Engine**:
  - Upload or paste ICICI/HDFC/Axis/SBI bank statement CSV rows (`Date, UTR, Amount, Narration`).
  - Automatically reconciles statement credits against pending vouchers by UTR and Amount.
  - Categorizes rows into: Exact Matches, Amount Discrepancies, Unmatched Bank credits, and Still Pending vouchers.
  - "Verify All Matched" one-click batch approval.
  - Includes sample CSV generator and "Load Today's Sample Credits" shortcut.

### 4. Gym Onboarding Approvals (`/approvals`)
* Application audit queue for newly registered gyms.
* Interactive 4-point Verification Checklist:
  1. Business Registration & GST Certificate
  2. Facility Photos & Equipment Hygiene
  3. Physical Address & Geo-Coordinates
  4. Payout UPI VPA & Bank Account
* Embedded Document Viewer (official MCA/GST digital certificates).
* Actions: Approve Gym, Reject Application (with reason), or Request Changes (with note).

### 5. Gyms Directory & Management (`/gyms`)
* Complete partner directory with faceted status and locality filters.
* Comprehensive Gym Detail Drawer:
  - Owner & banking information
  - Membership plans & pricing tiers
  - Services and amenity badges
  - Facility media gallery
  - Active members count & historical vouchers sold
* Actions: Suspend gym, Block gym, Restore & Unblock, Toggle Verified Badge, Custom Commission % Override.

### 6. User Management (`/users`)
* Directory of members with search by name, email, phone, and city.
* Member Profile Drawer displaying historical vouchers purchased, pass statuses, and active memberships.
* Actions: Block / Unblock user with confirmation dialog and mandatory reason.

### 7. Vouchers & Pass Lifecycle (`/vouchers`)
* Master record of all vouchers across all lifecycle states (`FEE_PENDING_VERIFICATION`, `ACTIVE`, `REDEEMED`, `EXPIRED`, `REFUND_REQUESTED`, `REFUNDED`, `CANCELLED`).
* **Interactive Lifecycle Event Timeline**: Inspect any voucher to see its complete chronological history (UPI payment initiation, fee verification, pass activation, counter check-in redemption, or refund).

### 8. Refunds & Payouts (`/refunds`)
* Refund claims queue with user reasons and original voucher details.
* Actions: Approve refund claim, Reject refund claim (with reason).
* **Record Bank Disbursement ("Mark Paid with UTR")**: Records refund bank UTR, updates claim to `REFUNDED`, updates voucher to `REFUNDED`, and writes audit log.

### 9. Featured Listings & Slots (`/featured`)
* Locality ad slots overview (e.g. Koramangala 1/3, Indiranagar 1/3).
* Pending featured requests queue with Activate and Reject actions.
* Locality Pricing Matrix: Tier 1 vs Tier 2 Weekly and Monthly campaign packages.
* Interactive Calendar Schedule Grid displaying daily slot occupancy per locality.

### 10. Media & Reviews Moderation (`/moderation`)
* **Facility Media Tab**: Visual grid of photo and video uploads from gyms with 1-click Approve and Reject (with reason dialog).
* **Reviews Moderation Tab**: User reviews with star ratings, comments, and flag status. Actions: Approve, Reject/Hide, and Post Official Admin Reply.

### 11. Localities & Cities (`/localities`)
* **Cities Management**: Operational city toggles (Bengaluru, Mumbai, Delhi-NCR, Hyderabad) and Add New City modal.
* **Localities Management**: Locality directory with pincodes, tiers (Tier 1/2/3), max featured slots, gym counts, and Add Locality modal.

### 12. Platform Configuration Settings (`/settings`)
* Standard Platform Fee % (default 10.0%).
* Platform Fee Cap (₹500 maximum fee per transaction).
* Voucher Validity (30 days default).
* Company Central UPI VPA (`gymplatform@icici`).
* Company Legal Name & Consumer Brand Name.
* Featured Listing base pricing tiers.

### 13. Financial Reports & Analytics (`/reports`)
* Date range presets (Last 7 Days, 30 Days, This Quarter).
* Aggregate metrics: Gross Transaction Value (GTV), Platform Fee Commission, Featured Ad Revenue, Refund Deductions, and Net Revenue.
* Visual Marketplace Conversion Funnel (Views -> Vouchers -> Verified Payments -> Redeemed).
* Partner Gym Acquisition & Revenue Matrix table with 1-click CSV export.

### 14. Central Audit Trail (`/audit`)
* Immutable chronological event stream of every action performed on the platform.
* Filter by actor role, entity type, and action name.
* **Diff / State Delta Inspector**: Modal showing JSON before/after snapshots for any action.
* 1-click CSV export of audit records.

### 15. Staff & Roles (`/staff`)
* Staff member directory with roles, last active timestamps, and 2FA status.
* Add New Staff Member modal.
* Modify Staff Role modal.
* Suspend / Activate staff toggle.
* Comprehensive Role-Based Access Control (RBAC) Permissions Matrix comparing all 4 roles across 14 operational modules.

### 16. Support Desk & Broadcast Announcements (`/support`)
* **Support Desk Tab**: Customer and gym owner support tickets with priorities (Low, Medium, High, Urgent), interactive chat thread modal, agent reply box, and status lifecycle transitions.
* **Broadcast Announcements Tab**: Send announcements to All, Gyms, or Users via In-App Banner, Mobile Push, or Email + past broadcast history.

---

## 🚀 Running the Project

### Quick Start (Standalone Project)
```bash
# Navigate to this folder
cd apps/admin

# Install dependencies (standalone, no monorepo needed)
npm install

# Start local development server (port 5173)
npm run dev

# Run automated unit tests
npm test

# Build for production
npm run build
```
Compiled assets will be output to `apps/admin/dist` ready for desktop and web deployment.
