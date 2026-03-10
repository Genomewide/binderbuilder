Below is the full design document inline, updated to explicitly support both **OCR for scanned/image-based records** and **XML/portal-export ingestion** from downloaded hospital portal data.

---

# Build the Binder

## Full Design Document

**Version:** v1.1
**Target stack:** React + TypeScript + Tailwind frontend, Node.js + TypeScript backend
**Persistence for this version:** SQLite database file on server hard drive + documents/import artifacts stored on server hard drive

---

## 1. Executive Summary

Build the Binder is a web application that replaces the physical medical binder used by parents of children with complex medical conditions such as rare genetic disorders, severe epilepsy, or pediatric cancer.

The product acts as a **living, queryable, evidence-backed medical record** centered on one child but capable of supporting multiple children in the same household. It combines structured data, uploaded medical documents, OCR, portal-export ingestion, timeline views, physician summaries, emergency access, and AI-assisted retrieval.

The core product idea is:

**A digital medical binder whose primary interface is a medical timeline, whose raw material is documents and imported records, and whose value is rapid retrieval, sharing, and comprehension.**

For this version, the app will be intentionally simple operationally:

* one React web app
* one Node API server
* one worker process
* one SQLite DB file stored on disk
* uploaded documents stored on disk
* imported XML/JSON portal files stored on disk
* generated exports stored on disk

This version should be architected so it can later migrate to cloud storage and a managed database without rewriting the product model.

---

## 2. Product Vision

### 2.1 Problem

Families managing medically complex children often rely on fragmented information:

* PDFs from multiple hospital portals
* scanned paper notes
* medication histories reconstructed from memory
* specialist visit summaries spread across systems
* emergency information scattered across texts, printouts, and notes
* school and caregiver instructions maintained separately

That creates stress, delays, missed context, repeated storytelling, and avoidable errors.

### 2.2 Vision

The system should become the family’s **single source of truth** and the fastest way for both caregivers and clinicians to answer:

* What happened?
* When did it happen?
* What changed?
* What has already been tried?
* Which source proves it?

### 2.3 Core Outcomes

The app should make it easier to:

* understand a child’s medical history quickly
* search and retrieve any record
* prepare for specialist visits
* generate clean physician-ready summaries
* share only the right information in emergencies
* coordinate care among multiple caregivers
* preserve provenance and evidence for every important fact

---

## 3. Product Principles

1. **Timeline first.**
   The app should feel like a chronological medical story, not a file cabinet.

2. **Structured and unstructured together.**
   The app must support both raw documents and normalized data.

3. **Evidence over confidence.**
   AI outputs must cite source material and distinguish verified facts from suggestions.

4. **Review before trust.**
   OCR and parsers can suggest facts, but medical data that changes the record should be reviewable.

5. **Fast in stressful moments.**
   Emergency mode, medication lists, and summaries must be accessible in seconds.

6. **Low-ops v1.**
   A single server, SQLite, and local disk are acceptable for v1.

7. **Future migration without product rewrite.**
   Storage choices should be implementation details behind clean services.

---

## 4. Goals and Non-Goals

## 4.1 Goals for v1

The first version should deliver:

* household and caregiver accounts
* multiple child profiles
* document upload and document management
* OCR for scanned/image-based records
* import of downloaded portal data files, including XML where available
* structured records for diagnoses, meds, labs, procedures, visits, symptoms, providers
* unified medical timeline
* timeline filters and AI-generated custom timeline views
* full-text search across records
* physician-facing summaries
* emergency card, QR code, and time-limited share links
* tasks and appointment tracking
* grounded AI question answering with citations
* audit logging
* PDF export

## 4.2 Explicit Non-Goals for v1

This version does **not** need to include:

* full native mobile apps
* direct write-back into hospital EHRs
* live bidirectional FHIR sync
* multi-region infrastructure
* full SaaS tenant self-service for large organizations
* treatment recommendation engine
* automated diagnosis generation
* unsupervised medical fact acceptance from AI

---

## 5. Primary Users and Roles

## 5.1 User Types

### Household Owner

Usually a parent or legal guardian.

Permissions:

* full read/write access
* manage household
* invite caregivers
* manage patient records
* review imported/extracted facts
* generate summaries and exports
* create/revoke share links

### Caregiver Editor

Examples: second parent, grandparent, nanny, trusted family caregiver.

Permissions:

* read most patient information
* upload records
* log symptoms
* edit allowed record sections
* manage tasks and appointments
* generate summaries if allowed

### Caregiver Viewer

Examples: school nurse, therapist, respite caregiver.

Permissions:

* read assigned patient data
* view care instructions
* view emergency information
* no destructive edits

### Emergency-Only User

Examples: babysitter, temporary short-term caregiver.

Permissions:

* emergency card only
* seizure plan / emergency protocol only
* no full chart access

### Temporary Share-Link Viewer

Usually a doctor, ER provider, school, or external caregiver opening a secure link.

Permissions:

* only the data explicitly included in link scope
* no account required
* time-limited, auditable access

## 5.2 Tenancy Model

The system should use **Household** as the main tenancy boundary.

A household contains:

* users
* one or more patients
* household-level providers
* appointments
* tasks
* audit logs
* share permissions

A user may later belong to more than one household, but v1 can optimize for one primary household.

## 5.3 Role Model

Recommended roles in code:

* `OWNER`
* `EDITOR`
* `VIEWER`
* `EMERGENCY_ONLY`
* `SHARE_LINK_VIEWER`

Additionally, v1 should support **patient-level overrides**, so someone may view one child but not another.

---

## 6. Information Architecture and UX

## 6.1 Primary Navigation

Top-level sections:

* Dashboard
* Patients
* Timeline
* Documents
* Medications
* Labs
* Procedures
* Symptoms
* Providers
* Appointments
* Tasks
* Summaries
* Ask the Record
* Emergency
* Settings

## 6.2 Patient-Centric Workspace

After a patient is selected, the UI should become a patient workspace with:

* left sidebar: patient switcher + main sections
* main panel: selected feature area
* right drawer/modal: source details, linked entities, citations, document references

## 6.3 Key UX Principle

The app should support two working modes:

### Narrative mode

“I need to understand the child’s story.”

Best UI:

* timeline
* linked events
* summaries
* visit views

### Retrieval mode

“I need one answer or one record now.”

Best UI:

* search
* medication history
* ask-the-record
* emergency card
* document viewer

---

## 7. Functional Requirements

## 7.1 Patient Profile System

### Child Profile

Each patient profile includes:

* name
* preferred display name
* date of birth
* sex
* photo
* primary diagnoses
* allergies
* emergency notes
* implanted devices summary
* emergency contacts

Purpose:
Provide immediate clinical context and identity.

### Family Profiles

The system must support:

* multiple children in one household
* switching between children
* shared caregiver access
* household-level provider directory

### Caregiver Accounts

The app must support:

* invitations
* role assignment
* account activation
* revocation
* patient-scoped visibility

---

## 7.2 Medical Timeline

The timeline is the **primary interface**.

### Master Timeline

The app should present one chronological story of the child’s medical history, including:

* diagnoses
* procedures
* hospitalizations
* medication starts/stops/changes
* lab milestones
* imaging
* symptom onset
* clinic visits
* imported portal events
* custom caregiver-authored events

### Event Linking

Each timeline event can link to:

* documents
* providers
* medications
* labs
* diagnoses
* visits
* tasks
* appointments

### Filters

Users can filter by:

* event type
* specialty
* provider
* medication
* condition
* date range
* verified/imported status
* search term

### AI-Generated Custom Timelines

Users can ask for timeline views such as:

* seizure-related events
* all failed anti-seizure medications
* GI symptom history
* pre/post surgery changes
* hospitalizations only

Important rule:
These are **generated views over existing data**, not permanent timeline records unless saved explicitly.

---

## 7.3 Document and Data Ingestion

This is one of the most important modules.

The system must support both **document upload** and **portal-download ingestion**.

### Accepted Input Types in v1

#### Manual upload

* PDF
* JPG / PNG / TIFF scans or photos
* text-based digital PDF
* scanned PDF

#### Portal-export / downloaded data upload

* XML files
* JSON files
* ZIP export bundles
* PDFs inside export bundles
* image files inside export bundles

### Ingestion Sources

Each uploaded artifact should be tagged by source:

* `MANUAL_UPLOAD`
* `SCANNED_UPLOAD`
* `PORTAL_EXPORT`
* `XML_IMPORT`
* `FHIR_IMPORT`
* `OTHER_IMPORT`

### OCR Support

The system must support OCR so users can upload:

* scanned clinic notes
* photographed printouts
* imaging reports as scans
* faxed documents
* paper binder pages

OCR requirements:

* detect whether PDF already has machine-readable text
* extract text directly first for digital PDFs
* use OCR only when needed
* preserve per-page text and page numbers
* store OCR confidence
* support manual retry
* allow search even before structured extraction review is complete

### XML / Portal Export Support

The system must explicitly support ingestion of downloaded portal data files.

For v1, the app should accept and store raw export files, then parse the formats it understands.

Target formats for v1 design:

* common clinical XML exports such as CCD/C-CDA style documents
* FHIR bundle exports in XML or JSON if present
* portal-specific XML where mapping is available
* ZIP packages containing XML plus PDFs or attachments

Important rule:
The app should always keep the original file exactly as uploaded, then create normalized records from it.

### Parsing Responsibilities

The ingestion pipeline should try to extract:

* patient identity details
* providers
* diagnoses
* allergies
* medications
* visits / encounters
* procedures
* labs
* narrative notes
* attached document references
* event dates

### Review Requirement

The app should not silently trust all extracted/imported facts.

Rules:

* OCR-derived facts affecting the record should require review
* XML/FHIR imported facts can enter as `IMPORTED`, but conflicts should still be surfaced
* ambiguous mappings should go to review
* extracted narrative text should be searchable immediately
* structured records should preserve provenance

### Document Linking

Parsed/imported data should automatically link to:

* timeline events
* providers
* medications
* diagnoses
* procedures
* visits

### Searchability

All documents and imported narrative text should be indexed for full-text search.

### UI for Ingestion

The UI should provide two clear entry points:

#### Upload Document

For PDFs and scans.

#### Import Portal Download

For XML/JSON/ZIP export files downloaded from patient portals.

This distinction helps users understand whether they are adding a single document or importing a structured export package.

---

## 7.4 Structured Medical Data System

The system should normalize data into canonical tables.

### Diagnoses

Each condition should support:

* name
* status
* diagnosis date
* diagnosing provider
* notes
* related documents
* provenance
* verification state

### Medications

Each medication record should support:

* medication name
* generic name
* dose
* route
* frequency
* start date
* stop date
* status
* prescribing provider
* reason started
* reason stopped
* source artifact
* provenance

Medication history should be explicitly chronological and easy to read.

### Labs

Each lab result should support:

* panel
* test name
* value
* unit
* reference range
* abnormal flag
* collection date
* reported date
* ordering provider
* source document/import

### Procedures

Each procedure should support:

* procedure name
* category
* performed date
* facility
* provider
* outcome summary
* source artifact

### Visits

Each visit should support:

* provider
* specialty
* facility
* visit type
* visit date
* reason for visit
* summary
* linked documents

### Symptom Logs

Caregivers should be able to record:

* symptom type
* timestamp
* severity
* duration
* possible trigger
* notes
* source = manual/imported/derived

---

## 7.5 Care Team Management

### Provider Directory

Track all doctors and providers:

* name
* specialty
* organization
* phone
* fax
* email
* address
* notes

### Visit History by Provider

Users should be able to open a provider and view:

* visits
* linked documents
* prescribed meds
* procedures ordered
* associated conditions

### Care Team Map

The app should include a derived graph view showing relationships among:

* conditions
* providers
* medications
* procedures

For v1 this can be read-only and generated from existing data.

---

## 7.6 LLM Medical Query Interface

### Ask the Medical Record

Parents and doctors should be able to ask questions such as:

* What medications have been tried for seizures?
* What changed since the last visit?
* Which doctors ordered MRIs?
* When did symptoms begin?
* Which labs were abnormal recently?

### Evidence-Based Responses

Every answer must include sources.

Sources may point to:

* document pages
* visits
* medication records
* labs
* procedures
* imported XML/FHIR records

### Physician Question Flow

During visits, the doctor should be able to use the app to quickly answer targeted history questions.

### Guardrails

The system is not a diagnosis engine and must not present unsupported claims as medical advice.

### AI Insights

The app may surface patterns such as:

* seizure frequency increased after med change
* symptoms worsened after procedure
* sleep disruption preceded events

These must be labeled as suggestions, not conclusions.

---

## 7.7 Physician Summaries

### General One-Page Summary

Include:

* demographics
* diagnoses
* allergies
* active medications
* major procedures
* care team
* recent changes

### Specialist Summaries

Examples:

* neurology
* GI
* oncology
* pulmonology
* school/daycare
* emergency

### Pre-Visit Briefing

A pre-visit briefing should include:

* reason for visit
* recent changes
* top timeline highlights
* active concerns
* open questions for clinician

### Summary Rules

Summaries should prefer:

1. verified structured data
2. imported structured data
3. accepted extraction candidates
4. cited narrative support

They should never invent missing details.

---

## 7.8 Emergency Mode

### Emergency Card

Immediate access to:

* patient name and DOB
* photo if desired
* diagnoses
* allergies
* active medications
* implanted devices
* emergency protocol
* caregiver contacts
* primary specialists

### Emergency Share Link

Requirements:

* secure token
* time-limited
* revocable
* auditable

### QR Code

QR code should contain only a secure URL, not raw PHI.

### Emergency UX

Emergency views should:

* require no login
* load quickly on phones
* show only critical information
* hide the full chart by default

---

## 7.9 Care Coordination

### Appointments

Track:

* upcoming visits
* past visits
* reason for visit
* provider
* follow-up needs

### Tasks

Track tasks like:

* refill medication
* schedule MRI
* call insurance
* upload records
* send school plan

Tasks should be assignable to caregivers and optionally linked to visits or timeline events.

### Collaboration

Multiple caregivers should be able to coordinate without needing duplicate communication outside the app.

---

## 7.10 Symptom Journal

Daily logs may include:

* seizures
* pain
* GI issues
* behavior
* sleep
* nutrition
* mood
* notes

AI or rule-based analytics may later identify patterns, but raw logs must remain visible and editable.

---

## 7.11 School and Caregiver Plans

The system should generate simplified plans for:

* school nurse
* teacher
* daycare
* babysitter
* respite provider

Examples:

* seizure response plan
* medication schedule
* feeding instructions
* emergency contact sheet

These are **derived documents** from the record, not primary source truth.

---

## 7.12 Hospital Data Integration

### v1 Scope

This version should support **file-based portal imports**, not live hospital account connections.

That means users can download data from hospital portals and upload:

* PDF records
* XML files
* JSON exports
* ZIP packages

### Future Scope

Live integration may later support:

* FHIR APIs
* EHR APIs
* portal OAuth connections

But v1 should not depend on them.

---

## 7.13 Data Visualization

The app should support:

* interactive timeline
* medication chronology
* lab trends over time
* care network graph

The timeline is the highest priority visualization.

---

## 7.14 Export and Sharing

The app should support:

* physician PDF export
* one-page summary export
* full binder export
* JSON export
* future FHIR export

A full binder export may include appended documents and should be generated as a background job.

---

## 8. Technical Architecture

## 8.1 Frontend Stack

Recommended frontend stack:

* React
* TypeScript
* Vite
* Tailwind CSS
* React Router
* TanStack Query
* React Hook Form
* Zod
* PDF.js for in-browser document viewing

### Frontend Design Notes

* feature-based module structure
* URL-driven filters for timeline/search
* minimal local storage
* avoid caching PHI in browser storage where unnecessary

## 8.2 Backend Stack

Recommended backend stack:

* Node.js
* TypeScript
* Fastify
* Zod for validation
* Drizzle ORM
* better-sqlite3
* secure cookie sessions

Fastify is recommended because it gives good performance and a clean typed API model, while still being a normal Node server.

## 8.3 Persistence

For v1:

* SQLite DB file on server hard drive
* file storage on server hard drive
* FTS5 for full-text search
* generated exports on disk
* QR codes on disk if cached

## 8.4 Worker

A separate worker process should handle heavy jobs:

* OCR
* XML parsing
* ZIP package unpacking
* indexing
* summary generation
* export generation
* backups

The API server should stay responsive while the worker handles long-running work.

---

## 9. Recommended Repository Structure

```text
/apps
  /web      React + TS + Tailwind
  /api      Node + Fastify + TS
  /worker   background worker
/packages
  /shared   shared schemas, DTOs, utilities
  /ui       reusable components
  /config   linting, tsconfig, env helpers
/data
  /db
    app.sqlite
  /documents
  /imports
  /derived
  /exports
  /qr
  /backups
```

---

## 10. High-Level System Flow

```text
Browser (React)
   |
   v
Node API (Fastify)
   |---- SQLite DB
   |---- Local File Storage
   |
   v
Worker Process
   |---- OCR pipeline
   |---- XML/JSON/ZIP import pipeline
   |---- Search indexing
   |---- Summary/export generation
```

Key rule:
The frontend should only work with resource IDs and URLs served by the API. It should never know about real disk paths.

---

## 11. Data Model

Below is the recommended logical schema. Exact SQL may vary, but these entities should exist.

## 11.1 Auth and Tenancy

### `users`

Fields:

* id
* email
* password_hash
* display_name
* is_active
* last_login_at
* created_at
* updated_at

### `sessions`

Fields:

* id
* user_id
* expires_at
* ip_address
* user_agent
* revoked_at
* created_at

### `households`

Fields:

* id
* name
* slug
* created_by_user_id
* created_at
* updated_at

### `household_members`

Fields:

* id
* household_id
* user_id
* role
* status
* created_at
* updated_at

### `patient_permissions`

Fields:

* id
* patient_id
* user_id
* access_level
* created_at

## 11.2 Patients

### `patients`

Fields:

* id
* household_id
* first_name
* last_name
* display_name
* date_of_birth
* sex
* photo_document_id
* primary_diagnosis_summary
* allergy_summary
* emergency_notes
* created_at
* updated_at

### `emergency_contacts`

Fields:

* id
* patient_id
* name
* relationship
* phone
* email
* priority

## 11.3 Clinical Data

### `providers`

Fields:

* id
* household_id
* name
* specialty
* organization
* phone
* fax
* email
* address
* notes

### `conditions`

Fields:

* id
* patient_id
* name
* code
* status
* diagnosis_date
* diagnosing_provider_id
* notes
* source_kind
* source_id
* verification_status
* created_at
* updated_at

### `medications`

Fields:

* id
* patient_id
* name
* generic_name
* dose
* route
* frequency
* start_date
* stop_date
* status
* prescribing_provider_id
* reason_started
* reason_stopped
* source_kind
* source_id
* verification_status
* created_at
* updated_at

### `lab_results`

Fields:

* id
* patient_id
* panel_name
* test_name
* value_text
* value_numeric
* unit
* reference_range
* flag
* collected_at
* reported_at
* ordering_provider_id
* source_kind
* source_id
* verification_status

### `procedures`

Fields:

* id
* patient_id
* name
* category
* performed_at
* provider_id
* facility
* outcome_summary
* source_kind
* source_id
* verification_status

### `visits`

Fields:

* id
* patient_id
* provider_id
* visit_type
* specialty
* facility
* visit_at
* reason_for_visit
* summary
* source_kind
* source_id
* verification_status

### `symptom_logs`

Fields:

* id
* patient_id
* logged_at
* symptom_type
* severity
* duration_minutes
* notes
* possible_trigger
* created_by_user_id
* source

### `appointments`

Fields:

* id
* patient_id
* provider_id
* title
* starts_at
* ends_at
* location
* status
* notes

### `tasks`

Fields:

* id
* patient_id
* assigned_to_user_id
* title
* description
* due_at
* status
* priority
* linked_entity_type
* linked_entity_id

## 11.4 Documents

### `documents`

Represents single uploaded artifacts like PDFs/images.

Fields:

* id
* patient_id
* household_id
* source_type
* original_filename
* mime_type
* document_type
* file_storage_key
* file_size_bytes
* sha256
* uploaded_by_user_id
* document_date
* provider_id
* status
* ocr_status
* parse_status
* created_at
* updated_at

### `document_pages`

Fields:

* id
* document_id
* page_number
* extracted_text
* ocr_confidence
* image_storage_key

### `document_tags`

Fields:

* id
* document_id
* tag

### `extraction_candidates`

Fields:

* id
* document_id
* patient_id
* candidate_type
* payload_json
* confidence
* status
* reviewed_at
* reviewed_by_user_id
* created_at

## 11.5 Portal Import / XML Import Tables

This is the main addition for downloaded portal data.

### `import_runs`

Represents a user upload of a structured export package or file.

Fields:

* id
* household_id
* patient_id
* source_type
* import_format
* original_filename
* mime_type
* file_storage_key
* sha256
* status
* uploaded_by_user_id
* started_at
* completed_at
* created_at

Examples for `import_format`:

* `CCD_XML`
* `CCDA_XML`
* `FHIR_BUNDLE_JSON`
* `FHIR_BUNDLE_XML`
* `PORTAL_XML_UNKNOWN`
* `ZIP_PACKAGE`

### `import_artifacts`

Represents unpacked artifacts inside an import package.

Fields:

* id
* import_run_id
* artifact_type
* filename
* mime_type
* storage_key
* parent_artifact_id
* created_at

This allows ZIP imports to contain multiple PDFs, XML files, and images.

### `import_records`

Represents normalized records discovered during parsing before final persistence.

Fields:

* id
* import_run_id
* record_type
* external_id
* payload_json
* source_date
* confidence
* status
* matched_entity_type
* matched_entity_id
* created_at

### `import_conflicts`

Represents ambiguity or mismatch that requires human review.

Fields:

* id
* import_run_id
* conflict_type
* summary
* existing_entity_type
* existing_entity_id
* incoming_payload_json
* resolution_status
* resolved_by_user_id
* resolved_at

This lets the app say things like:

* “This medication appears to match an existing medication but the stop date differs.”
* “This portal export references a provider not yet in the directory.”
* “Patient DOB in XML does not match selected child.”

## 11.6 Timeline

### `timeline_events`

Fields:

* id
* patient_id
* household_id
* event_type
* event_date
* date_precision
* title
* summary
* specialty
* status
* importance_score
* source_kind
* source_id
* verified_status
* created_at
* updated_at

### `timeline_event_links`

Fields:

* id
* timeline_event_id
* linked_type
* linked_id

## 11.7 AI, Sharing, Audit, and Jobs

### `saved_queries`

Fields:

* id
* patient_id
* created_by_user_id
* question
* answer_markdown
* citations_json
* created_at

### `insights`

Fields:

* id
* patient_id
* insight_type
* title
* summary
* evidence_json
* status
* created_at

### `summary_exports`

Fields:

* id
* patient_id
* summary_type
* parameters_json
* storage_key
* created_by_user_id
* created_at

### `share_links`

Fields:

* id
* patient_id
* scope
* token_hash
* expires_at
* revoked_at
* created_by_user_id
* max_views
* current_views

### `audit_logs`

Fields:

* id
* household_id
* patient_id
* actor_user_id
* actor_type
* action
* entity_type
* entity_id
* metadata_json
* ip_address
* created_at

### `jobs`

Fields:

* id
* job_type
* status
* payload_json
* attempt_count
* available_at
* locked_at
* last_error
* created_at
* updated_at

---

## 12. Provenance and Verification Model

Medical records in this system must always preserve where a fact came from.

Recommended fields across major tables:

* `source_kind`
* `source_id`
* `verification_status`

Recommended values:

### `source_kind`

* `MANUAL`
* `DOCUMENT`
* `IMPORT`
* `FHIR`
* `SYSTEM_DERIVED`

### `verification_status`

* `MANUAL`
* `AI_SUGGESTED`
* `IMPORTED`
* `VERIFIED`
* `CONFLICTED`

Key rule:
A physician or parent should be able to tell whether a medication entry was:

* typed manually
* extracted by OCR
* imported from XML/FHIR
* derived from an AI suggestion
* confirmed by a user

---

## 13. Storage Design on Server Hard Drive

## 13.1 Why SQLite + File Storage

This is appropriate for v1 because it gives:

* simple deployment
* transactional data
* strong relational modeling
* fast reads
* local backups
* built-in full-text search

## 13.2 Directory Layout

```text
/data
  /db
    app.sqlite
  /documents
    /{householdId}/{patientId}/{documentId}/original
    /{householdId}/{patientId}/{documentId}/pages
  /imports
    /{householdId}/{patientId}/{importRunId}/raw
    /{householdId}/{patientId}/{importRunId}/unpacked
  /derived
    /text
    /normalized
    /indexes
  /exports
    /{exportId}.pdf
  /qr
    /{shareLinkId}.png
  /backups
```

## 13.3 Storage Services

Code should hide disk details behind services such as:

* `DocumentStore`
* `ImportStore`
* `ExportStore`
* `SearchIndexService`
* `BackupService`

This keeps future migration feasible.

---

## 14. Search Architecture

## 14.1 Search Requirements

Search must support:

* full text over PDF/image OCR text
* full text over imported XML narrative sections
* full text over imported JSON narrative fields
* structured filtering over meds/labs/providers/conditions/visits
* timeline search
* patient-scoped queries
* source citations

## 14.2 Recommended Search Implementation

Use SQLite FTS5 for:

* document page text
* imported narrative text
* visit summaries
* timeline titles and summaries
* symptom notes

Recommended FTS virtual tables:

* `document_page_fts`
* `timeline_event_fts`
* `import_record_fts`

## 14.3 Search Result Shape

Each result should include:

* type
* title
* snippet
* date
* patient
* matched fields
* citation info
* one-click open action

---

## 15. Ingestion and Normalization Pipelines

This is the most important systems section.

## 15.1 Manual Document Upload Pipeline

Flow:

1. user uploads PDF/image
2. API stores original file
3. DB record created in `documents`
4. OCR/parse job enqueued
5. worker extracts text
6. per-page text saved
7. extraction candidates generated
8. document becomes searchable
9. review queue appears for structured facts
10. accepted items create/update canonical records and timeline events

## 15.2 OCR Pipeline

Recommended OCR strategy:

1. detect whether file already has embedded text
2. if yes, extract text directly
3. if no, rasterize pages if needed
4. run OCR page by page
5. store page text + confidence
6. attach page-level citations

The system should preserve page numbers because citations like “Neurology note, page 4” are clinically useful.

## 15.3 XML / Portal Import Pipeline

Flow:

1. user uploads XML/JSON/ZIP portal export
2. API stores raw artifact in `/imports`
3. `import_runs` record created
4. worker identifies format
5. if ZIP, worker unpacks and registers `import_artifacts`
6. parser extracts clinical sections
7. normalized candidate records written to `import_records`
8. matcher attempts to align with existing patient entities
9. conflicts written to `import_conflicts`
10. accepted/mapped facts become canonical records
11. timeline events generated
12. narrative text indexed for search
13. original import retained for audit and reprocessing

## 15.4 Parser Adapter Strategy

The import pipeline should use a pluggable adapter model.

Example adapters:

* `CcdaXmlAdapter`
* `FhirBundleJsonAdapter`
* `FhirBundleXmlAdapter`
* `PortalZipAdapter`
* `UnknownXmlAdapter`

Each adapter should output a normalized internal format like:

```ts
type NormalizedImportRecord = {
  recordType: "PATIENT" | "PROVIDER" | "CONDITION" | "MEDICATION" | "LAB" | "VISIT" | "PROCEDURE" | "DOCUMENT_REFERENCE";
  externalId?: string;
  occurredAt?: string;
  payload: Record<string, unknown>;
  confidence?: number;
  narrativeText?: string;
};
```

This allows the system to support multiple source formats while keeping one canonical data model.

## 15.5 Matching and Deduplication

When importing XML/JSON data, the system should try to match incoming records against existing records.

Matching signals may include:

* external IDs from import
* same medication name + same dates
* same procedure + same date
* same provider name + organization
* same lab name + same collected date
* same visit date + provider + facility

The matcher should never silently merge low-confidence matches.

## 15.6 Conflict Rules

Create a review item when:

* imported patient demographics do not match selected patient
* a medication overlaps but has different dose or dates
* provider looks similar but not certain
* imported diagnosis conflicts with an existing resolved state
* unknown lab units prevent normalization
* XML structure is partially parseable but ambiguous

## 15.7 Review Workflow

Review queue should support actions:

* accept as new
* merge with existing
* edit then accept
* reject
* defer

## 15.8 Data Safety Rule

The original uploaded file or portal export must always remain available, even if parsing fails.

---

## 16. Timeline Engine Design

## 16.1 Purpose

The timeline is a projection layer built from canonical records, documents, and selected import events. It is the main reading experience, not the only source of truth.

## 16.2 Sources for Timeline Events

Events may come from:

* manual records
* accepted OCR extraction
* imported XML/FHIR data
* visit records
* procedures
* medication changes
* symptom logs
* custom events

## 16.3 Event Requirements

Each event should have:

* date
* precision
* type
* concise title
* summary
* linked entities
* provenance
* verified status
* citations where possible

## 16.4 Hospitalization Modeling

Hospitalizations should be represented as:

* a top-level hospitalization event
* linked visit/procedure/lab/document sub-events

This gives both overview and detail.

---

## 17. Ask-the-Record and AI Layer

## 17.1 Purpose

Let users query the medical record in natural language without manually reconstructing history.

## 17.2 Query Retrieval Inputs

The retrieval system should pull from:

* canonical structured records
* timeline events
* document page excerpts
* imported XML narrative sections
* imported normalized records
* previously verified summaries

## 17.3 Grounding Rules

Every answer must:

* cite sources
* say when evidence is insufficient
* distinguish verified vs imported vs suggested facts
* include dates when relevant
* avoid unsupported interpolation

## 17.4 Prompt Safety

Uploaded documents and imported XML narrative content are untrusted inputs.

The system must:

* treat them as data, not instructions
* ignore any embedded prompt-like text
* never execute actions from record text
* only answer from retrieved evidence

## 17.5 Response Shape

Example:

```json
{
  "answer": "Three anti-seizure medications are documented as trialed and discontinued.",
  "sources": [
    {
      "type": "DOCUMENT_PAGE",
      "documentId": "doc_123",
      "page": 4,
      "label": "Neurology note - 2024-01-12"
    },
    {
      "type": "IMPORTED_MEDICATION",
      "sourceId": "imp_456",
      "label": "Portal export medication list"
    }
  ],
  "groundingStatus": "GROUNDED"
}
```

## 17.6 AI Insights

Insights should be labeled carefully, for example:

* Possible pattern
* Needs review
* Based on 4 sources

They should never be auto-promoted into the medical summary without user review.

---

## 18. Physician Summaries and Export System

## 18.1 Summary Types

The system should support:

* general one-page summary
* neurology summary
* GI summary
* oncology summary
* pulmonology summary
* school/daycare plan
* emergency card
* full binder export

## 18.2 Summary Composition

Preferred order of evidence:

1. verified structured facts
2. imported structured facts
3. accepted OCR extraction
4. cited document/import text

## 18.3 Export Pipeline

Recommended export method:

* render HTML server-side
* convert to PDF using Playwright/Chromium
* save file to disk
* create `summary_exports` record
* log in audit trail

## 18.4 Full Binder Export

Binder export may include:

* cover page
* table of contents
* demographics
* diagnoses
* allergies
* medication list
* provider directory
* timeline snapshot
* summary pages
* appended documents
* optionally appended import-source artifacts

Because this can be large, it should run asynchronously.

---

## 19. Emergency Access Design

## 19.1 Emergency Scope

Default emergency scope should include only:

* identity
* diagnoses
* allergies
* active meds
* devices
* emergency protocol
* caregiver contacts
* primary providers

## 19.2 Share Link Security

Requirements:

* random token
* only token hash stored in DB
* expiration required by default
* optional max view count
* revocable at any time
* access audit on every open

## 19.3 QR Code Behavior

The QR code should open:

`/emergency/:token`

It should never contain raw medical data.

---

## 20. API Design

The API should be RESTful and documented with OpenAPI.

## 20.1 Auth

* `POST /auth/login`
* `POST /auth/logout`
* `GET /auth/session`
* `POST /auth/invitations/accept`

## 20.2 Household

* `GET /households/current`
* `POST /households`
* `GET /households/:id/members`
* `POST /households/:id/members/invite`
* `PATCH /households/:id/members/:memberId`

## 20.3 Patients

* `GET /patients`
* `POST /patients`
* `GET /patients/:id`
* `PATCH /patients/:id`

## 20.4 Timeline

* `GET /patients/:id/timeline`
* `POST /patients/:id/timeline/custom-view`
* `POST /timeline-events`
* `PATCH /timeline-events/:id`

## 20.5 Documents

* `POST /patients/:id/documents`
* `GET /patients/:id/documents`
* `GET /documents/:id`
* `GET /documents/:id/pages/:pageNumber`
* `POST /documents/:id/reprocess`
* `GET /documents/:id/extraction-candidates`
* `POST /documents/:id/extraction-candidates/:candidateId/accept`
* `POST /documents/:id/extraction-candidates/:candidateId/reject`

## 20.6 Imports (new for portal XML support)

* `POST /patients/:id/imports`
* `GET /patients/:id/imports`
* `GET /imports/:id`
* `POST /imports/:id/reprocess`
* `GET /imports/:id/records`
* `GET /imports/:id/conflicts`
* `POST /imports/:id/conflicts/:conflictId/resolve`
* `GET /imports/:id/artifacts/:artifactId`

## 20.7 Clinical Data

* `GET /patients/:id/conditions`
* `POST /patients/:id/conditions`
* `GET /patients/:id/medications`
* `POST /patients/:id/medications`
* `GET /patients/:id/labs`
* `POST /patients/:id/labs`
* `GET /patients/:id/procedures`
* `POST /patients/:id/procedures`
* `GET /patients/:id/visits`
* `POST /patients/:id/visits`
* `GET /patients/:id/symptoms`
* `POST /patients/:id/symptoms`

## 20.8 Search and Query

* `GET /patients/:id/search?q=...`
* `POST /patients/:id/query`
* `GET /patients/:id/saved-queries`

## 20.9 Summaries and Exports

* `POST /patients/:id/summaries`
* `GET /patients/:id/summaries/:summaryId`
* `POST /patients/:id/exports/binder`
* `GET /exports/:id`

## 20.10 Coordination

* `GET /patients/:id/appointments`
* `POST /patients/:id/appointments`
* `GET /patients/:id/tasks`
* `POST /patients/:id/tasks`
* `PATCH /tasks/:id`

## 20.11 Emergency and Sharing

* `POST /patients/:id/share-links`
* `DELETE /share-links/:id`
* `GET /share-links/:token`
* `GET /emergency/:token`
* `GET /qr/:shareLinkId`

---

## 21. Frontend Architecture

## 21.1 Route Structure

```text
/login
/app
/app/patients
/app/patients/:patientId/overview
/app/patients/:patientId/timeline
/app/patients/:patientId/documents
/app/patients/:patientId/imports
/app/patients/:patientId/medications
/app/patients/:patientId/labs
/app/patients/:patientId/procedures
/app/patients/:patientId/symptoms
/app/patients/:patientId/providers
/app/patients/:patientId/appointments
/app/patients/:patientId/tasks
/app/patients/:patientId/summaries
/app/patients/:patientId/query
/emergency/:token
```

## 21.2 Frontend Modules

Recommended feature folders:

* auth
* households
* patients
* timeline
* documents
* imports
* medications
* labs
* procedures
* symptoms
* providers
* query
* summaries
* emergency
* tasks

## 21.3 Key Reusable Components

* patient switcher
* timeline filter bar
* timeline event card
* source citation chip
* document upload dropzone
* portal import dropzone
* PDF/image viewer
* import conflict review table
* extraction review panel
* summary template selector
* emergency card component

---

## 22. Backend Architecture

## 22.1 Module Boundaries

Recommended backend modules:

* auth
* households
* patients
* providers
* documents
* imports
* clinical-records
* timeline
* search
* ai
* summaries
* exports
* sharing
* coordination
* audit
* jobs

## 22.2 Service Layer Pattern

Each module should contain:

* routes
* validation schemas
* service layer
* repository layer
* DTO mappers

This supports maintainability and testing.

## 22.3 Worker Jobs

Recommended job types:

* `OCR_DOCUMENT`
* `PARSE_DOCUMENT`
* `INDEX_DOCUMENT`
* `PARSE_IMPORT`
* `UNPACK_IMPORT_PACKAGE`
* `NORMALIZE_IMPORT_RECORDS`
* `GENERATE_TIMELINE_EVENTS`
* `GENERATE_SUMMARY`
* `GENERATE_EXPORT`
* `GENERATE_INSIGHT`
* `GENERATE_QR`
* `RUN_BACKUP`

---

## 23. Security and Privacy Design

## 23.1 Authentication

Recommended for v1:

* email + password
* Argon2id password hashing
* secure HTTP-only cookies
* CSRF protection
* optional MFA later

## 23.2 Authorization

Every patient-scoped endpoint must verify:

* authenticated user or valid share token
* household membership
* patient permission if overridden
* emergency/share-link scope

## 23.3 At-Rest Protection

Because this version stores PHI on local server disk, the deployment should use:

* encrypted disk or encrypted volume
* encrypted backups
* secret management outside repo
* restricted file permissions

Optionally later:

* application-layer encryption for uploaded files
* SQLCipher or equivalent if accepted operationally

## 23.4 In-Transit Protection

* HTTPS only in production
* secure cookies
* HSTS
* token-safe emergency URLs

## 23.5 Audit Logging

Audit at minimum:

* login attempts
* patient record access by link
* emergency opens
* document uploads
* portal import uploads
* review decisions
* export generation
* link creation/revocation
* destructive edits

## 23.6 Important Compliance Note

The app can be designed for HIPAA-sensitive workloads, but true compliance depends on deployment, vendors, contracts, backups, logging, and operations, not just code.

---

## 24. Validation and Medical Data Safety

## 24.1 Provenance

Every important fact should retain provenance.

## 24.2 Verification States

Structured data should expose whether it is:

* manual
* suggested
* imported
* verified
* conflicted

## 24.3 Conflict Handling

If two sources disagree, the app should not silently overwrite history. It should preserve evidence and require a decision when needed.

## 24.4 Soft Deletes

Most entities should use soft delete to prevent accidental loss.

---

## 25. Performance Targets

For a typical v1 deployment:

* dashboard load under 1.5s p95
* timeline load under 2s p95 for common filters
* search under 500ms p95 for normal queries
* emergency page render under 1s server-side
* query answers under 10s for typical patient records
* OCR/import jobs should start quickly but run asynchronously

---

## 26. Testing Strategy

## 26.1 Unit Tests

Cover:

* timeline projection logic
* permission checks
* medication chronology
* import mapping
* conflict detection
* citation formatting

## 26.2 Integration Tests

Cover:

* document upload to OCR pipeline
* XML/ZIP import to normalization
* extraction acceptance flow
* conflict resolution flow
* share-link access
* export generation

## 26.3 E2E Tests

Use Playwright for:

* login
* patient creation
* PDF upload
* image OCR upload
* XML import
* timeline filtering
* query flow
* emergency link open
* summary export

## 26.4 AI Evaluation Tests

Create test sets for:

* citation correctness
* no-answer behavior when evidence is missing
* suppression of hallucinated facts
* prompt injection resistance from uploaded text and imported narrative content

## 26.5 Restore Drills

Because this is local-disk storage, backups must be tested with actual restore drills.

---

## 27. Delivery Plan

## 27.1 Phase 1: Foundation

Build:

* auth
* households
* patients
* caregiver roles
* providers
* conditions / meds / visits / procedures / labs / symptoms
* base timeline
* tasks and appointments
* audit logs

## 27.2 Phase 2: Documents and OCR

Build:

* document upload
* PDF/image viewer
* OCR pipeline
* extraction candidates
* document search
* timeline linking from accepted extraction

## 27.3 Phase 3: Portal Download Imports

Build:

* import upload UI
* XML/JSON/ZIP ingestion
* adapter framework
* normalized import records
* conflict resolution UI
* timeline generation from imported data
* indexing of imported narrative text

## 27.4 Phase 4: Summaries and Emergency

Build:

* one-page summary
* specialist summaries
* binder export
* emergency card
* share links
* QR code flow

## 27.5 Phase 5: Ask the Record and Insights

Build:

* grounded query interface
* citations
* saved queries
* AI-generated custom timeline views
* insight suggestions

---

## 28. Major Risks and Mitigations

## 28.1 OCR Accuracy Risk

Mitigation:

* preserve original doc
* page-level review
* confidence values
* review workflow before structured adoption

## 28.2 XML Variability Risk

Different portals may export different XML structures.

Mitigation:

* adapter architecture
* raw import preservation
* fallback unknown-format storage
* partial parsing allowed
* conflict/review UI

## 28.3 Data Merge Risk

Imported data may duplicate or conflict with manual data.

Mitigation:

* explicit provenance
* dedupe heuristics
* human review for low confidence

## 28.4 SQLite / Local Disk Growth Risk

Mitigation:

* indexed schema
* one-server scope
* abstraction layers
* future migration path

## 28.5 Share-Link Exposure Risk

Mitigation:

* short expiry
* minimal scope
* revocation
* audit trail

## 28.6 User Trust Risk from AI

Mitigation:

* citation-first design
* “no evidence found” behavior
* visible verification states
* summaries built from structured facts first

---

## 29. Final Recommended Product Decisions

For this version, the strongest design choices are:

1. **Use SQLite instead of ad hoc JSON files** even though everything remains on the server hard drive.
2. **Treat Household as the tenancy boundary.**
3. **Make Timeline the main UX.**
4. **Support both document uploads and portal-export imports from day one in the design.**
5. **Use OCR for scans/photos and parser adapters for XML/JSON/ZIP exports.**
6. **Preserve the original source artifact for every import or upload.**
7. **Require review for important medical fact changes unless they come from clearly structured import with no conflict.**
8. **Build grounded AI retrieval, not freeform medical generation.**
9. **Keep emergency access tokenized, scoped, and revocable.**
10. **Hide file storage behind services so local disk can later be replaced.**

---

## 30. Concise Build Spec

If a team were starting implementation immediately, the recommended first build order is:

### Backend first

* auth
* households/patients
* canonical clinical tables
* timeline projection
* document upload
* import upload
* jobs system
* OCR and XML adapter interfaces
* search index
* summary/export pipeline

### Frontend second

* login
* patient switcher
* timeline
* documents
* imports
* meds/labs/visits
* summary view
* emergency page
* ask-the-record UI

### AI last

* extraction suggestions
* grounded queries
* insight suggestions
* custom timeline generation

---

This version now explicitly includes both:

* **OCR for scanned or image-based medical records**
* **XML/JSON/ZIP ingestion for downloaded portal data**

I can also turn this into a build-ready engineering spec with database migrations, endpoint payloads, and the first sprint breakdown.
