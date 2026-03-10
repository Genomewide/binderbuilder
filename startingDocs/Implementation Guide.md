---

# Build the Binder

## Engineering Implementation Blueprint for Claude Code / Cursor

**Version:** v1
**Purpose:** Convert the design document into a build-ready execution plan for coding agents

---

## 1. What this document is for

This document is the operating spec for an implementation agent.

It exists because coding agents usually fail in one of four ways:

1. they build features in the wrong order
2. they over-engineer infrastructure
3. they invent product behavior not in scope
4. they do not preserve data provenance and safety rules

This document prevents that by specifying:

* required stack
* repository layout
* implementation phases
* exact feature boundaries
* database migration order
* API shape
* frontend page requirements
* worker jobs
* acceptance criteria
* testing requirements
* definition of done

This project is a **React + TypeScript + Tailwind frontend**, **Node + TypeScript backend**, and **SQLite + local hard-drive storage** app for the first version.

---

## 2. Product goal in one sentence

Build a digital medical binder for a medically complex child that combines:

* uploaded documents
* OCR for scans/photos
* XML/JSON/ZIP portal-download ingestion
* structured clinical records
* a master timeline
* physician summaries
* emergency access
* grounded AI query

---

## 3. Non-negotiable implementation rules

These are hard constraints.

### 3.1 Stack constraints

Use:

* React
* TypeScript
* Tailwind CSS
* Node.js
* TypeScript on backend
* SQLite database stored on server disk
* uploaded/imported files stored on server disk

Do **not** replace with:

* Next.js unless explicitly approved
* Postgres
* MongoDB
* Supabase
* Firebase
* S3
* cloud-only storage
* Prisma if Drizzle has already been chosen
* serverless-only architecture

### 3.2 Deployment model constraints

Assume:

* one server
* one SQLite DB file
* one file storage root on that server
* one API process
* one worker process

### 3.3 Medical data safety constraints

The system must always preserve:

* original uploaded file
* original imported XML/JSON/ZIP artifact
* provenance for structured facts
* verification state
* audit logs for important actions

### 3.4 AI constraints

AI features must be:

* retrieval-based
* source-grounded
* citation-first
* clearly labeled when suggesting patterns

Do **not** implement:

* diagnosis generation
* medical advice engine
* unsupported summarization without evidence
* silent mutation of structured data from AI output

### 3.5 Scope control

The first version must support:

* manual uploads
* OCR
* XML/JSON/ZIP portal imports
* structured patient record
* timeline
* summaries
* emergency access
* sharing
* search
* care coordination basics

The first version does **not** need:

* live EHR integrations
* mobile apps
* real-time collaboration
* fine-grained enterprise admin
* payments
* multi-org SaaS

---

## 4. What success looks like

A parent should be able to:

1. create a household and a child profile
2. add diagnoses, medications, providers, visits, procedures, labs, and symptoms
3. upload a PDF or scanned note
4. upload a downloaded portal export in XML/JSON/ZIP form
5. review extracted/imported records and resolve conflicts
6. view the child’s history in a single timeline
7. search across all records and documents
8. generate a physician summary PDF
9. open an emergency card or QR-based link
10. ask “What meds have been tried for seizures?” and get a grounded answer with sources

If those ten flows work cleanly, the build is successful.

---

## 5. Recommended repository structure

```text
/build-the-binder
  /apps
    /web
    /api
    /worker
  /packages
    /shared
    /ui
    /config
  /data
    /db
    /documents
    /imports
    /exports
    /derived
    /qr
    /backups
  /scripts
  package.json
  pnpm-workspace.yaml
```

### 5.1 App responsibilities

#### `apps/web`

React app:

* routes
* forms
* tables
* timeline UI
* document viewer
* review workflows
* summary pages
* emergency page

#### `apps/api`

Fastify server:

* auth
* household/patient management
* CRUD for clinical data
* document upload
* import upload
* query/search APIs
* export and share-link APIs

#### `apps/worker`

Background jobs:

* OCR
* parse uploaded docs
* unpack ZIP imports
* parse XML/JSON
* normalize import records
* conflict detection
* indexing
* export generation
* AI query/summarization jobs if async

#### `packages/shared`

Shared Zod schemas, DTOs, enums, utility types.

#### `packages/ui`

Reusable UI primitives and domain components.

---

## 6. Core technical decisions

### 6.1 Frontend

Recommended:

* Vite
* React Router
* TanStack Query
* React Hook Form
* Zod
* Tailwind
* PDF.js

### 6.2 Backend

Recommended:

* Fastify
* Drizzle ORM
* better-sqlite3
* Zod
* secure cookie sessions
* a simple local job queue backed by SQLite `jobs` table

### 6.3 Storage

Use SQLite + disk directories.

Never store absolute file paths in the frontend.
The frontend should only know resource IDs and API URLs.

### 6.4 Search

Use SQLite FTS5 for:

* OCR text
* document text
* imported XML narrative text
* visit summaries
* timeline events
* symptom notes

### 6.5 PDF export

Generate PDFs from server-rendered HTML using a headless browser.

### 6.6 Authentication

Use:

* email/password
* Argon2id hashing
* HTTP-only secure cookies

---

## 7. Phase-based implementation order

Build in this order. Do not skip ahead.

---

## Phase 0 — Project foundation

### Goal

Establish the monorepo, shared tooling, database bootstrapping, session auth skeleton, and app shell.

### Deliverables

* monorepo setup
* TypeScript strict mode
* linting and formatting
* shared env loader
* Drizzle migration setup
* SQLite connection
* Fastify bootstrapped
* React app shell with routing
* Tailwind configured
* shared UI primitives
* basic login/logout/session flow stub
* health endpoint
* file storage service abstraction
* seed script

### Required folders

```text
apps/web/src
apps/api/src
apps/worker/src
packages/shared/src
packages/ui/src
```

### Acceptance criteria

* app boots locally with one command
* DB file is created in `/data/db`
* web and api run together
* authenticated session round-trip works
* seeded demo user can log in
* no TypeScript errors
* no lint errors

### Definition of done

The project can be cloned, installed, seeded, and opened locally by another developer without manual hacks.

---

## Phase 1 — Auth, households, users, patients

### Goal

Implement the tenancy and access foundation.

### Backend deliverables

Create tables and services for:

* users
* sessions
* households
* household_members
* patients
* emergency_contacts
* patient_permissions

Implement endpoints:

* login
* logout
* current session
* household create/get
* invite member
* add/edit patient
* list patients

### Frontend deliverables

Pages:

* login page
* household onboarding
* patient list
* add patient
* patient overview shell
* household member management

### Acceptance criteria

* owner can create household
* owner can add a child profile
* owner can invite caregiver
* authorized user can switch between children
* unauthorized users cannot access another household

### Definition of done

A real household with one or more patient records can be created and navigated.

---

## Phase 2 — Structured clinical record

### Goal

Implement canonical structured data.

### Tables

* providers
* conditions
* medications
* lab_results
* procedures
* visits
* symptom_logs
* appointments
* tasks

### Backend deliverables

CRUD endpoints for all tables above.

### Frontend deliverables

Pages/tabs for:

* providers
* diagnoses
* medications
* labs
* procedures
* visits
* symptoms
* appointments
* tasks

### UX requirements

Medication list must support chronological reading:

* active meds
* past meds
* stop reason if present

Lab view must support:

* sortable table
* quick abnormal flag view

Visits must support:

* linked provider
* summary
* documents later

### Acceptance criteria

* user can add and edit structured medical history
* records are patient-scoped
* active medication list is clearly visible
* structured records render cleanly on patient overview

### Definition of done

The app is already useful as a manual digital binder before any upload/import automation exists.

---

## Phase 3 — Timeline foundation

### Goal

Make the timeline the primary interface.

### Tables

* timeline_events
* timeline_event_links

### Implementation rule

Timeline is a **projection**, not the only source of truth.

### Event sources in this phase

Generate timeline events from:

* diagnoses
* medication starts/stops
* procedures
* visits
* lab milestones
* symptom logs
* appointments optionally

### Backend deliverables

* timeline event generator service
* patient timeline endpoint with filters
* ability to reproject timeline for a patient

### Frontend deliverables

* timeline page
* filter bar
* event cards
* grouped-by-date display
* event detail drawer with linked entities

### Filters

Support:

* event type
* provider
* specialty
* medication
* condition
* date range
* text search

### Acceptance criteria

* adding a medication or visit produces timeline events
* timeline shows linked records
* filters update results correctly
* empty-state messaging is clear

### Definition of done

A clinician can skim the child’s medical story chronologically.

---

## Phase 4 — Document upload and management

### Goal

Support storage and viewing of uploaded medical records.

### Tables

* documents
* document_pages
* document_tags
* extraction_candidates

### Backend deliverables

* multipart file upload endpoint
* file validation
* file persistence to `/data/documents`
* document metadata persistence
* file download/view endpoints
* document status lifecycle

### Supported upload types

* PDF
* PNG
* JPG
* JPEG
* TIFF

### Frontend deliverables

* document list page
* upload dropzone
* document detail page
* PDF/image viewer
* document metadata editor
* document linking UI later-ready

### Document status model

Recommended:

* `UPLOADED`
* `PROCESSING`
* `READY`
* `FAILED`

### Acceptance criteria

* a digital PDF can be uploaded and viewed
* an image scan can be uploaded and viewed
* metadata is stored
* document ownership is patient-scoped
* file is preserved on disk

### Definition of done

The app works as a secure medical document repository.

---

## Phase 5 — OCR and document extraction

### Goal

Make scanned/image-based records searchable and extract candidate facts.

### OCR requirements

Support:

* direct text extraction from digital PDF when possible
* OCR only when embedded text is missing
* page-level extracted text storage
* page number preservation
* OCR confidence storage
* retry/reprocess capability

### Worker jobs

* `OCR_DOCUMENT`
* `PARSE_DOCUMENT`
* `INDEX_DOCUMENT`

### Extraction target types

Generate candidates for:

* diagnosis
* medication
* provider
* visit date
* procedure
* lab value
* allergy

### Review workflow

Do not auto-promote important facts blindly.
Store extraction suggestions in `extraction_candidates`.

### Frontend deliverables

* processing state UI
* OCR text preview
* extraction review queue
* accept/reject/edit-then-accept actions

### Acceptance criteria

* scanned PDF becomes searchable
* image/photo upload becomes searchable
* extracted text is stored per page
* candidate facts can be reviewed
* accepted candidates create structured records and timeline events

### Definition of done

The system can ingest raw paper-like medical records and turn them into searchable, reviewable data.

---

## Phase 6 — Portal download import: XML / JSON / ZIP

### Goal

Support structured imports from downloaded portal data.

This is a core requirement.

### Tables

* import_runs
* import_artifacts
* import_records
* import_conflicts

### Supported input types

* XML
* JSON
* ZIP bundles
* PDFs inside ZIPs
* images inside ZIPs

### Required behaviors

* preserve original uploaded artifact
* unpack ZIP bundles
* register unpacked artifacts
* detect format
* parse supported formats
* extract narrative text
* generate normalized records
* surface conflicts for review
* index imported narrative text for search

### Adapter strategy

Implement parser adapters:

* `CcdaXmlAdapter`
* `FhirBundleJsonAdapter`
* `FhirBundleXmlAdapter`
* `ZipPackageAdapter`
* `UnknownXmlAdapter`

### Minimum parser output

Normalized records for:

* patient details
* providers
* conditions
* medications
* visits
* procedures
* labs
* narrative sections
* document references

### Matching rules

Try to match incoming data to existing records using:

* IDs from source
* same med + date
* same visit + provider + facility
* same provider name + organization
* same procedure + date

Never silently merge low-confidence matches.

### Conflict examples

* imported medication dates differ from existing one
* patient DOB mismatch
* ambiguous provider match
* lab unit mismatch
* diagnosis status conflict

### Frontend deliverables

* import upload page
* import run detail page
* artifact list
* parsed records view
* conflict review UI
* merge/accept/reject controls

### Acceptance criteria

* XML file can be uploaded and processed
* ZIP bundle can be unpacked
* parsed records are visible before merge
* conflicts are reviewable
* accepted import records create structured records and timeline events
* imported narrative text becomes searchable

### Definition of done

A parent can download data from a portal and import it without manually retyping everything.

---

## Phase 7 — Search

### Goal

Provide unified retrieval across documents, imports, and structured records.

### Search sources

Index:

* document page text
* OCR text
* imported XML narrative text
* imported JSON narrative text
* visit summaries
* symptom notes
* timeline titles/summaries

### Backend deliverables

* search endpoint
* FTS indexing jobs
* result grouping
* result snippets
* patient scoping

### Frontend deliverables

* global patient search page
* filters by result type
* snippet rendering
* one-click open to source

### Result types

* document page
* imported narrative section
* medication
* diagnosis
* visit
* lab
* procedure
* timeline event

### Acceptance criteria

Queries like these should work:

* MRI
* Keppra
* EEG
* seizure
* Dr. Smith
* ketogenic diet

### Definition of done

A user can find any meaningful record in seconds.

---

## Phase 8 — Summaries and export

### Goal

Generate doctor-ready and caregiver-ready outputs.

### Summary types

Implement:

* one-page general summary
* neurologist summary
* GI summary
* emergency summary
* school/caregiver instruction summary
* full binder export

### Output behavior

* summaries render in app first
* PDF export generated by backend
* generated file stored in `/data/exports`
* summary generation logged in audit trail

### Summary inputs

Prefer:

1. verified structured data
2. imported structured data
3. accepted extraction candidates
4. cited narrative support

### Frontend deliverables

* summary selection UI
* summary preview
* generate PDF action
* export history list

### Acceptance criteria

* one-page summary is readable and clinically useful
* neurologist summary includes seizure history, relevant meds, EEG/procedure context
* export files can be downloaded
* binder export includes multiple sections and optionally attached docs

### Definition of done

The app can replace the pre-visit scramble of assembling records.

---

## Phase 9 — Emergency mode and sharing

### Goal

Provide safe, fast, limited emergency access.

### Emergency data scope

Show:

* child name
* DOB
* photo optional
* diagnoses
* allergies
* active medications
* implanted devices
* emergency protocol
* emergency contacts
* primary specialists

### Backend deliverables

* share link creation
* token hashing
* expiry
* revocation
* max views optional
* QR code generation
* emergency endpoint without login

### Frontend deliverables

* emergency card page
* share-link manager
* QR code display
* mobile-friendly emergency screen

### Security rule

QR must point to a tokenized URL only.
Never embed raw PHI into the QR payload.

### Acceptance criteria

* owner can generate a temporary link
* unauthed user with valid token can see emergency view
* revoked or expired token fails
* access events are logged

### Definition of done

A caregiver or ER staff member can access critical information quickly but only within a tightly limited scope.

---

## Phase 10 — Ask the record

### Goal

Implement grounded natural-language medical record questions.

### Inputs to retrieval

Use:

* structured records
* timeline events
* document page excerpts
* imported narrative sections
* accepted extraction candidates
* summary records if flagged as grounded

### Required output shape

Each answer must include:

* answer text
* sources
* citation anchors
* confidence/grounding state

### Supported question types

Examples:

* What medications have been tried for seizures?
* When did GI symptoms start?
* What changed since last neurology visit?
* Which doctors ordered MRIs?
* What labs were abnormal recently?

### Guardrails

* answer only from retrieved evidence
* explicitly state when evidence is incomplete
* label possible insights separately from facts
* never give treatment advice

### Frontend deliverables

* ask-the-record page
* response renderer
* citations panel
* saved query history

### Acceptance criteria

* answers cite real sources
* unsupported claims are not invented
* doctor can click from answer to evidence

### Definition of done

The AI layer is useful because it retrieves and organizes the chart, not because it improvises.

---

## 8. Database migration order

Apply migrations in this order.

### Migration 001

* users
* sessions

### Migration 002

* households
* household_members
* patient_permissions

### Migration 003

* patients
* emergency_contacts

### Migration 004

* providers

### Migration 005

* conditions
* medications
* lab_results
* procedures
* visits
* symptom_logs
* appointments
* tasks

### Migration 006

* timeline_events
* timeline_event_links

### Migration 007

* documents
* document_pages
* document_tags
* extraction_candidates

### Migration 008

* import_runs
* import_artifacts
* import_records
* import_conflicts

### Migration 009

* saved_queries
* insights
* summary_exports
* share_links
* audit_logs
* jobs

### Migration 010

* FTS virtual tables and supporting triggers

---

## 9. Canonical domain model rules

These are implementation rules the agent must follow.

### 9.1 Provenance

Every major clinical record should include:

* `source_kind`
* `source_id`
* `verification_status`

### 9.2 Verification states

Allowed states:

* `MANUAL`
* `AI_SUGGESTED`
* `IMPORTED`
* `VERIFIED`
* `CONFLICTED`

### 9.3 Timeline rules

Timeline events are derived from canonical data and imports.
Do not let timeline become the only source of truth.

### 9.4 Source preservation rule

Never delete or overwrite the original uploaded/imported artifact.

### 9.5 Soft delete rule

Use soft delete for clinical records where accidental loss would be dangerous.

---

## 10. API contract baseline

These are the minimum APIs that must exist.

---

## 10.1 Auth

### `POST /auth/login`

Request:

```json
{
  "email": "parent@example.com",
  "password": "secret"
}
```

Response:

```json
{
  "user": {
    "id": "usr_1",
    "displayName": "Parent Name"
  },
  "household": {
    "id": "hh_1",
    "name": "Smith Family"
  }
}
```

### `POST /auth/logout`

### `GET /auth/session`

---

## 10.2 Patients

### `GET /patients`

### `POST /patients`

```json
{
  "firstName": "Emma",
  "lastName": "Smith",
  "displayName": "Emma",
  "dateOfBirth": "2018-06-04",
  "sex": "F",
  "primaryDiagnosisSummary": "SCN2A-related epilepsy"
}
```

### `GET /patients/:id`

### `PATCH /patients/:id`

---

## 10.3 Clinical data

### `GET /patients/:id/medications`

### `POST /patients/:id/medications`

```json
{
  "name": "Levetiracetam",
  "genericName": "levetiracetam",
  "dose": "500 mg",
  "route": "PO",
  "frequency": "BID",
  "startDate": "2024-01-01",
  "status": "ACTIVE",
  "reasonStarted": "Seizure control"
}
```

Repeat same pattern for:

* conditions
* labs
* procedures
* visits
* symptoms
* tasks
* appointments
* providers

---

## 10.4 Timeline

### `GET /patients/:id/timeline`

Query params:

* `from`
* `to`
* `types`
* `providerId`
* `medicationId`
* `conditionId`
* `search`

Response:

```json
{
  "items": [
    {
      "id": "te_1",
      "eventType": "MEDICATION_STARTED",
      "eventDate": "2024-01-01",
      "title": "Started levetiracetam",
      "summary": "Prescribed by Neurology",
      "linked": [
        { "type": "MEDICATION", "id": "med_1" }
      ]
    }
  ]
}
```

---

## 10.5 Documents

### `POST /patients/:id/documents`

Multipart upload.

Response:

```json
{
  "documentId": "doc_1",
  "status": "UPLOADED"
}
```

### `GET /patients/:id/documents`

### `GET /documents/:id`

### `GET /documents/:id/pages/:pageNumber`

### `POST /documents/:id/reprocess`

### `GET /documents/:id/extraction-candidates`

### `POST /documents/:id/extraction-candidates/:candidateId/accept`

### `POST /documents/:id/extraction-candidates/:candidateId/reject`

---

## 10.6 Imports

### `POST /patients/:id/imports`

Multipart upload of XML, JSON, or ZIP.

Response:

```json
{
  "importRunId": "imp_1",
  "status": "UPLOADED",
  "importFormat": "UNKNOWN"
}
```

### `GET /patients/:id/imports`

### `GET /imports/:id`

### `GET /imports/:id/records`

### `GET /imports/:id/conflicts`

### `POST /imports/:id/conflicts/:conflictId/resolve`

```json
{
  "resolution": "MERGE_WITH_EXISTING",
  "targetEntityType": "MEDICATION",
  "targetEntityId": "med_1"
}
```

### `GET /imports/:id/artifacts/:artifactId`

### `POST /imports/:id/reprocess`

---

## 10.7 Search

### `GET /patients/:id/search?q=keppra`

Response:

```json
{
  "results": [
    {
      "type": "DOCUMENT_PAGE",
      "title": "Neurology note",
      "snippet": "...Keppra was discontinued due to irritability...",
      "date": "2024-02-10",
      "source": {
        "documentId": "doc_7",
        "page": 3
      }
    }
  ]
}
```

---

## 10.8 Summaries

### `POST /patients/:id/summaries`

```json
{
  "summaryType": "NEUROLOGY",
  "dateRange": {
    "from": "2024-01-01",
    "to": "2025-01-01"
  }
}
```

### `GET /patients/:id/summaries/:summaryId`

### `POST /patients/:id/exports/binder`

---

## 10.9 Emergency and sharing

### `POST /patients/:id/share-links`

```json
{
  "scope": "EMERGENCY",
  "expiresAt": "2026-03-15T12:00:00Z",
  "maxViews": 20
}
```

### `GET /emergency/:token`

### `DELETE /share-links/:id`

---

## 10.10 Ask the record

### `POST /patients/:id/query`

```json
{
  "question": "What medications have been tried for seizures?"
}
```

Response:

```json
{
  "answer": "Three anti-seizure medications are documented as trialed.",
  "sources": [
    {
      "type": "DOCUMENT_PAGE",
      "label": "Neurology note - 2024-01-12",
      "documentId": "doc_12",
      "page": 4
    },
    {
      "type": "MEDICATION",
      "label": "Levetiracetam",
      "entityId": "med_3"
    }
  ],
  "groundingStatus": "GROUNDED"
}
```

---

## 11. Frontend page spec

The coding agent should implement these pages.

### `/login`

* email/password form
* session redirect

### `/app/patients`

* list of patients
* patient switcher
* create patient CTA

### `/app/patients/:patientId/overview`

* demographics card
* diagnoses
* allergies
* active meds
* upcoming appointments
* recent timeline activity

### `/app/patients/:patientId/timeline`

* filter bar
* scrollable timeline
* event details drawer

### `/app/patients/:patientId/documents`

* upload zone
* document table
* status chips
* search box

### `/app/patients/:patientId/documents/:documentId`

* viewer
* metadata panel
* OCR text panel
* extraction review panel

### `/app/patients/:patientId/imports`

* import upload zone
* import run list
* status view

### `/app/patients/:patientId/imports/:importRunId`

* artifact list
* parsed records
* narrative sections
* conflict resolution UI

### `/app/patients/:patientId/medications`

* active/past grouping
* add/edit modal

### `/app/patients/:patientId/labs`

* sortable table
* abnormal filter

### `/app/patients/:patientId/providers`

### `/app/patients/:patientId/visits`

### `/app/patients/:patientId/procedures`

### `/app/patients/:patientId/symptoms`

### `/app/patients/:patientId/appointments`

### `/app/patients/:patientId/tasks`

### `/app/patients/:patientId/summaries`

* summary type selector
* preview
* export action

### `/app/patients/:patientId/query`

* input
* answer
* citations
* previous queries

### `/emergency/:token`

* extremely simple
* mobile-first
* only emergency data

---

## 12. Worker jobs spec

The worker must support these jobs.

### `OCR_DOCUMENT`

Input:

* `documentId`

Does:

* detect embedded text
* OCR if needed
* store per-page text
* set status

### `PARSE_DOCUMENT`

Input:

* `documentId`

Does:

* detect likely diagnoses/meds/providers/labs/procedures
* create extraction candidates

### `INDEX_DOCUMENT`

Input:

* `documentId`

Does:

* write page text into FTS tables

### `UNPACK_IMPORT_PACKAGE`

Input:

* `importRunId`

Does:

* unpack ZIP
* register artifacts

### `PARSE_IMPORT`

Input:

* `importRunId`

Does:

* detect adapter
* parse XML/JSON/ZIP
* create normalized import records
* extract narrative text

### `NORMALIZE_IMPORT_RECORDS`

Input:

* `importRunId`

Does:

* match against existing entities
* create conflicts
* prepare merge suggestions

### `GENERATE_TIMELINE_EVENTS`

Input:

* `patientId`

Does:

* rebuild or append projected timeline

### `GENERATE_SUMMARY`

Input:

* `patientId`, `summaryType`

### `GENERATE_EXPORT`

Input:

* `patientId`, `exportType`

### `GENERATE_QR`

Input:

* `shareLinkId`

### `RUN_BACKUP`

Input:

* none or config-based

---

## 13. UI and UX rules

### 13.1 Timeline is primary

Do not bury the timeline.

### 13.2 Review state must be visible

For OCR/imported data, the UI should show whether facts are:

* imported
* suggested
* verified
* conflicted

### 13.3 Source access must be easy

From summaries, answers, timeline events, and structured records, users should be able to click into the source document or import artifact.

### 13.4 Stress-case UX

Emergency and pre-visit workflows should have minimal clicks.

### 13.5 Avoid visual clutter

This app will hold heavy information. Use clear grouping, strong section labels, and restrained styling.

---

## 14. Security implementation requirements

### 14.1 Auth

* Argon2id password hashing
* HTTP-only cookies
* secure cookies in prod
* CSRF protection
* session expiry

### 14.2 Authorization

Every patient endpoint must enforce:

* valid session or valid share token
* household membership
* patient-level permission if present
* emergency scope when applicable

### 14.3 File safety

* sanitize filenames
* generate internal storage keys
* do not trust client MIME alone
* validate upload size
* block executable uploads

### 14.4 Audit logs

Log:

* login
* logout
* document upload
* import upload
* extraction acceptance/rejection
* conflict resolution
* export generation
* share-link creation/revocation
* emergency access
* destructive edits

### 14.5 Disk protection

Assume deployment uses encrypted disk/volume.
The app should still:

* restrict file permissions
* keep secrets out of repo
* avoid logging PHI casually

---

## 15. Testing requirements

The agent must write tests as it goes.

### 15.1 Unit tests

Required for:

* timeline projection logic
* medication chronology logic
* import matching
* conflict generation
* permission checks
* summary composition
* citation formatting

### 15.2 Integration tests

Required for:

* login/session flow
* patient creation
* document upload
* OCR pipeline trigger
* import upload and parse
* conflict resolution
* share-link flow
* export generation

### 15.3 E2E tests

Required for:

* create household
* create patient
* add medication
* upload PDF
* upload image needing OCR
* upload XML or ZIP import
* search for imported text
* generate summary
* open emergency card
* ask the record

### 15.4 AI eval tests

Create a small fixed dataset and verify:

* answers cite sources
* unsupported claims are rejected
* summaries do not invent data
* imported prompt-like text does not hijack response behavior

---

## 16. Seed data and fixtures

The coding agent should create fixtures for development and testing.

### Required fixtures

* demo household
* owner user
* second caregiver
* one patient with basic structured history
* one digital PDF
* one scanned image/PDF
* one sample XML import
* one sample ZIP import containing XML + PDFs
* one share link
* one generated summary

### Why

This makes development faster and prevents the agent from building blindly.

---

## 17. Definition of done by module

### Auth module is done when:

* login/logout/session works
* role checks work
* protected routes work

### Patient module is done when:

* patient CRUD works
* switching patients works
* permissions are enforced

### Timeline module is done when:

* events project correctly
* filters work
* linked records open from events

### Document module is done when:

* uploads persist
* files render
* OCR text is stored
* extraction review works

### Import module is done when:

* XML/JSON/ZIP accepted
* parser runs
* conflicts show
* accepted records merge into chart

### Search module is done when:

* OCR text searchable
* imported narrative searchable
* results link to evidence

### Summary module is done when:

* general and specialist summaries render
* export files generate
* outputs are clinically readable

### Emergency module is done when:

* emergency link works unauthenticated
* access scope is minimal
* token expiry/revoke works

### Query module is done when:

* answers are grounded
* sources are clickable
* hallucination is minimized by design

---

## 18. Manual QA script

A human tester should be able to run this script end to end.

### QA flow

1. log in as household owner
2. create patient
3. add provider, condition, medication, visit
4. confirm those appear in timeline
5. upload a digital PDF note
6. confirm text is viewable/searchable
7. upload a scanned note or image
8. confirm OCR text is created
9. review and accept one extracted medication or diagnosis
10. upload an XML export
11. confirm parsed records are visible
12. resolve one conflict
13. search for a term that exists only in imported narrative text
14. generate a neurology summary
15. generate a share link
16. open emergency page in a private browser
17. ask “What medications have been tried for seizures?”
18. verify answer contains citations

If any step fails, the build is not production-ready.

---

## 19. Suggested implementation order inside each phase

For each phase, the agent should work in this order:

1. DB schema / migration
2. shared Zod schemas and DTOs
3. backend repositories and services
4. backend routes
5. frontend API client hooks
6. frontend pages/components
7. automated tests
8. seed/demo data updates
9. manual QA notes

This order reduces rework.

---

## 20. Prompt template for Claude Code / Cursor

Use this when assigning work.

### Prompt template

```text
You are implementing Build the Binder.

Follow these rules:
- Do not change the stack.
- Use React + TypeScript + Tailwind for web.
- Use Node + TypeScript + Fastify for API.
- Use SQLite on local disk.
- Preserve provenance and original source artifacts.
- Do not add cloud storage or external databases.
- Keep the implementation inside the existing repo structure.
- Write tests for the new functionality.
- Update shared types/schemas when needed.
- Keep changes scoped to the requested phase/task.

Task:
[PASTE ONE PHASE OR ONE SUBTASK HERE]

Deliver:
1. code changes
2. migrations
3. tests
4. brief implementation notes
5. manual QA steps
```

---

## 21. Prompt template for reviewing agent output

```text
Review this implementation against the Build the Binder Engineering Blueprint.

Check for:
- scope creep
- stack violations
- missing provenance fields
- missing audit logging
- missing tests
- security issues
- incorrect patient/household authorization
- silent data merges on imports
- unsupported AI behavior

Return:
1. blocking issues
2. non-blocking issues
3. suggested fixes
4. whether the task meets definition of done
```

---

## 22. Recommended ticket breakdown

These are good coding-agent-sized tasks.

### Foundation

* T01 monorepo setup
* T02 API bootstrap
* T03 web bootstrap
* T04 shared package
* T05 auth/session setup
* T06 database migration framework

### Core app

* T07 household CRUD
* T08 patient CRUD
* T09 patient switcher
* T10 provider CRUD
* T11 condition CRUD
* T12 medication CRUD
* T13 visit CRUD
* T14 procedure CRUD
* T15 lab CRUD
* T16 symptoms/tasks/appointments

### Timeline

* T17 timeline schema
* T18 timeline projector
* T19 timeline API
* T20 timeline UI and filters

### Documents

* T21 document upload backend
* T22 document viewer frontend
* T23 OCR job
* T24 extraction candidate generation
* T25 extraction review UI

### Imports

* T26 import upload backend
* T27 ZIP unpacker
* T28 XML adapter
* T29 JSON/FHIR adapter
* T30 import record matcher
* T31 conflict resolution UI

### Search

* T32 FTS schema and indexing
* T33 search API
* T34 search UI

### Summaries / exports

* T35 general summary generator
* T36 specialist summary generator
* T37 PDF export pipeline
* T38 binder export

### Emergency

* T39 share-link model and token flow
* T40 emergency page
* T41 QR generation

### AI

* T42 query retrieval pipeline
* T43 answer/citation formatter
* T44 query UI
* T45 saved queries

---

## 23. Biggest implementation traps to avoid

### Trap 1

Building uploads without provenance.
That breaks trust later.

### Trap 2

Auto-merging imported XML records aggressively.
That risks corrupting the chart.

### Trap 3

Using the timeline as the source of truth.
It should remain a projection.

### Trap 4

Putting absolute disk paths into client-visible objects.
Use file IDs and storage services.

### Trap 5

Implementing AI before search and citations exist.
That produces impressive but unsafe output.

### Trap 6

Skipping sample XML/ZIP fixtures.
Then imports never become real.

### Trap 7

Designing for hypothetical enterprise complexity.
This version is intentionally simple operationally.

---

## 24. Final execution rule

The agent should always prefer:

* simple over clever
* traceable over magical
* reviewable over fully automatic
* grounded over generative
* local-disk-compatible over cloud-coupled

This app is handling sensitive, stressful, clinically important information.
Reliability and clarity matter more than novelty.

---

## 25. One-sentence summary of the build strategy

**First build a strong manual medical record, then add document ingestion, then OCR, then portal-import parsing, then search, then summaries/emergency, then grounded AI.**

---

