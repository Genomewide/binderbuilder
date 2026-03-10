---

# Build the Binder

## Database Schema + API Contract Pack

**Version:** v1
**Audience:** Claude Code, Cursor, and engineers implementing the app
**Status:** Build-ready baseline

---

## 1. Purpose

This document defines:

* database conventions
* SQLite migration files
* canonical enums
* exact shared Zod contracts
* API request/response contracts
* implementation notes for Drizzle + Fastify + React

This document should be treated as the **source of truth for persistence and HTTP contracts** for v1.

---

## 2. Global conventions

## 2.1 Stack assumptions

* SQLite database file on server disk
* JSON1 enabled in SQLite
* FTS5 enabled in SQLite
* Fastify backend
* Drizzle ORM
* Zod shared contracts
* React frontend consuming typed DTOs from `packages/shared`

## 2.2 ID format

All IDs are app-generated `TEXT` IDs with prefixes.

Recommended format:

```text
<prefix>_<ulid>
```

Examples:

* `usr_01HV...`
* `pat_01HV...`
* `doc_01HV...`

Recommended prefixes:

* `usr` user
* `ses` session
* `hh` household
* `mem` household member
* `inv` invitation
* `pat` patient
* `emc` emergency contact
* `alg` allergy
* `dev` device
* `pro` provider
* `cond` condition
* `med` medication
* `lab` lab result
* `prc` procedure
* `vis` visit
* `sym` symptom log
* `appt` appointment
* `task` task
* `te` timeline event
* `tel` timeline event link
* `doc` document
* `dpg` document page
* `dtag` document tag
* `dlnk` document link
* `xcand` extraction candidate
* `imp` import run
* `impa` import artifact
* `impr` import record
* `imps` import narrative section
* `imc` import conflict
* `qry` saved query
* `insight` insight
* `exp` summary export
* `shl` share link
* `audit` audit log
* `job` job

## 2.3 Time and date storage

Use:

* `TEXT` in ISO timestamp format for timestamps
  Example: `2026-03-10T18:42:11.123Z`
* `TEXT` in `YYYY-MM-DD` for date-only fields

Rules:

* all timestamps stored in UTC
* date-only fields remain date-only
* never mix local timezone strings into DB rows

## 2.4 Soft deletes

Use `deleted_at TEXT NULL` on user-facing clinical entities and files where accidental removal is risky.

A row is considered active when `deleted_at IS NULL`.

## 2.5 Provenance

All major clinical tables must include:

* `source_kind`
* `source_id`
* `verification_status`

Allowed source kinds:

* `MANUAL`
* `DOCUMENT`
* `IMPORT`
* `FHIR`
* `SYSTEM_DERIVED`

Allowed verification statuses:

* `MANUAL`
* `AI_SUGGESTED`
* `IMPORTED`
* `VERIFIED`
* `CONFLICTED`

## 2.6 JSON columns in SQLite

SQLite stores JSON as `TEXT`.

Any JSON column should use:

```sql
CHECK (column_name IS NULL OR json_valid(column_name))
```

or, if required:

```sql
CHECK (json_valid(column_name))
```

## 2.7 Foreign keys

Enable foreign keys on every connection:

```sql
PRAGMA foreign_keys = ON;
```

Recommended runtime PRAGMAs:

```sql
PRAGMA journal_mode = WAL;
PRAGMA synchronous = NORMAL;
PRAGMA busy_timeout = 5000;
```

---

## 3. Canonical enums

These values should be duplicated exactly in:

* DB `CHECK` constraints
* Zod enums
* frontend UI logic
* backend service logic

```ts
// packages/shared/src/contracts/enums.ts
import { z } from "zod";

export const HouseholdRoleSchema = z.enum([
  "OWNER",
  "EDITOR",
  "VIEWER",
  "EMERGENCY_ONLY",
]);

export const MemberStatusSchema = z.enum([
  "INVITED",
  "ACTIVE",
  "REVOKED",
]);

export const PatientAccessLevelSchema = z.enum([
  "NO_ACCESS",
  "READ_ONLY",
  "EDIT",
  "EMERGENCY_ONLY",
]);

export const SexSchema = z.enum([
  "F",
  "M",
  "X",
  "UNKNOWN",
]);

export const SourceKindSchema = z.enum([
  "MANUAL",
  "DOCUMENT",
  "IMPORT",
  "FHIR",
  "SYSTEM_DERIVED",
]);

export const VerificationStatusSchema = z.enum([
  "MANUAL",
  "AI_SUGGESTED",
  "IMPORTED",
  "VERIFIED",
  "CONFLICTED",
]);

export const MedicationStatusSchema = z.enum([
  "ACTIVE",
  "PAST",
  "PLANNED",
  "UNKNOWN",
]);

export const AllergySeveritySchema = z.enum([
  "MILD",
  "MODERATE",
  "SEVERE",
  "UNKNOWN",
]);

export const DeviceStatusSchema = z.enum([
  "ACTIVE",
  "REMOVED",
  "UNKNOWN",
]);

export const TaskStatusSchema = z.enum([
  "TODO",
  "IN_PROGRESS",
  "DONE",
  "CANCELLED",
]);

export const TaskPrioritySchema = z.enum([
  "LOW",
  "MEDIUM",
  "HIGH",
  "URGENT",
]);

export const AppointmentStatusSchema = z.enum([
  "UPCOMING",
  "COMPLETED",
  "CANCELLED",
  "NO_SHOW",
]);

export const TimelineEventTypeSchema = z.enum([
  "DIAGNOSIS_ADDED",
  "MEDICATION_STARTED",
  "MEDICATION_STOPPED",
  "PROCEDURE",
  "LAB",
  "VISIT",
  "SYMPTOM",
  "APPOINTMENT",
  "HOSPITALIZATION",
  "IMPORTED_RECORD",
  "CUSTOM",
]);

export const DatePrecisionSchema = z.enum([
  "YEAR",
  "MONTH",
  "DAY",
  "TIMESTAMP",
]);

export const DocumentSourceTypeSchema = z.enum([
  "MANUAL_UPLOAD",
  "SCANNED_UPLOAD",
  "PORTAL_EXPORT",
  "XML_IMPORT",
  "FHIR_IMPORT",
  "OTHER_IMPORT",
]);

export const DocumentStatusSchema = z.enum([
  "UPLOADED",
  "PROCESSING",
  "READY",
  "FAILED",
  "DELETED",
]);

export const OcrStatusSchema = z.enum([
  "NOT_REQUIRED",
  "PENDING",
  "COMPLETE",
  "FAILED",
]);

export const ParseStatusSchema = z.enum([
  "PENDING",
  "COMPLETE",
  "FAILED",
]);

export const DocumentTextSourceSchema = z.enum([
  "EMBEDDED",
  "OCR",
  "MANUAL",
]);

export const ExtractionCandidateTypeSchema = z.enum([
  "CONDITION",
  "MEDICATION",
  "PROVIDER",
  "VISIT",
  "PROCEDURE",
  "LAB",
  "ALLERGY",
  "DEVICE",
]);

export const ExtractionCandidateStatusSchema = z.enum([
  "PENDING",
  "ACCEPTED",
  "REJECTED",
  "SUPERSEDED",
]);

export const ImportFormatSchema = z.enum([
  "CCD_XML",
  "CCDA_XML",
  "FHIR_BUNDLE_JSON",
  "FHIR_BUNDLE_XML",
  "PORTAL_XML_UNKNOWN",
  "JSON_UNKNOWN",
  "ZIP_PACKAGE",
]);

export const ImportStatusSchema = z.enum([
  "UPLOADED",
  "PROCESSING",
  "READY",
  "FAILED",
  "PARTIAL",
]);

export const ImportRecordTypeSchema = z.enum([
  "PATIENT",
  "PROVIDER",
  "CONDITION",
  "MEDICATION",
  "LAB",
  "VISIT",
  "PROCEDURE",
  "DOCUMENT_REFERENCE",
  "ALLERGY",
  "DEVICE",
]);

export const ImportRecordStatusSchema = z.enum([
  "PENDING",
  "ACCEPTED",
  "REJECTED",
  "MERGED",
  "CONFLICTED",
]);

export const ConflictResolutionStatusSchema = z.enum([
  "OPEN",
  "RESOLVED",
  "REJECTED",
]);

export const SummaryTypeSchema = z.enum([
  "GENERAL",
  "NEUROLOGY",
  "GI",
  "ONCOLOGY",
  "PULMONOLOGY",
  "SCHOOL",
  "EMERGENCY",
  "BINDER",
]);

export const ShareScopeSchema = z.enum([
  "EMERGENCY",
  "SUMMARY",
  "PATIENT_PACKET",
]);

export const ActorTypeSchema = z.enum([
  "USER",
  "SHARE_LINK",
  "SYSTEM",
]);

export const JobTypeSchema = z.enum([
  "OCR_DOCUMENT",
  "PARSE_DOCUMENT",
  "INDEX_DOCUMENT",
  "UNPACK_IMPORT_PACKAGE",
  "PARSE_IMPORT",
  "NORMALIZE_IMPORT_RECORDS",
  "GENERATE_TIMELINE_EVENTS",
  "GENERATE_SUMMARY",
  "GENERATE_EXPORT",
  "GENERATE_QR",
  "RUN_BACKUP",
]);

export const JobStatusSchema = z.enum([
  "QUEUED",
  "RUNNING",
  "SUCCEEDED",
  "FAILED",
  "CANCELLED",
]);

export const InsightStatusSchema = z.enum([
  "PENDING",
  "ACCEPTED",
  "DISMISSED",
]);

export const GroundingStatusSchema = z.enum([
  "GROUNDED",
  "PARTIAL",
  "INSUFFICIENT_EVIDENCE",
]);
```

---

## 4. Shared Zod contract pack

This is the code I would place under `packages/shared/src/contracts`.

## 4.1 Common primitives

```ts
// packages/shared/src/contracts/common.ts
import { z } from "zod";
import {
  ActorTypeSchema,
  AllergySeveritySchema,
  AppointmentStatusSchema,
  ConflictResolutionStatusSchema,
  DatePrecisionSchema,
  DeviceStatusSchema,
  DocumentSourceTypeSchema,
  DocumentStatusSchema,
  DocumentTextSourceSchema,
  ExtractionCandidateStatusSchema,
  ExtractionCandidateTypeSchema,
  GroundingStatusSchema,
  HouseholdRoleSchema,
  ImportFormatSchema,
  ImportRecordStatusSchema,
  ImportRecordTypeSchema,
  ImportStatusSchema,
  InsightStatusSchema,
  JobStatusSchema,
  JobTypeSchema,
  MemberStatusSchema,
  MedicationStatusSchema,
  OcrStatusSchema,
  ParseStatusSchema,
  PatientAccessLevelSchema,
  SexSchema,
  ShareScopeSchema,
  SourceKindSchema,
  SummaryTypeSchema,
  TaskPrioritySchema,
  TaskStatusSchema,
  TimelineEventTypeSchema,
  VerificationStatusSchema,
} from "./enums";

export const NonEmptyStringSchema = z.string().trim().min(1).max(1000);
export const OptionalTextSchema = z.string().trim().max(10000).nullable().optional();
export const DateOnlySchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
export const TimestampSchema = z.string().datetime({ offset: true });
export const EmailSchema = z.string().trim().email().max(320);
export const PhoneSchema = z.string().trim().max(50);

export const JsonValueSchema: z.ZodType<unknown> = z.lazy(() =>
  z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.null(),
    z.array(JsonValueSchema),
    z.record(z.string(), JsonValueSchema),
  ]),
);

export const JsonObjectSchema = z.record(z.string(), JsonValueSchema);

export const prefixedId = (prefix: string) =>
  z.string().regex(new RegExp(`^${prefix}_[A-Za-z0-9]{10,}$`), `${prefix} id expected`);

export const UserIdSchema = prefixedId("usr");
export const SessionIdSchema = prefixedId("ses");
export const HouseholdIdSchema = prefixedId("hh");
export const HouseholdMemberIdSchema = prefixedId("mem");
export const InvitationIdSchema = prefixedId("inv");
export const PatientIdSchema = prefixedId("pat");
export const EmergencyContactIdSchema = prefixedId("emc");
export const AllergyIdSchema = prefixedId("alg");
export const DeviceIdSchema = prefixedId("dev");
export const ProviderIdSchema = prefixedId("pro");
export const ConditionIdSchema = prefixedId("cond");
export const MedicationIdSchema = prefixedId("med");
export const LabResultIdSchema = prefixedId("lab");
export const ProcedureIdSchema = prefixedId("prc");
export const VisitIdSchema = prefixedId("vis");
export const SymptomLogIdSchema = prefixedId("sym");
export const AppointmentIdSchema = prefixedId("appt");
export const TaskIdSchema = prefixedId("task");
export const TimelineEventIdSchema = prefixedId("te");
export const DocumentIdSchema = prefixedId("doc");
export const DocumentPageIdSchema = prefixedId("dpg");
export const ExtractionCandidateIdSchema = prefixedId("xcand");
export const ImportRunIdSchema = prefixedId("imp");
export const ImportArtifactIdSchema = prefixedId("impa");
export const ImportRecordIdSchema = prefixedId("impr");
export const ImportNarrativeSectionIdSchema = prefixedId("imps");
export const ImportConflictIdSchema = prefixedId("imc");
export const SavedQueryIdSchema = prefixedId("qry");
export const SummaryExportIdSchema = prefixedId("exp");
export const ShareLinkIdSchema = prefixedId("shl");
export const AuditLogIdSchema = prefixedId("audit");
export const JobIdSchema = prefixedId("job");

export const PagingQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(25),
  offset: z.coerce.number().int().min(0).default(0),
});

export const BaseTimestampsSchema = z.object({
  createdAt: TimestampSchema,
  updatedAt: TimestampSchema,
  deletedAt: TimestampSchema.nullable().optional(),
});

export const ProvenanceSchema = z.object({
  sourceKind: SourceKindSchema,
  sourceId: z.string().nullable().optional(),
  verificationStatus: VerificationStatusSchema,
});

export const ListResponse = <T extends z.ZodTypeAny>(item: T) =>
  z.object({
    items: z.array(item),
    total: z.number().int().nonnegative(),
  });

export {
  ActorTypeSchema,
  AllergySeveritySchema,
  AppointmentStatusSchema,
  ConflictResolutionStatusSchema,
  DatePrecisionSchema,
  DeviceStatusSchema,
  DocumentSourceTypeSchema,
  DocumentStatusSchema,
  DocumentTextSourceSchema,
  ExtractionCandidateStatusSchema,
  ExtractionCandidateTypeSchema,
  GroundingStatusSchema,
  HouseholdRoleSchema,
  ImportFormatSchema,
  ImportRecordStatusSchema,
  ImportRecordTypeSchema,
  ImportStatusSchema,
  InsightStatusSchema,
  JobStatusSchema,
  JobTypeSchema,
  MemberStatusSchema,
  MedicationStatusSchema,
  OcrStatusSchema,
  ParseStatusSchema,
  PatientAccessLevelSchema,
  SexSchema,
  ShareScopeSchema,
  SummaryTypeSchema,
  TaskPrioritySchema,
  TaskStatusSchema,
  TimelineEventTypeSchema,
};
```

## 4.2 Auth and household contracts

```ts
// packages/shared/src/contracts/auth-households.ts
import { z } from "zod";
import {
  BaseTimestampsSchema,
  EmailSchema,
  HouseholdIdSchema,
  HouseholdMemberIdSchema,
  HouseholdRoleSchema,
  InvitationIdSchema,
  ListResponse,
  MemberStatusSchema,
  NonEmptyStringSchema,
  OptionalTextSchema,
  PatientAccessLevelSchema,
  PatientIdSchema,
  TimestampSchema,
  UserIdSchema,
} from "./common";

export const UserSchema = z.object({
  id: UserIdSchema,
  email: EmailSchema,
  displayName: NonEmptyStringSchema,
  isActive: z.boolean(),
  lastLoginAt: TimestampSchema.nullable(),
}).merge(BaseTimestampsSchema);

export const HouseholdSchema = z.object({
  id: HouseholdIdSchema,
  name: NonEmptyStringSchema,
  slug: NonEmptyStringSchema,
  createdByUserId: UserIdSchema,
}).merge(BaseTimestampsSchema);

export const HouseholdMemberSchema = z.object({
  id: HouseholdMemberIdSchema,
  householdId: HouseholdIdSchema,
  userId: UserIdSchema,
  role: HouseholdRoleSchema,
  status: MemberStatusSchema,
}).merge(BaseTimestampsSchema);

export const InvitationSchema = z.object({
  id: InvitationIdSchema,
  householdId: HouseholdIdSchema,
  email: EmailSchema,
  role: HouseholdRoleSchema,
  invitedByUserId: UserIdSchema,
  expiresAt: TimestampSchema,
  acceptedAt: TimestampSchema.nullable(),
  revokedAt: TimestampSchema.nullable(),
}).merge(BaseTimestampsSchema);

export const PatientPermissionSchema = z.object({
  patientId: PatientIdSchema,
  userId: UserIdSchema,
  accessLevel: PatientAccessLevelSchema,
  createdAt: TimestampSchema,
  updatedAt: TimestampSchema,
});

export const LoginRequestSchema = z.object({
  email: EmailSchema,
  password: z.string().min(8).max(200),
}).strict();

export const SessionResponseSchema = z.object({
  user: UserSchema,
  household: HouseholdSchema.nullable(),
});

export const CreateHouseholdRequestSchema = z.object({
  name: NonEmptyStringSchema.max(150),
  slug: z.string().trim().min(3).max(80).regex(/^[a-z0-9-]+$/),
}).strict();

export const InviteMemberRequestSchema = z.object({
  email: EmailSchema,
  role: HouseholdRoleSchema,
  expiresAt: TimestampSchema.optional(),
}).strict();

export const UpdateHouseholdMemberRequestSchema = z.object({
  role: HouseholdRoleSchema.optional(),
  status: MemberStatusSchema.optional(),
}).strict();

export const HouseholdMembersResponseSchema = ListResponse(HouseholdMemberSchema);
export const InvitationsResponseSchema = ListResponse(InvitationSchema);
```

## 4.3 Patient contracts

```ts
// packages/shared/src/contracts/patients.ts
import { z } from "zod";
import {
  AllergyIdSchema,
  AllergySeveritySchema,
  BaseTimestampsSchema,
  DateOnlySchema,
  DeviceIdSchema,
  DeviceStatusSchema,
  EmergencyContactIdSchema,
  HouseholdIdSchema,
  ListResponse,
  NonEmptyStringSchema,
  OptionalTextSchema,
  PatientIdSchema,
  PhoneSchema,
  ProvenanceSchema,
  SexSchema,
  TimestampSchema,
} from "./common";

export const PatientSchema = z.object({
  id: PatientIdSchema,
  householdId: HouseholdIdSchema,
  firstName: NonEmptyStringSchema.max(120),
  lastName: NonEmptyStringSchema.max(120),
  displayName: NonEmptyStringSchema.max(120),
  dateOfBirth: DateOnlySchema,
  sex: SexSchema,
  photoStorageKey: z.string().nullable(),
  primaryDiagnosisSummary: z.string().nullable(),
  allergySummary: z.string().nullable(),
  emergencyNotes: z.string().nullable(),
}).merge(BaseTimestampsSchema);

export const EmergencyContactSchema = z.object({
  id: EmergencyContactIdSchema,
  patientId: PatientIdSchema,
  name: NonEmptyStringSchema.max(150),
  relationship: NonEmptyStringSchema.max(100),
  phone: PhoneSchema,
  email: z.string().email().nullable(),
  priority: z.number().int().min(1).max(10),
}).merge(BaseTimestampsSchema);

export const AllergySchema = z.object({
  id: AllergyIdSchema,
  patientId: PatientIdSchema,
  substance: NonEmptyStringSchema.max(250),
  reaction: z.string().trim().max(500).nullable(),
  severity: AllergySeveritySchema,
  status: z.enum(["ACTIVE", "RESOLVED", "UNKNOWN"]),
  notes: z.string().trim().max(2000).nullable(),
}).merge(ProvenanceSchema).merge(BaseTimestampsSchema);

export const DeviceSchema = z.object({
  id: DeviceIdSchema,
  patientId: PatientIdSchema,
  name: NonEmptyStringSchema.max(250),
  deviceType: z.string().trim().max(100).nullable(),
  status: DeviceStatusSchema,
  implantedAt: DateOnlySchema.nullable(),
  removedAt: DateOnlySchema.nullable(),
  notes: z.string().trim().max(2000).nullable(),
}).merge(ProvenanceSchema).merge(BaseTimestampsSchema);

export const CreatePatientRequestSchema = z.object({
  firstName: NonEmptyStringSchema.max(120),
  lastName: NonEmptyStringSchema.max(120),
  displayName: NonEmptyStringSchema.max(120),
  dateOfBirth: DateOnlySchema,
  sex: SexSchema,
  primaryDiagnosisSummary: z.string().trim().max(500).optional().nullable(),
  allergySummary: z.string().trim().max(500).optional().nullable(),
  emergencyNotes: z.string().trim().max(5000).optional().nullable(),
}).strict();

export const UpdatePatientRequestSchema = CreatePatientRequestSchema.partial().strict();

export const CreateEmergencyContactRequestSchema = z.object({
  name: NonEmptyStringSchema.max(150),
  relationship: NonEmptyStringSchema.max(100),
  phone: PhoneSchema,
  email: z.string().email().optional().nullable(),
  priority: z.number().int().min(1).max(10).default(1),
}).strict();

export const UpdateEmergencyContactRequestSchema =
  CreateEmergencyContactRequestSchema.partial().strict();

export const CreateAllergyRequestSchema = z.object({
  substance: NonEmptyStringSchema.max(250),
  reaction: z.string().trim().max(500).optional().nullable(),
  severity: AllergySeveritySchema.default("UNKNOWN"),
  status: z.enum(["ACTIVE", "RESOLVED", "UNKNOWN"]).default("ACTIVE"),
  notes: z.string().trim().max(2000).optional().nullable(),
  sourceKind: z.enum(["MANUAL", "DOCUMENT", "IMPORT", "FHIR", "SYSTEM_DERIVED"]).default("MANUAL"),
  sourceId: z.string().optional().nullable(),
  verificationStatus: z.enum(["MANUAL", "AI_SUGGESTED", "IMPORTED", "VERIFIED", "CONFLICTED"]).default("MANUAL"),
}).strict();

export const UpdateAllergyRequestSchema = CreateAllergyRequestSchema.partial().strict();

export const CreateDeviceRequestSchema = z.object({
  name: NonEmptyStringSchema.max(250),
  deviceType: z.string().trim().max(100).optional().nullable(),
  status: DeviceStatusSchema.default("ACTIVE"),
  implantedAt: DateOnlySchema.optional().nullable(),
  removedAt: DateOnlySchema.optional().nullable(),
  notes: z.string().trim().max(2000).optional().nullable(),
  sourceKind: z.enum(["MANUAL", "DOCUMENT", "IMPORT", "FHIR", "SYSTEM_DERIVED"]).default("MANUAL"),
  sourceId: z.string().optional().nullable(),
  verificationStatus: z.enum(["MANUAL", "AI_SUGGESTED", "IMPORTED", "VERIFIED", "CONFLICTED"]).default("MANUAL"),
}).strict();

export const UpdateDeviceRequestSchema = CreateDeviceRequestSchema.partial().strict();

export const PatientsResponseSchema = ListResponse(PatientSchema);
export const EmergencyContactsResponseSchema = ListResponse(EmergencyContactSchema);
export const AllergiesResponseSchema = ListResponse(AllergySchema);
export const DevicesResponseSchema = ListResponse(DeviceSchema);
```

## 4.4 Clinical contracts

```ts
// packages/shared/src/contracts/clinical.ts
import { z } from "zod";
import {
  AppointmentIdSchema,
  AppointmentStatusSchema,
  BaseTimestampsSchema,
  DateOnlySchema,
  HouseholdIdSchema,
  LabResultIdSchema,
  ListResponse,
  MedicationIdSchema,
  MedicationStatusSchema,
  NonEmptyStringSchema,
  OptionalTextSchema,
  PatientIdSchema,
  ProcedureIdSchema,
  ProviderIdSchema,
  ProvenanceSchema,
  TaskIdSchema,
  TaskPrioritySchema,
  TaskStatusSchema,
  TimestampSchema,
  VisitIdSchema,
  ConditionIdSchema,
  SymptomLogIdSchema,
} from "./common";

export const ProviderSchema = z.object({
  id: ProviderIdSchema,
  householdId: HouseholdIdSchema,
  name: NonEmptyStringSchema.max(150),
  specialty: z.string().trim().max(120).nullable(),
  organization: z.string().trim().max(150).nullable(),
  phone: z.string().trim().max(50).nullable(),
  fax: z.string().trim().max(50).nullable(),
  email: z.string().trim().email().max(320).nullable(),
  address: z.string().trim().max(500).nullable(),
  notes: z.string().trim().max(4000).nullable(),
}).merge(BaseTimestampsSchema);

export const ConditionSchema = z.object({
  id: ConditionIdSchema,
  patientId: PatientIdSchema,
  name: NonEmptyStringSchema.max(250),
  code: z.string().trim().max(50).nullable(),
  status: z.enum(["ACTIVE", "RESOLVED", "UNKNOWN"]),
  diagnosisDate: DateOnlySchema.nullable(),
  diagnosingProviderId: ProviderIdSchema.nullable(),
  notes: z.string().trim().max(4000).nullable(),
}).merge(ProvenanceSchema).merge(BaseTimestampsSchema);

export const MedicationSchema = z.object({
  id: MedicationIdSchema,
  patientId: PatientIdSchema,
  name: NonEmptyStringSchema.max(250),
  genericName: z.string().trim().max(250).nullable(),
  dose: z.string().trim().max(120).nullable(),
  route: z.string().trim().max(50).nullable(),
  frequency: z.string().trim().max(100).nullable(),
  startDate: DateOnlySchema.nullable(),
  stopDate: DateOnlySchema.nullable(),
  status: MedicationStatusSchema,
  prescribingProviderId: ProviderIdSchema.nullable(),
  reasonStarted: z.string().trim().max(1000).nullable(),
  reasonStopped: z.string().trim().max(1000).nullable(),
}).merge(ProvenanceSchema).merge(BaseTimestampsSchema);

export const LabResultSchema = z.object({
  id: LabResultIdSchema,
  patientId: PatientIdSchema,
  panelName: z.string().trim().max(150).nullable(),
  testName: NonEmptyStringSchema.max(150),
  valueText: z.string().trim().max(100).nullable(),
  valueNumeric: z.number().nullable(),
  unit: z.string().trim().max(50).nullable(),
  referenceRange: z.string().trim().max(120).nullable(),
  flag: z.enum(["NORMAL", "HIGH", "LOW", "ABNORMAL", "CRITICAL", "UNKNOWN"]),
  collectedAt: TimestampSchema.nullable(),
  reportedAt: TimestampSchema.nullable(),
  orderingProviderId: ProviderIdSchema.nullable(),
}).merge(ProvenanceSchema).merge(BaseTimestampsSchema);

export const ProcedureSchema = z.object({
  id: ProcedureIdSchema,
  patientId: PatientIdSchema,
  name: NonEmptyStringSchema.max(250),
  category: z.string().trim().max(120).nullable(),
  performedAt: TimestampSchema.nullable(),
  providerId: ProviderIdSchema.nullable(),
  facility: z.string().trim().max(150).nullable(),
  outcomeSummary: z.string().trim().max(4000).nullable(),
}).merge(ProvenanceSchema).merge(BaseTimestampsSchema);

export const VisitSchema = z.object({
  id: VisitIdSchema,
  patientId: PatientIdSchema,
  providerId: ProviderIdSchema.nullable(),
  visitType: z.string().trim().max(100).nullable(),
  specialty: z.string().trim().max(120).nullable(),
  facility: z.string().trim().max(150).nullable(),
  visitAt: TimestampSchema,
  reasonForVisit: z.string().trim().max(1000).nullable(),
  summary: z.string().trim().max(10000).nullable(),
}).merge(ProvenanceSchema).merge(BaseTimestampsSchema);

export const SymptomLogSchema = z.object({
  id: SymptomLogIdSchema,
  patientId: PatientIdSchema,
  loggedAt: TimestampSchema,
  symptomType: NonEmptyStringSchema.max(120),
  severity: z.enum(["MILD", "MODERATE", "SEVERE", "UNKNOWN"]).default("UNKNOWN"),
  durationMinutes: z.number().int().min(0).nullable(),
  notes: z.string().trim().max(4000).nullable(),
  possibleTrigger: z.string().trim().max(1000).nullable(),
  createdByUserId: z.string().regex(/^usr_[A-Za-z0-9]{10,}$/),
  source: z.enum(["MANUAL", "IMPORTED", "DERIVED"]).default("MANUAL"),
}).merge(BaseTimestampsSchema);

export const AppointmentSchema = z.object({
  id: AppointmentIdSchema,
  patientId: PatientIdSchema,
  providerId: ProviderIdSchema.nullable(),
  title: NonEmptyStringSchema.max(200),
  startsAt: TimestampSchema,
  endsAt: TimestampSchema.nullable(),
  location: z.string().trim().max(250).nullable(),
  status: AppointmentStatusSchema,
  notes: z.string().trim().max(4000).nullable(),
}).merge(BaseTimestampsSchema);

export const TaskSchema = z.object({
  id: TaskIdSchema,
  patientId: PatientIdSchema,
  assignedToUserId: z.string().regex(/^usr_[A-Za-z0-9]{10,}$/).nullable(),
  title: NonEmptyStringSchema.max(200),
  description: z.string().trim().max(4000).nullable(),
  dueAt: TimestampSchema.nullable(),
  status: TaskStatusSchema,
  priority: TaskPrioritySchema,
  linkedEntityType: z.string().trim().max(50).nullable(),
  linkedEntityId: z.string().trim().max(80).nullable(),
}).merge(BaseTimestampsSchema);

export const CreateProviderRequestSchema = z.object({
  name: NonEmptyStringSchema.max(150),
  specialty: z.string().trim().max(120).optional().nullable(),
  organization: z.string().trim().max(150).optional().nullable(),
  phone: z.string().trim().max(50).optional().nullable(),
  fax: z.string().trim().max(50).optional().nullable(),
  email: z.string().email().max(320).optional().nullable(),
  address: z.string().trim().max(500).optional().nullable(),
  notes: z.string().trim().max(4000).optional().nullable(),
}).strict();

export const UpdateProviderRequestSchema = CreateProviderRequestSchema.partial().strict();

export const CreateConditionRequestSchema = z.object({
  name: NonEmptyStringSchema.max(250),
  code: z.string().trim().max(50).optional().nullable(),
  status: z.enum(["ACTIVE", "RESOLVED", "UNKNOWN"]).default("ACTIVE"),
  diagnosisDate: DateOnlySchema.optional().nullable(),
  diagnosingProviderId: ProviderIdSchema.optional().nullable(),
  notes: z.string().trim().max(4000).optional().nullable(),
  sourceKind: z.enum(["MANUAL", "DOCUMENT", "IMPORT", "FHIR", "SYSTEM_DERIVED"]).default("MANUAL"),
  sourceId: z.string().optional().nullable(),
  verificationStatus: z.enum(["MANUAL", "AI_SUGGESTED", "IMPORTED", "VERIFIED", "CONFLICTED"]).default("MANUAL"),
}).strict();

export const UpdateConditionRequestSchema = CreateConditionRequestSchema.partial().strict();

export const CreateMedicationRequestSchema = z.object({
  name: NonEmptyStringSchema.max(250),
  genericName: z.string().trim().max(250).optional().nullable(),
  dose: z.string().trim().max(120).optional().nullable(),
  route: z.string().trim().max(50).optional().nullable(),
  frequency: z.string().trim().max(100).optional().nullable(),
  startDate: DateOnlySchema.optional().nullable(),
  stopDate: DateOnlySchema.optional().nullable(),
  status: MedicationStatusSchema.default("ACTIVE"),
  prescribingProviderId: ProviderIdSchema.optional().nullable(),
  reasonStarted: z.string().trim().max(1000).optional().nullable(),
  reasonStopped: z.string().trim().max(1000).optional().nullable(),
  sourceKind: z.enum(["MANUAL", "DOCUMENT", "IMPORT", "FHIR", "SYSTEM_DERIVED"]).default("MANUAL"),
  sourceId: z.string().optional().nullable(),
  verificationStatus: z.enum(["MANUAL", "AI_SUGGESTED", "IMPORTED", "VERIFIED", "CONFLICTED"]).default("MANUAL"),
}).strict();

export const UpdateMedicationRequestSchema = CreateMedicationRequestSchema.partial().strict();

export const CreateLabResultRequestSchema = z.object({
  panelName: z.string().trim().max(150).optional().nullable(),
  testName: NonEmptyStringSchema.max(150),
  valueText: z.string().trim().max(100).optional().nullable(),
  valueNumeric: z.number().optional().nullable(),
  unit: z.string().trim().max(50).optional().nullable(),
  referenceRange: z.string().trim().max(120).optional().nullable(),
  flag: z.enum(["NORMAL", "HIGH", "LOW", "ABNORMAL", "CRITICAL", "UNKNOWN"]).default("UNKNOWN"),
  collectedAt: TimestampSchema.optional().nullable(),
  reportedAt: TimestampSchema.optional().nullable(),
  orderingProviderId: ProviderIdSchema.optional().nullable(),
  sourceKind: z.enum(["MANUAL", "DOCUMENT", "IMPORT", "FHIR", "SYSTEM_DERIVED"]).default("MANUAL"),
  sourceId: z.string().optional().nullable(),
  verificationStatus: z.enum(["MANUAL", "AI_SUGGESTED", "IMPORTED", "VERIFIED", "CONFLICTED"]).default("MANUAL"),
}).strict();

export const UpdateLabResultRequestSchema = CreateLabResultRequestSchema.partial().strict();

export const CreateProcedureRequestSchema = z.object({
  name: NonEmptyStringSchema.max(250),
  category: z.string().trim().max(120).optional().nullable(),
  performedAt: TimestampSchema.optional().nullable(),
  providerId: ProviderIdSchema.optional().nullable(),
  facility: z.string().trim().max(150).optional().nullable(),
  outcomeSummary: z.string().trim().max(4000).optional().nullable(),
  sourceKind: z.enum(["MANUAL", "DOCUMENT", "IMPORT", "FHIR", "SYSTEM_DERIVED"]).default("MANUAL"),
  sourceId: z.string().optional().nullable(),
  verificationStatus: z.enum(["MANUAL", "AI_SUGGESTED", "IMPORTED", "VERIFIED", "CONFLICTED"]).default("MANUAL"),
}).strict();

export const UpdateProcedureRequestSchema = CreateProcedureRequestSchema.partial().strict();

export const CreateVisitRequestSchema = z.object({
  providerId: ProviderIdSchema.optional().nullable(),
  visitType: z.string().trim().max(100).optional().nullable(),
  specialty: z.string().trim().max(120).optional().nullable(),
  facility: z.string().trim().max(150).optional().nullable(),
  visitAt: TimestampSchema,
  reasonForVisit: z.string().trim().max(1000).optional().nullable(),
  summary: z.string().trim().max(10000).optional().nullable(),
  sourceKind: z.enum(["MANUAL", "DOCUMENT", "IMPORT", "FHIR", "SYSTEM_DERIVED"]).default("MANUAL"),
  sourceId: z.string().optional().nullable(),
  verificationStatus: z.enum(["MANUAL", "AI_SUGGESTED", "IMPORTED", "VERIFIED", "CONFLICTED"]).default("MANUAL"),
}).strict();

export const UpdateVisitRequestSchema = CreateVisitRequestSchema.partial().strict();

export const CreateSymptomLogRequestSchema = z.object({
  loggedAt: TimestampSchema,
  symptomType: NonEmptyStringSchema.max(120),
  severity: z.enum(["MILD", "MODERATE", "SEVERE", "UNKNOWN"]).default("UNKNOWN"),
  durationMinutes: z.number().int().min(0).optional().nullable(),
  notes: z.string().trim().max(4000).optional().nullable(),
  possibleTrigger: z.string().trim().max(1000).optional().nullable(),
  source: z.enum(["MANUAL", "IMPORTED", "DERIVED"]).default("MANUAL"),
}).strict();

export const UpdateSymptomLogRequestSchema = CreateSymptomLogRequestSchema.partial().strict();

export const CreateAppointmentRequestSchema = z.object({
  providerId: ProviderIdSchema.optional().nullable(),
  title: NonEmptyStringSchema.max(200),
  startsAt: TimestampSchema,
  endsAt: TimestampSchema.optional().nullable(),
  location: z.string().trim().max(250).optional().nullable(),
  status: AppointmentStatusSchema.default("UPCOMING"),
  notes: z.string().trim().max(4000).optional().nullable(),
}).strict();

export const UpdateAppointmentRequestSchema = CreateAppointmentRequestSchema.partial().strict();

export const CreateTaskRequestSchema = z.object({
  assignedToUserId: z.string().regex(/^usr_[A-Za-z0-9]{10,}$/).optional().nullable(),
  title: NonEmptyStringSchema.max(200),
  description: z.string().trim().max(4000).optional().nullable(),
  dueAt: TimestampSchema.optional().nullable(),
  status: TaskStatusSchema.default("TODO"),
  priority: TaskPrioritySchema.default("MEDIUM"),
  linkedEntityType: z.string().trim().max(50).optional().nullable(),
  linkedEntityId: z.string().trim().max(80).optional().nullable(),
}).strict();

export const UpdateTaskRequestSchema = CreateTaskRequestSchema.partial().strict();

export const ProvidersResponseSchema = ListResponse(ProviderSchema);
export const ConditionsResponseSchema = ListResponse(ConditionSchema);
export const MedicationsResponseSchema = ListResponse(MedicationSchema);
export const LabResultsResponseSchema = ListResponse(LabResultSchema);
export const ProceduresResponseSchema = ListResponse(ProcedureSchema);
export const VisitsResponseSchema = ListResponse(VisitSchema);
export const SymptomLogsResponseSchema = ListResponse(SymptomLogSchema);
export const AppointmentsResponseSchema = ListResponse(AppointmentSchema);
export const TasksResponseSchema = ListResponse(TaskSchema);
```

## 4.5 Timeline contracts

```ts
// packages/shared/src/contracts/timeline.ts
import { z } from "zod";
import {
  BaseTimestampsSchema,
  DateOnlySchema,
  DatePrecisionSchema,
  HouseholdIdSchema,
  ListResponse,
  NonEmptyStringSchema,
  PatientIdSchema,
  TimelineEventIdSchema,
  TimelineEventTypeSchema,
} from "./common";

export const TimelineEventLinkSchema = z.object({
  linkedType: z.string().trim().max(50),
  linkedId: z.string().trim().max(80),
});

export const TimelineEventSchema = z.object({
  id: TimelineEventIdSchema,
  patientId: PatientIdSchema,
  householdId: HouseholdIdSchema,
  eventType: TimelineEventTypeSchema,
  eventDate: z.string(), // allows date-only or timestamp
  datePrecision: DatePrecisionSchema,
  title: NonEmptyStringSchema.max(250),
  summary: z.string().trim().max(4000).nullable(),
  specialty: z.string().trim().max(120).nullable(),
  status: z.enum(["ACTIVE", "HIDDEN"]),
  importanceScore: z.number().min(0).max(100),
  sourceKind: z.enum(["MANUAL", "DOCUMENT", "IMPORT", "FHIR", "SYSTEM_DERIVED"]),
  sourceId: z.string().nullable(),
  verifiedStatus: z.enum(["MANUAL", "AI_SUGGESTED", "IMPORTED", "VERIFIED", "CONFLICTED"]),
  links: z.array(TimelineEventLinkSchema),
}).merge(BaseTimestampsSchema);

export const TimelineFilterQuerySchema = z.object({
  from: z.string().optional(),
  to: z.string().optional(),
  types: z.array(TimelineEventTypeSchema).optional(),
  providerId: z.string().optional(),
  medicationId: z.string().optional(),
  conditionId: z.string().optional(),
  search: z.string().trim().max(200).optional(),
  verifiedStatus: z.enum(["MANUAL", "AI_SUGGESTED", "IMPORTED", "VERIFIED", "CONFLICTED"]).optional(),
  limit: z.coerce.number().int().min(1).max(500).default(100),
  offset: z.coerce.number().int().min(0).default(0),
});

export const TimelineResponseSchema = ListResponse(TimelineEventSchema);

export const CreateCustomTimelineViewRequestSchema = z.object({
  question: z.string().trim().min(3).max(500),
}).strict();
```

## 4.6 Document contracts

```ts
// packages/shared/src/contracts/documents.ts
import { z } from "zod";
import {
  BaseTimestampsSchema,
  DocumentIdSchema,
  DocumentPageIdSchema,
  DocumentSourceTypeSchema,
  DocumentStatusSchema,
  DocumentTextSourceSchema,
  ExtractionCandidateIdSchema,
  ExtractionCandidateStatusSchema,
  ExtractionCandidateTypeSchema,
  HouseholdIdSchema,
  ListResponse,
  OcrStatusSchema,
  ParseStatusSchema,
  PatientIdSchema,
  ProviderIdSchema,
  TimestampSchema,
} from "./common";

export const DocumentSchema = z.object({
  id: DocumentIdSchema,
  patientId: PatientIdSchema,
  householdId: HouseholdIdSchema,
  sourceType: DocumentSourceTypeSchema,
  originalFilename: z.string().trim().min(1).max(255),
  mimeType: z.string().trim().min(1).max(120),
  documentType: z.string().trim().max(120).nullable(),
  fileStorageKey: z.string().trim().min(1),
  fileSizeBytes: z.number().int().nonnegative(),
  sha256: z.string().trim().length(64),
  uploadedByUserId: z.string().regex(/^usr_[A-Za-z0-9]{10,}$/),
  documentDate: z.string().nullable(),
  providerId: ProviderIdSchema.nullable(),
  status: DocumentStatusSchema,
  ocrStatus: OcrStatusSchema,
  parseStatus: ParseStatusSchema,
}).merge(BaseTimestampsSchema);

export const DocumentPageSchema = z.object({
  id: DocumentPageIdSchema,
  documentId: DocumentIdSchema,
  pageNumber: z.number().int().min(1),
  extractedText: z.string().nullable(),
  ocrConfidence: z.number().min(0).max(1).nullable(),
  textSource: DocumentTextSourceSchema,
  imageStorageKey: z.string().nullable(),
  createdAt: TimestampSchema,
  updatedAt: TimestampSchema,
});

export const ExtractionCandidateSchema = z.object({
  id: ExtractionCandidateIdSchema,
  documentId: DocumentIdSchema,
  patientId: PatientIdSchema,
  candidateType: ExtractionCandidateTypeSchema,
  payloadJson: z.record(z.string(), z.unknown()),
  confidence: z.number().min(0).max(1).nullable(),
  status: ExtractionCandidateStatusSchema,
  reviewedAt: TimestampSchema.nullable(),
  reviewedByUserId: z.string().regex(/^usr_[A-Za-z0-9]{10,}$/).nullable(),
  createdAt: TimestampSchema,
  updatedAt: TimestampSchema,
});

export const DocumentsResponseSchema = ListResponse(DocumentSchema);
export const DocumentPagesResponseSchema = ListResponse(DocumentPageSchema);
export const ExtractionCandidatesResponseSchema = ListResponse(ExtractionCandidateSchema);

export const DocumentUploadResponseSchema = z.object({
  documentId: DocumentIdSchema,
  status: DocumentStatusSchema,
});

export const AcceptExtractionCandidateRequestSchema = z.object({
  action: z.enum(["ACCEPT_AS_NEW", "MERGE_WITH_EXISTING", "EDIT_THEN_ACCEPT"]),
  targetEntityType: z.string().trim().max(50).optional().nullable(),
  targetEntityId: z.string().trim().max(80).optional().nullable(),
  editedPayload: z.record(z.string(), z.unknown()).optional(),
}).strict();
```

## 4.7 Import contracts

```ts
// packages/shared/src/contracts/imports.ts
import { z } from "zod";
import {
  BaseTimestampsSchema,
  ConflictResolutionStatusSchema,
  ImportArtifactIdSchema,
  ImportFormatSchema,
  ImportConflictIdSchema,
  ImportNarrativeSectionIdSchema,
  ImportRecordIdSchema,
  ImportRecordStatusSchema,
  ImportRecordTypeSchema,
  ImportRunIdSchema,
  ImportStatusSchema,
  ListResponse,
  PatientIdSchema,
  TimestampSchema,
} from "./common";

export const ImportRunSchema = z.object({
  id: ImportRunIdSchema,
  householdId: z.string().regex(/^hh_[A-Za-z0-9]{10,}$/),
  patientId: PatientIdSchema,
  sourceType: z.enum(["PORTAL_DOWNLOAD", "MANUAL_IMPORT"]),
  importFormat: ImportFormatSchema,
  originalFilename: z.string().trim().min(1).max(255),
  mimeType: z.string().trim().min(1).max(120),
  fileStorageKey: z.string().trim().min(1),
  sha256: z.string().trim().length(64),
  status: ImportStatusSchema,
  uploadedByUserId: z.string().regex(/^usr_[A-Za-z0-9]{10,}$/),
  startedAt: TimestampSchema.nullable(),
  completedAt: TimestampSchema.nullable(),
}).merge(BaseTimestampsSchema);

export const ImportArtifactSchema = z.object({
  id: ImportArtifactIdSchema,
  importRunId: ImportRunIdSchema,
  artifactType: z.enum(["XML", "JSON", "ZIP", "PDF", "IMAGE", "OTHER"]),
  filename: z.string().trim().max(255),
  mimeType: z.string().trim().max(120).nullable(),
  storageKey: z.string().trim().min(1),
  parentArtifactId: ImportArtifactIdSchema.nullable(),
  createdAt: TimestampSchema,
  updatedAt: TimestampSchema,
});

export const ImportRecordSchema = z.object({
  id: ImportRecordIdSchema,
  importRunId: ImportRunIdSchema,
  recordType: ImportRecordTypeSchema,
  externalId: z.string().trim().max(200).nullable(),
  payloadJson: z.record(z.string(), z.unknown()),
  sourceDate: z.string().nullable(),
  confidence: z.number().min(0).max(1).nullable(),
  status: ImportRecordStatusSchema,
  matchedEntityType: z.string().trim().max(50).nullable(),
  matchedEntityId: z.string().trim().max(80).nullable(),
  createdAt: TimestampSchema,
  updatedAt: TimestampSchema,
});

export const ImportNarrativeSectionSchema = z.object({
  id: ImportNarrativeSectionIdSchema,
  importRunId: ImportRunIdSchema,
  title: z.string().trim().max(200).nullable(),
  sectionType: z.string().trim().max(80).nullable(),
  text: z.string().trim().min(1),
  sourceDate: z.string().nullable(),
  createdAt: TimestampSchema,
  updatedAt: TimestampSchema,
});

export const ImportConflictSchema = z.object({
  id: ImportConflictIdSchema,
  importRunId: ImportRunIdSchema,
  conflictType: z.string().trim().max(100),
  summary: z.string().trim().min(1).max(4000),
  existingEntityType: z.string().trim().max(50).nullable(),
  existingEntityId: z.string().trim().max(80).nullable(),
  incomingPayloadJson: z.record(z.string(), z.unknown()),
  resolutionStatus: ConflictResolutionStatusSchema,
  resolutionJson: z.record(z.string(), z.unknown()).nullable(),
  resolvedByUserId: z.string().regex(/^usr_[A-Za-z0-9]{10,}$/).nullable(),
  resolvedAt: TimestampSchema.nullable(),
  createdAt: TimestampSchema,
  updatedAt: TimestampSchema,
});

export const ImportRunsResponseSchema = ListResponse(ImportRunSchema);
export const ImportArtifactsResponseSchema = ListResponse(ImportArtifactSchema);
export const ImportRecordsResponseSchema = ListResponse(ImportRecordSchema);
export const ImportNarrativeSectionsResponseSchema = ListResponse(ImportNarrativeSectionSchema);
export const ImportConflictsResponseSchema = ListResponse(ImportConflictSchema);

export const ImportUploadResponseSchema = z.object({
  importRunId: ImportRunIdSchema,
  status: ImportStatusSchema,
  importFormat: ImportFormatSchema,
});

export const ResolveImportConflictRequestSchema = z.object({
  resolution: z.enum([
    "ACCEPT_AS_NEW",
    "MERGE_WITH_EXISTING",
    "OVERRIDE_EXISTING",
    "REJECT_INCOMING",
  ]),
  targetEntityType: z.string().trim().max(50).optional().nullable(),
  targetEntityId: z.string().trim().max(80).optional().nullable(),
  editedPayload: z.record(z.string(), z.unknown()).optional(),
}).strict();
```

## 4.8 Search, summaries, sharing, emergency, and query contracts

```ts
// packages/shared/src/contracts/features.ts
import { z } from "zod";
import {
  BaseTimestampsSchema,
  DocumentIdSchema,
  GroundingStatusSchema,
  ListResponse,
  NonEmptyStringSchema,
  PatientIdSchema,
  ShareLinkIdSchema,
  ShareScopeSchema,
  SummaryExportIdSchema,
  SummaryTypeSchema,
  TimestampSchema,
} from "./common";

export const SearchResultSchema = z.object({
  type: z.enum([
    "DOCUMENT_PAGE",
    "IMPORTED_NARRATIVE",
    "MEDICATION",
    "CONDITION",
    "VISIT",
    "LAB",
    "PROCEDURE",
    "TIMELINE_EVENT",
  ]),
  title: z.string().trim().min(1).max(250),
  snippet: z.string().trim().min(1).max(2000),
  date: z.string().nullable(),
  source: z.record(z.string(), z.unknown()),
});

export const SearchResponseSchema = ListResponse(SearchResultSchema);

export const SummaryExportSchema = z.object({
  id: SummaryExportIdSchema,
  patientId: PatientIdSchema,
  summaryType: SummaryTypeSchema,
  parametersJson: z.record(z.string(), z.unknown()),
  htmlStorageKey: z.string().nullable(),
  pdfStorageKey: z.string().nullable(),
  createdByUserId: z.string().regex(/^usr_[A-Za-z0-9]{10,}$/),
  createdAt: TimestampSchema,
});

export const CreateSummaryRequestSchema = z.object({
  summaryType: SummaryTypeSchema,
  dateRange: z.object({
    from: z.string().optional(),
    to: z.string().optional(),
  }).optional(),
  includeDocuments: z.boolean().optional().default(false),
}).strict();

export const CreateBinderExportRequestSchema = z.object({
  includeDocuments: z.boolean().default(true),
  includeImports: z.boolean().default(false),
}).strict();

export const CreateShareLinkRequestSchema = z.object({
  scope: ShareScopeSchema,
  expiresAt: TimestampSchema,
  maxViews: z.number().int().positive().optional().nullable(),
  scopeJson: z.record(z.string(), z.unknown()).optional(),
}).strict();

export const ShareLinkSchema = z.object({
  id: ShareLinkIdSchema,
  patientId: PatientIdSchema,
  scope: ShareScopeSchema,
  scopeJson: z.record(z.string(), z.unknown()).nullable(),
  expiresAt: TimestampSchema,
  revokedAt: TimestampSchema.nullable(),
  createdByUserId: z.string().regex(/^usr_[A-Za-z0-9]{10,}$/),
  maxViews: z.number().int().positive().nullable(),
  currentViews: z.number().int().nonnegative(),
  createdAt: TimestampSchema,
});

export const EmergencyViewSchema = z.object({
  patient: z.object({
    id: PatientIdSchema,
    displayName: z.string(),
    dateOfBirth: z.string(),
    sex: z.enum(["F", "M", "X", "UNKNOWN"]),
    photoUrl: z.string().url().nullable().optional(),
    diagnosesSummary: z.string().nullable(),
    emergencyNotes: z.string().nullable(),
  }),
  allergies: z.array(z.object({
    substance: z.string(),
    reaction: z.string().nullable(),
    severity: z.enum(["MILD", "MODERATE", "SEVERE", "UNKNOWN"]),
  })),
  medications: z.array(z.object({
    name: z.string(),
    dose: z.string().nullable(),
    route: z.string().nullable(),
    frequency: z.string().nullable(),
  })),
  devices: z.array(z.object({
    name: z.string(),
    deviceType: z.string().nullable(),
    status: z.enum(["ACTIVE", "REMOVED", "UNKNOWN"]),
  })),
  emergencyContacts: z.array(z.object({
    name: z.string(),
    relationship: z.string(),
    phone: z.string(),
  })),
  providers: z.array(z.object({
    name: z.string(),
    specialty: z.string().nullable(),
    phone: z.string().nullable(),
    organization: z.string().nullable(),
  })),
});

export const RecordQueryRequestSchema = z.object({
  question: z.string().trim().min(3).max(1000),
}).strict();

export const QuerySourceSchema = z.object({
  type: z.enum([
    "DOCUMENT_PAGE",
    "IMPORTED_NARRATIVE",
    "MEDICATION",
    "CONDITION",
    "VISIT",
    "LAB",
    "PROCEDURE",
    "TIMELINE_EVENT",
  ]),
  label: z.string().trim().min(1).max(250),
  documentId: DocumentIdSchema.optional(),
  page: z.number().int().positive().optional(),
  entityId: z.string().optional(),
  importRunId: z.string().optional(),
  sectionId: z.string().optional(),
});

export const RecordQueryResponseSchema = z.object({
  answer: z.string().trim().min(1).max(10000),
  sources: z.array(QuerySourceSchema),
  groundingStatus: GroundingStatusSchema,
});

export const SavedQuerySchema = z.object({
  id: z.string().regex(/^qry_[A-Za-z0-9]{10,}$/),
  patientId: PatientIdSchema,
  createdByUserId: z.string().regex(/^usr_[A-Za-z0-9]{10,}$/),
  question: z.string(),
  answerMarkdown: z.string(),
  citationsJson: z.record(z.string(), z.unknown()),
  groundingStatus: GroundingStatusSchema,
  createdAt: TimestampSchema,
});

export const SavedQueriesResponseSchema = ListResponse(SavedQuerySchema);
export const SummaryExportsResponseSchema = ListResponse(SummaryExportSchema);
```

---

## 5. SQLite migration pack

These are the migration files I would create under:

```text
apps/api/src/db/migrations/
```

---

## 5.1 `001_auth.sql`

```sql
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL COLLATE NOCASE UNIQUE,
  password_hash TEXT NOT NULL,
  display_name TEXT NOT NULL,
  is_active INTEGER NOT NULL DEFAULT 1 CHECK (is_active IN (0, 1)),
  last_login_at TEXT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  deleted_at TEXT NULL
);

CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);

CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  ip_address TEXT NULL,
  user_agent TEXT NULL,
  revoked_at TEXT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at);
```

---

## 5.2 `002_households.sql`

```sql
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS households (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  created_by_user_id TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  FOREIGN KEY (created_by_user_id) REFERENCES users(id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS household_members (
  id TEXT PRIMARY KEY,
  household_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('OWNER', 'EDITOR', 'VIEWER', 'EMERGENCY_ONLY')),
  status TEXT NOT NULL CHECK (status IN ('INVITED', 'ACTIVE', 'REVOKED')),
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  UNIQUE (household_id, user_id),
  FOREIGN KEY (household_id) REFERENCES households(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_household_members_household_id
  ON household_members(household_id);

CREATE TABLE IF NOT EXISTS invitations (
  id TEXT PRIMARY KEY,
  household_id TEXT NOT NULL,
  email TEXT NOT NULL COLLATE NOCASE,
  role TEXT NOT NULL CHECK (role IN ('OWNER', 'EDITOR', 'VIEWER', 'EMERGENCY_ONLY')),
  token_hash TEXT NOT NULL UNIQUE,
  invited_by_user_id TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  accepted_at TEXT NULL,
  revoked_at TEXT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  FOREIGN KEY (household_id) REFERENCES households(id) ON DELETE CASCADE,
  FOREIGN KEY (invited_by_user_id) REFERENCES users(id) ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS idx_invitations_household_id ON invitations(household_id);
CREATE INDEX IF NOT EXISTS idx_invitations_email ON invitations(email);
CREATE INDEX IF NOT EXISTS idx_invitations_expires_at ON invitations(expires_at);
```

---

## 5.3 `003_patients.sql`

```sql
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS patients (
  id TEXT PRIMARY KEY,
  household_id TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  display_name TEXT NOT NULL,
  date_of_birth TEXT NOT NULL,
  sex TEXT NOT NULL CHECK (sex IN ('F', 'M', 'X', 'UNKNOWN')),
  photo_storage_key TEXT NULL,
  primary_diagnosis_summary TEXT NULL,
  allergy_summary TEXT NULL,
  emergency_notes TEXT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  deleted_at TEXT NULL,
  FOREIGN KEY (household_id) REFERENCES households(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_patients_household_id ON patients(household_id);
CREATE INDEX IF NOT EXISTS idx_patients_display_name ON patients(display_name);

CREATE TABLE IF NOT EXISTS patient_permissions (
  id TEXT PRIMARY KEY,
  patient_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  access_level TEXT NOT NULL CHECK (access_level IN ('NO_ACCESS', 'READ_ONLY', 'EDIT', 'EMERGENCY_ONLY')),
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  UNIQUE (patient_id, user_id),
  FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS emergency_contacts (
  id TEXT PRIMARY KEY,
  patient_id TEXT NOT NULL,
  name TEXT NOT NULL,
  relationship TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NULL,
  priority INTEGER NOT NULL DEFAULT 1 CHECK (priority BETWEEN 1 AND 10),
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  deleted_at TEXT NULL,
  FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_emergency_contacts_patient_id
  ON emergency_contacts(patient_id);

CREATE TABLE IF NOT EXISTS allergies (
  id TEXT PRIMARY KEY,
  patient_id TEXT NOT NULL,
  substance TEXT NOT NULL,
  reaction TEXT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('MILD', 'MODERATE', 'SEVERE', 'UNKNOWN')),
  status TEXT NOT NULL CHECK (status IN ('ACTIVE', 'RESOLVED', 'UNKNOWN')),
  notes TEXT NULL,
  source_kind TEXT NOT NULL CHECK (source_kind IN ('MANUAL', 'DOCUMENT', 'IMPORT', 'FHIR', 'SYSTEM_DERIVED')),
  source_id TEXT NULL,
  verification_status TEXT NOT NULL CHECK (verification_status IN ('MANUAL', 'AI_SUGGESTED', 'IMPORTED', 'VERIFIED', 'CONFLICTED')),
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  deleted_at TEXT NULL,
  FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_allergies_patient_id ON allergies(patient_id);

CREATE TABLE IF NOT EXISTS devices (
  id TEXT PRIMARY KEY,
  patient_id TEXT NOT NULL,
  name TEXT NOT NULL,
  device_type TEXT NULL,
  status TEXT NOT NULL CHECK (status IN ('ACTIVE', 'REMOVED', 'UNKNOWN')),
  implanted_at TEXT NULL,
  removed_at TEXT NULL,
  notes TEXT NULL,
  source_kind TEXT NOT NULL CHECK (source_kind IN ('MANUAL', 'DOCUMENT', 'IMPORT', 'FHIR', 'SYSTEM_DERIVED')),
  source_id TEXT NULL,
  verification_status TEXT NOT NULL CHECK (verification_status IN ('MANUAL', 'AI_SUGGESTED', 'IMPORTED', 'VERIFIED', 'CONFLICTED')),
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  deleted_at TEXT NULL,
  FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_devices_patient_id ON devices(patient_id);
```

---

## 5.4 `004_clinical.sql`

```sql
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS providers (
  id TEXT PRIMARY KEY,
  household_id TEXT NOT NULL,
  name TEXT NOT NULL,
  specialty TEXT NULL,
  organization TEXT NULL,
  phone TEXT NULL,
  fax TEXT NULL,
  email TEXT NULL,
  address TEXT NULL,
  notes TEXT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  deleted_at TEXT NULL,
  FOREIGN KEY (household_id) REFERENCES households(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_providers_household_id ON providers(household_id);
CREATE INDEX IF NOT EXISTS idx_providers_name ON providers(name);

CREATE TABLE IF NOT EXISTS conditions (
  id TEXT PRIMARY KEY,
  patient_id TEXT NOT NULL,
  name TEXT NOT NULL,
  code TEXT NULL,
  status TEXT NOT NULL CHECK (status IN ('ACTIVE', 'RESOLVED', 'UNKNOWN')),
  diagnosis_date TEXT NULL,
  diagnosing_provider_id TEXT NULL,
  notes TEXT NULL,
  source_kind TEXT NOT NULL CHECK (source_kind IN ('MANUAL', 'DOCUMENT', 'IMPORT', 'FHIR', 'SYSTEM_DERIVED')),
  source_id TEXT NULL,
  verification_status TEXT NOT NULL CHECK (verification_status IN ('MANUAL', 'AI_SUGGESTED', 'IMPORTED', 'VERIFIED', 'CONFLICTED')),
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  deleted_at TEXT NULL,
  FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
  FOREIGN KEY (diagnosing_provider_id) REFERENCES providers(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_conditions_patient_id ON conditions(patient_id);
CREATE INDEX IF NOT EXISTS idx_conditions_diagnosis_date ON conditions(diagnosis_date);

CREATE TABLE IF NOT EXISTS medications (
  id TEXT PRIMARY KEY,
  patient_id TEXT NOT NULL,
  name TEXT NOT NULL,
  generic_name TEXT NULL,
  dose TEXT NULL,
  route TEXT NULL,
  frequency TEXT NULL,
  start_date TEXT NULL,
  stop_date TEXT NULL,
  status TEXT NOT NULL CHECK (status IN ('ACTIVE', 'PAST', 'PLANNED', 'UNKNOWN')),
  prescribing_provider_id TEXT NULL,
  reason_started TEXT NULL,
  reason_stopped TEXT NULL,
  source_kind TEXT NOT NULL CHECK (source_kind IN ('MANUAL', 'DOCUMENT', 'IMPORT', 'FHIR', 'SYSTEM_DERIVED')),
  source_id TEXT NULL,
  verification_status TEXT NOT NULL CHECK (verification_status IN ('MANUAL', 'AI_SUGGESTED', 'IMPORTED', 'VERIFIED', 'CONFLICTED')),
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  deleted_at TEXT NULL,
  FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
  FOREIGN KEY (prescribing_provider_id) REFERENCES providers(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_medications_patient_id ON medications(patient_id);
CREATE INDEX IF NOT EXISTS idx_medications_start_date ON medications(start_date);
CREATE INDEX IF NOT EXISTS idx_medications_stop_date ON medications(stop_date);
CREATE INDEX IF NOT EXISTS idx_medications_status ON medications(status);

CREATE TABLE IF NOT EXISTS lab_results (
  id TEXT PRIMARY KEY,
  patient_id TEXT NOT NULL,
  panel_name TEXT NULL,
  test_name TEXT NOT NULL,
  value_text TEXT NULL,
  value_numeric REAL NULL,
  unit TEXT NULL,
  reference_range TEXT NULL,
  flag TEXT NOT NULL CHECK (flag IN ('NORMAL', 'HIGH', 'LOW', 'ABNORMAL', 'CRITICAL', 'UNKNOWN')),
  collected_at TEXT NULL,
  reported_at TEXT NULL,
  ordering_provider_id TEXT NULL,
  source_kind TEXT NOT NULL CHECK (source_kind IN ('MANUAL', 'DOCUMENT', 'IMPORT', 'FHIR', 'SYSTEM_DERIVED')),
  source_id TEXT NULL,
  verification_status TEXT NOT NULL CHECK (verification_status IN ('MANUAL', 'AI_SUGGESTED', 'IMPORTED', 'VERIFIED', 'CONFLICTED')),
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  deleted_at TEXT NULL,
  FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
  FOREIGN KEY (ordering_provider_id) REFERENCES providers(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_lab_results_patient_id ON lab_results(patient_id);
CREATE INDEX IF NOT EXISTS idx_lab_results_collected_at ON lab_results(collected_at);
CREATE INDEX IF NOT EXISTS idx_lab_results_reported_at ON lab_results(reported_at);

CREATE TABLE IF NOT EXISTS procedures (
  id TEXT PRIMARY KEY,
  patient_id TEXT NOT NULL,
  name TEXT NOT NULL,
  category TEXT NULL,
  performed_at TEXT NULL,
  provider_id TEXT NULL,
  facility TEXT NULL,
  outcome_summary TEXT NULL,
  source_kind TEXT NOT NULL CHECK (source_kind IN ('MANUAL', 'DOCUMENT', 'IMPORT', 'FHIR', 'SYSTEM_DERIVED')),
  source_id TEXT NULL,
  verification_status TEXT NOT NULL CHECK (verification_status IN ('MANUAL', 'AI_SUGGESTED', 'IMPORTED', 'VERIFIED', 'CONFLICTED')),
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  deleted_at TEXT NULL,
  FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
  FOREIGN KEY (provider_id) REFERENCES providers(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_procedures_patient_id ON procedures(patient_id);
CREATE INDEX IF NOT EXISTS idx_procedures_performed_at ON procedures(performed_at);

CREATE TABLE IF NOT EXISTS visits (
  id TEXT PRIMARY KEY,
  patient_id TEXT NOT NULL,
  provider_id TEXT NULL,
  visit_type TEXT NULL,
  specialty TEXT NULL,
  facility TEXT NULL,
  visit_at TEXT NOT NULL,
  reason_for_visit TEXT NULL,
  summary TEXT NULL,
  source_kind TEXT NOT NULL CHECK (source_kind IN ('MANUAL', 'DOCUMENT', 'IMPORT', 'FHIR', 'SYSTEM_DERIVED')),
  source_id TEXT NULL,
  verification_status TEXT NOT NULL CHECK (verification_status IN ('MANUAL', 'AI_SUGGESTED', 'IMPORTED', 'VERIFIED', 'CONFLICTED')),
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  deleted_at TEXT NULL,
  FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
  FOREIGN KEY (provider_id) REFERENCES providers(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_visits_patient_id ON visits(patient_id);
CREATE INDEX IF NOT EXISTS idx_visits_visit_at ON visits(visit_at);

CREATE TABLE IF NOT EXISTS symptom_logs (
  id TEXT PRIMARY KEY,
  patient_id TEXT NOT NULL,
  logged_at TEXT NOT NULL,
  symptom_type TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('MILD', 'MODERATE', 'SEVERE', 'UNKNOWN')),
  duration_minutes INTEGER NULL CHECK (duration_minutes IS NULL OR duration_minutes >= 0),
  notes TEXT NULL,
  possible_trigger TEXT NULL,
  created_by_user_id TEXT NOT NULL,
  source TEXT NOT NULL CHECK (source IN ('MANUAL', 'IMPORTED', 'DERIVED')),
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  deleted_at TEXT NULL,
  FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by_user_id) REFERENCES users(id) ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS idx_symptom_logs_patient_id ON symptom_logs(patient_id);
CREATE INDEX IF NOT EXISTS idx_symptom_logs_logged_at ON symptom_logs(logged_at);

CREATE TABLE IF NOT EXISTS appointments (
  id TEXT PRIMARY KEY,
  patient_id TEXT NOT NULL,
  provider_id TEXT NULL,
  title TEXT NOT NULL,
  starts_at TEXT NOT NULL,
  ends_at TEXT NULL,
  location TEXT NULL,
  status TEXT NOT NULL CHECK (status IN ('UPCOMING', 'COMPLETED', 'CANCELLED', 'NO_SHOW')),
  notes TEXT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  deleted_at TEXT NULL,
  FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
  FOREIGN KEY (provider_id) REFERENCES providers(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_appointments_patient_id ON appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_starts_at ON appointments(starts_at);

CREATE TABLE IF NOT EXISTS tasks (
  id TEXT PRIMARY KEY,
  patient_id TEXT NOT NULL,
  assigned_to_user_id TEXT NULL,
  title TEXT NOT NULL,
  description TEXT NULL,
  due_at TEXT NULL,
  status TEXT NOT NULL CHECK (status IN ('TODO', 'IN_PROGRESS', 'DONE', 'CANCELLED')),
  priority TEXT NOT NULL CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'URGENT')),
  linked_entity_type TEXT NULL,
  linked_entity_id TEXT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  deleted_at TEXT NULL,
  FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
  FOREIGN KEY (assigned_to_user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_tasks_patient_id ON tasks(patient_id);
CREATE INDEX IF NOT EXISTS idx_tasks_due_at ON tasks(due_at);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
```

---

## 5.5 `005_timeline.sql`

```sql
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS timeline_events (
  id TEXT PRIMARY KEY,
  patient_id TEXT NOT NULL,
  household_id TEXT NOT NULL,
  event_type TEXT NOT NULL CHECK (event_type IN (
    'DIAGNOSIS_ADDED',
    'MEDICATION_STARTED',
    'MEDICATION_STOPPED',
    'PROCEDURE',
    'LAB',
    'VISIT',
    'SYMPTOM',
    'APPOINTMENT',
    'HOSPITALIZATION',
    'IMPORTED_RECORD',
    'CUSTOM'
  )),
  event_date TEXT NOT NULL,
  date_precision TEXT NOT NULL CHECK (date_precision IN ('YEAR', 'MONTH', 'DAY', 'TIMESTAMP')),
  title TEXT NOT NULL,
  summary TEXT NULL,
  specialty TEXT NULL,
  status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'HIDDEN')),
  importance_score REAL NOT NULL DEFAULT 50 CHECK (importance_score BETWEEN 0 AND 100),
  source_kind TEXT NOT NULL CHECK (source_kind IN ('MANUAL', 'DOCUMENT', 'IMPORT', 'FHIR', 'SYSTEM_DERIVED')),
  source_id TEXT NULL,
  verified_status TEXT NOT NULL CHECK (verified_status IN ('MANUAL', 'AI_SUGGESTED', 'IMPORTED', 'VERIFIED', 'CONFLICTED')),
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
  FOREIGN KEY (household_id) REFERENCES households(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_timeline_events_patient_date
  ON timeline_events(patient_id, event_date DESC);

CREATE INDEX IF NOT EXISTS idx_timeline_events_type
  ON timeline_events(event_type);

CREATE TABLE IF NOT EXISTS timeline_event_links (
  id TEXT PRIMARY KEY,
  timeline_event_id TEXT NOT NULL,
  linked_type TEXT NOT NULL,
  linked_id TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  UNIQUE (timeline_event_id, linked_type, linked_id),
  FOREIGN KEY (timeline_event_id) REFERENCES timeline_events(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_timeline_event_links_event_id
  ON timeline_event_links(timeline_event_id);
```

---

## 5.6 `006_documents.sql`

```sql
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS documents (
  id TEXT PRIMARY KEY,
  patient_id TEXT NOT NULL,
  household_id TEXT NOT NULL,
  source_type TEXT NOT NULL CHECK (source_type IN (
    'MANUAL_UPLOAD',
    'SCANNED_UPLOAD',
    'PORTAL_EXPORT',
    'XML_IMPORT',
    'FHIR_IMPORT',
    'OTHER_IMPORT'
  )),
  original_filename TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  document_type TEXT NULL,
  file_storage_key TEXT NOT NULL,
  file_size_bytes INTEGER NOT NULL CHECK (file_size_bytes >= 0),
  sha256 TEXT NOT NULL,
  uploaded_by_user_id TEXT NOT NULL,
  document_date TEXT NULL,
  provider_id TEXT NULL,
  status TEXT NOT NULL CHECK (status IN ('UPLOADED', 'PROCESSING', 'READY', 'FAILED', 'DELETED')),
  ocr_status TEXT NOT NULL CHECK (ocr_status IN ('NOT_REQUIRED', 'PENDING', 'COMPLETE', 'FAILED')),
  parse_status TEXT NOT NULL CHECK (parse_status IN ('PENDING', 'COMPLETE', 'FAILED')),
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  deleted_at TEXT NULL,
  FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
  FOREIGN KEY (household_id) REFERENCES households(id) ON DELETE CASCADE,
  FOREIGN KEY (uploaded_by_user_id) REFERENCES users(id) ON DELETE RESTRICT,
  FOREIGN KEY (provider_id) REFERENCES providers(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_documents_patient_id ON documents(patient_id);
CREATE INDEX IF NOT EXISTS idx_documents_status ON documents(status);

CREATE TABLE IF NOT EXISTS document_pages (
  id TEXT PRIMARY KEY,
  document_id TEXT NOT NULL,
  page_number INTEGER NOT NULL CHECK (page_number >= 1),
  extracted_text TEXT NULL,
  ocr_confidence REAL NULL CHECK (ocr_confidence IS NULL OR (ocr_confidence BETWEEN 0 AND 1)),
  text_source TEXT NOT NULL CHECK (text_source IN ('EMBEDDED', 'OCR', 'MANUAL')),
  image_storage_key TEXT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  UNIQUE (document_id, page_number),
  FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_document_pages_document_id ON document_pages(document_id);

CREATE TABLE IF NOT EXISTS document_tags (
  id TEXT PRIMARY KEY,
  document_id TEXT NOT NULL,
  tag TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  UNIQUE (document_id, tag),
  FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS document_links (
  id TEXT PRIMARY KEY,
  document_id TEXT NOT NULL,
  linked_type TEXT NOT NULL,
  linked_id TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  UNIQUE (document_id, linked_type, linked_id),
  FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_document_links_document_id ON document_links(document_id);

CREATE TABLE IF NOT EXISTS extraction_candidates (
  id TEXT PRIMARY KEY,
  document_id TEXT NOT NULL,
  patient_id TEXT NOT NULL,
  candidate_type TEXT NOT NULL CHECK (candidate_type IN (
    'CONDITION',
    'MEDICATION',
    'PROVIDER',
    'VISIT',
    'PROCEDURE',
    'LAB',
    'ALLERGY',
    'DEVICE'
  )),
  payload_json TEXT NOT NULL CHECK (json_valid(payload_json)),
  confidence REAL NULL CHECK (confidence IS NULL OR (confidence BETWEEN 0 AND 1)),
  status TEXT NOT NULL CHECK (status IN ('PENDING', 'ACCEPTED', 'REJECTED', 'SUPERSEDED')),
  reviewed_at TEXT NULL,
  reviewed_by_user_id TEXT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE,
  FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
  FOREIGN KEY (reviewed_by_user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_extraction_candidates_document_id
  ON extraction_candidates(document_id);

CREATE INDEX IF NOT EXISTS idx_extraction_candidates_patient_status
  ON extraction_candidates(patient_id, status);
```

---

## 5.7 `007_imports.sql`

```sql
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS import_runs (
  id TEXT PRIMARY KEY,
  household_id TEXT NOT NULL,
  patient_id TEXT NOT NULL,
  source_type TEXT NOT NULL CHECK (source_type IN ('PORTAL_DOWNLOAD', 'MANUAL_IMPORT')),
  import_format TEXT NOT NULL CHECK (import_format IN (
    'CCD_XML',
    'CCDA_XML',
    'FHIR_BUNDLE_JSON',
    'FHIR_BUNDLE_XML',
    'PORTAL_XML_UNKNOWN',
    'JSON_UNKNOWN',
    'ZIP_PACKAGE'
  )),
  original_filename TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  file_storage_key TEXT NOT NULL,
  sha256 TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('UPLOADED', 'PROCESSING', 'READY', 'FAILED', 'PARTIAL')),
  uploaded_by_user_id TEXT NOT NULL,
  started_at TEXT NULL,
  completed_at TEXT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  FOREIGN KEY (household_id) REFERENCES households(id) ON DELETE CASCADE,
  FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
  FOREIGN KEY (uploaded_by_user_id) REFERENCES users(id) ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS idx_import_runs_patient_id ON import_runs(patient_id);
CREATE INDEX IF NOT EXISTS idx_import_runs_status ON import_runs(status);

CREATE TABLE IF NOT EXISTS import_artifacts (
  id TEXT PRIMARY KEY,
  import_run_id TEXT NOT NULL,
  artifact_type TEXT NOT NULL CHECK (artifact_type IN ('XML', 'JSON', 'ZIP', 'PDF', 'IMAGE', 'OTHER')),
  filename TEXT NOT NULL,
  mime_type TEXT NULL,
  storage_key TEXT NOT NULL,
  parent_artifact_id TEXT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  FOREIGN KEY (import_run_id) REFERENCES import_runs(id) ON DELETE CASCADE,
  FOREIGN KEY (parent_artifact_id) REFERENCES import_artifacts(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_import_artifacts_import_run_id
  ON import_artifacts(import_run_id);

CREATE TABLE IF NOT EXISTS import_records (
  id TEXT PRIMARY KEY,
  import_run_id TEXT NOT NULL,
  record_type TEXT NOT NULL CHECK (record_type IN (
    'PATIENT',
    'PROVIDER',
    'CONDITION',
    'MEDICATION',
    'LAB',
    'VISIT',
    'PROCEDURE',
    'DOCUMENT_REFERENCE',
    'ALLERGY',
    'DEVICE'
  )),
  external_id TEXT NULL,
  payload_json TEXT NOT NULL CHECK (json_valid(payload_json)),
  source_date TEXT NULL,
  confidence REAL NULL CHECK (confidence IS NULL OR (confidence BETWEEN 0 AND 1)),
  status TEXT NOT NULL CHECK (status IN ('PENDING', 'ACCEPTED', 'REJECTED', 'MERGED', 'CONFLICTED')),
  matched_entity_type TEXT NULL,
  matched_entity_id TEXT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  FOREIGN KEY (import_run_id) REFERENCES import_runs(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_import_records_import_run_id
  ON import_records(import_run_id);

CREATE INDEX IF NOT EXISTS idx_import_records_status
  ON import_records(status);

CREATE TABLE IF NOT EXISTS import_narrative_sections (
  id TEXT PRIMARY KEY,
  import_run_id TEXT NOT NULL,
  title TEXT NULL,
  section_type TEXT NULL,
  text TEXT NOT NULL,
  source_date TEXT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  FOREIGN KEY (import_run_id) REFERENCES import_runs(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_import_narrative_sections_import_run_id
  ON import_narrative_sections(import_run_id);

CREATE TABLE IF NOT EXISTS import_conflicts (
  id TEXT PRIMARY KEY,
  import_run_id TEXT NOT NULL,
  conflict_type TEXT NOT NULL,
  summary TEXT NOT NULL,
  existing_entity_type TEXT NULL,
  existing_entity_id TEXT NULL,
  incoming_payload_json TEXT NOT NULL CHECK (json_valid(incoming_payload_json)),
  resolution_status TEXT NOT NULL CHECK (resolution_status IN ('OPEN', 'RESOLVED', 'REJECTED')),
  resolution_json TEXT NULL CHECK (resolution_json IS NULL OR json_valid(resolution_json)),
  resolved_by_user_id TEXT NULL,
  resolved_at TEXT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  FOREIGN KEY (import_run_id) REFERENCES import_runs(id) ON DELETE CASCADE,
  FOREIGN KEY (resolved_by_user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_import_conflicts_import_run_id
  ON import_conflicts(import_run_id);

CREATE INDEX IF NOT EXISTS idx_import_conflicts_resolution_status
  ON import_conflicts(resolution_status);
```

---

## 5.8 `008_features.sql`

```sql
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS saved_queries (
  id TEXT PRIMARY KEY,
  patient_id TEXT NOT NULL,
  created_by_user_id TEXT NOT NULL,
  question TEXT NOT NULL,
  answer_markdown TEXT NOT NULL,
  citations_json TEXT NOT NULL CHECK (json_valid(citations_json)),
  grounding_status TEXT NOT NULL CHECK (grounding_status IN ('GROUNDED', 'PARTIAL', 'INSUFFICIENT_EVIDENCE')),
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by_user_id) REFERENCES users(id) ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS idx_saved_queries_patient_id ON saved_queries(patient_id);

CREATE TABLE IF NOT EXISTS insights (
  id TEXT PRIMARY KEY,
  patient_id TEXT NOT NULL,
  insight_type TEXT NOT NULL,
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  evidence_json TEXT NOT NULL CHECK (json_valid(evidence_json)),
  status TEXT NOT NULL CHECK (status IN ('PENDING', 'ACCEPTED', 'DISMISSED')),
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_insights_patient_id ON insights(patient_id);

CREATE TABLE IF NOT EXISTS summary_exports (
  id TEXT PRIMARY KEY,
  patient_id TEXT NOT NULL,
  summary_type TEXT NOT NULL CHECK (summary_type IN (
    'GENERAL',
    'NEUROLOGY',
    'GI',
    'ONCOLOGY',
    'PULMONOLOGY',
    'SCHOOL',
    'EMERGENCY',
    'BINDER'
  )),
  parameters_json TEXT NOT NULL CHECK (json_valid(parameters_json)),
  html_storage_key TEXT NULL,
  pdf_storage_key TEXT NULL,
  created_by_user_id TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by_user_id) REFERENCES users(id) ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS idx_summary_exports_patient_id ON summary_exports(patient_id);

CREATE TABLE IF NOT EXISTS share_links (
  id TEXT PRIMARY KEY,
  patient_id TEXT NOT NULL,
  scope TEXT NOT NULL CHECK (scope IN ('EMERGENCY', 'SUMMARY', 'PATIENT_PACKET')),
  scope_json TEXT NULL CHECK (scope_json IS NULL OR json_valid(scope_json)),
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TEXT NOT NULL,
  revoked_at TEXT NULL,
  created_by_user_id TEXT NOT NULL,
  max_views INTEGER NULL CHECK (max_views IS NULL OR max_views > 0),
  current_views INTEGER NOT NULL DEFAULT 0 CHECK (current_views >= 0),
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by_user_id) REFERENCES users(id) ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS idx_share_links_patient_id ON share_links(patient_id);
CREATE INDEX IF NOT EXISTS idx_share_links_expires_at ON share_links(expires_at);

CREATE TABLE IF NOT EXISTS audit_logs (
  id TEXT PRIMARY KEY,
  household_id TEXT NULL,
  patient_id TEXT NULL,
  actor_user_id TEXT NULL,
  actor_type TEXT NOT NULL CHECK (actor_type IN ('USER', 'SHARE_LINK', 'SYSTEM')),
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT NULL,
  metadata_json TEXT NULL CHECK (metadata_json IS NULL OR json_valid(metadata_json)),
  ip_address TEXT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  FOREIGN KEY (household_id) REFERENCES households(id) ON DELETE SET NULL,
  FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE SET NULL,
  FOREIGN KEY (actor_user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_household_patient
  ON audit_logs(household_id, patient_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_audit_logs_action
  ON audit_logs(action);

CREATE TABLE IF NOT EXISTS jobs (
  id TEXT PRIMARY KEY,
  job_type TEXT NOT NULL CHECK (job_type IN (
    'OCR_DOCUMENT',
    'PARSE_DOCUMENT',
    'INDEX_DOCUMENT',
    'UNPACK_IMPORT_PACKAGE',
    'PARSE_IMPORT',
    'NORMALIZE_IMPORT_RECORDS',
    'GENERATE_TIMELINE_EVENTS',
    'GENERATE_SUMMARY',
    'GENERATE_EXPORT',
    'GENERATE_QR',
    'RUN_BACKUP'
  )),
  status TEXT NOT NULL CHECK (status IN ('QUEUED', 'RUNNING', 'SUCCEEDED', 'FAILED', 'CANCELLED')),
  payload_json TEXT NOT NULL CHECK (json_valid(payload_json)),
  attempt_count INTEGER NOT NULL DEFAULT 0 CHECK (attempt_count >= 0),
  available_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  locked_at TEXT NULL,
  locked_by TEXT NULL,
  last_error TEXT NULL,
  result_json TEXT NULL CHECK (result_json IS NULL OR json_valid(result_json)),
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE INDEX IF NOT EXISTS idx_jobs_status_available_at
  ON jobs(status, available_at);
```

---

## 5.9 `009_fts.sql`

```sql
PRAGMA foreign_keys = ON;

CREATE VIRTUAL TABLE IF NOT EXISTS document_page_fts USING fts5(
  document_id UNINDEXED,
  page_number UNINDEXED,
  extracted_text,
  content='document_pages',
  content_rowid='rowid'
);

CREATE TRIGGER IF NOT EXISTS document_pages_ai
AFTER INSERT ON document_pages BEGIN
  INSERT INTO document_page_fts(rowid, document_id, page_number, extracted_text)
  VALUES (new.rowid, new.document_id, new.page_number, COALESCE(new.extracted_text, ''));
END;

CREATE TRIGGER IF NOT EXISTS document_pages_ad
AFTER DELETE ON document_pages BEGIN
  INSERT INTO document_page_fts(document_page_fts, rowid, document_id, page_number, extracted_text)
  VALUES ('delete', old.rowid, old.document_id, old.page_number, COALESCE(old.extracted_text, ''));
END;

CREATE TRIGGER IF NOT EXISTS document_pages_au
AFTER UPDATE ON document_pages BEGIN
  INSERT INTO document_page_fts(document_page_fts, rowid, document_id, page_number, extracted_text)
  VALUES ('delete', old.rowid, old.document_id, old.page_number, COALESCE(old.extracted_text, ''));
  INSERT INTO document_page_fts(rowid, document_id, page_number, extracted_text)
  VALUES (new.rowid, new.document_id, new.page_number, COALESCE(new.extracted_text, ''));
END;

CREATE VIRTUAL TABLE IF NOT EXISTS timeline_event_fts USING fts5(
  timeline_event_id UNINDEXED,
  title,
  summary,
  content='timeline_events',
  content_rowid='rowid'
);

CREATE TRIGGER IF NOT EXISTS timeline_events_ai
AFTER INSERT ON timeline_events BEGIN
  INSERT INTO timeline_event_fts(rowid, timeline_event_id, title, summary)
  VALUES (new.rowid, new.id, new.title, COALESCE(new.summary, ''));
END;

CREATE TRIGGER IF NOT EXISTS timeline_events_ad
AFTER DELETE ON timeline_events BEGIN
  INSERT INTO timeline_event_fts(timeline_event_fts, rowid, timeline_event_id, title, summary)
  VALUES ('delete', old.rowid, old.id, old.title, COALESCE(old.summary, ''));
END;

CREATE TRIGGER IF NOT EXISTS timeline_events_au
AFTER UPDATE ON timeline_events BEGIN
  INSERT INTO timeline_event_fts(timeline_event_fts, rowid, timeline_event_id, title, summary)
  VALUES ('delete', old.rowid, old.id, old.title, COALESCE(old.summary, ''));
  INSERT INTO timeline_event_fts(rowid, timeline_event_id, title, summary)
  VALUES (new.rowid, new.id, new.title, COALESCE(new.summary, ''));
END;

CREATE VIRTUAL TABLE IF NOT EXISTS import_narrative_fts USING fts5(
  import_run_id UNINDEXED,
  section_id UNINDEXED,
  title,
  text,
  content='import_narrative_sections',
  content_rowid='rowid'
);

CREATE TRIGGER IF NOT EXISTS import_narrative_sections_ai
AFTER INSERT ON import_narrative_sections BEGIN
  INSERT INTO import_narrative_fts(rowid, import_run_id, section_id, title, text)
  VALUES (new.rowid, new.import_run_id, new.id, COALESCE(new.title, ''), new.text);
END;

CREATE TRIGGER IF NOT EXISTS import_narrative_sections_ad
AFTER DELETE ON import_narrative_sections BEGIN
  INSERT INTO import_narrative_fts(import_narrative_fts, rowid, import_run_id, section_id, title, text)
  VALUES ('delete', old.rowid, old.import_run_id, old.id, COALESCE(old.title, ''), old.text);
END;

CREATE TRIGGER IF NOT EXISTS import_narrative_sections_au
AFTER UPDATE ON import_narrative_sections BEGIN
  INSERT INTO import_narrative_fts(import_narrative_fts, rowid, import_run_id, section_id, title, text)
  VALUES ('delete', old.rowid, old.import_run_id, old.id, COALESCE(old.title, ''), old.text);
  INSERT INTO import_narrative_fts(rowid, import_run_id, section_id, title, text)
  VALUES (new.rowid, new.import_run_id, new.id, COALESCE(new.title, ''), new.text);
END;
```

---

## 6. API contract map

These routes should be wired directly to the Zod schemas above.

---

## 6.1 Auth

### `POST /auth/login`

Request: `LoginRequestSchema`
Response: `SessionResponseSchema`

### `POST /auth/logout`

Response: `204 No Content`

### `GET /auth/session`

Response: `SessionResponseSchema`

---

## 6.2 Household

### `POST /households`

Request: `CreateHouseholdRequestSchema`
Response: `HouseholdSchema`

### `GET /households/current`

Response: `HouseholdSchema`

### `GET /households/current/members`

Response: `HouseholdMembersResponseSchema`

### `POST /households/current/members/invite`

Request: `InviteMemberRequestSchema`
Response: `InvitationSchema`

### `PATCH /households/current/members/:memberId`

Request: `UpdateHouseholdMemberRequestSchema`
Response: `HouseholdMemberSchema`

---

## 6.3 Patients

### `GET /patients`

Response: `PatientsResponseSchema`

### `POST /patients`

Request: `CreatePatientRequestSchema`
Response: `PatientSchema`

### `GET /patients/:patientId`

Response: `PatientSchema`

### `PATCH /patients/:patientId`

Request: `UpdatePatientRequestSchema`
Response: `PatientSchema`

### `GET /patients/:patientId/emergency-contacts`

Response: `EmergencyContactsResponseSchema`

### `POST /patients/:patientId/emergency-contacts`

Request: `CreateEmergencyContactRequestSchema`
Response: `EmergencyContactSchema`

### `PATCH /patients/:patientId/emergency-contacts/:contactId`

Request: `UpdateEmergencyContactRequestSchema`
Response: `EmergencyContactSchema`

### `GET /patients/:patientId/allergies`

Response: `AllergiesResponseSchema`

### `POST /patients/:patientId/allergies`

Request: `CreateAllergyRequestSchema`
Response: `AllergySchema`

### `PATCH /patients/:patientId/allergies/:allergyId`

Request: `UpdateAllergyRequestSchema`
Response: `AllergySchema`

### `GET /patients/:patientId/devices`

Response: `DevicesResponseSchema`

### `POST /patients/:patientId/devices`

Request: `CreateDeviceRequestSchema`
Response: `DeviceSchema`

### `PATCH /patients/:patientId/devices/:deviceId`

Request: `UpdateDeviceRequestSchema`
Response: `DeviceSchema`

---

## 6.4 Clinical records

### `GET /patients/:patientId/providers`

Response: `ProvidersResponseSchema`

### `POST /patients/:patientId/providers`

Request: `CreateProviderRequestSchema`
Response: `ProviderSchema`

### `PATCH /providers/:providerId`

Request: `UpdateProviderRequestSchema`
Response: `ProviderSchema`

### `GET /patients/:patientId/conditions`

Response: `ConditionsResponseSchema`

### `POST /patients/:patientId/conditions`

Request: `CreateConditionRequestSchema`
Response: `ConditionSchema`

### `PATCH /conditions/:conditionId`

Request: `UpdateConditionRequestSchema`
Response: `ConditionSchema`

### `GET /patients/:patientId/medications`

Response: `MedicationsResponseSchema`

### `POST /patients/:patientId/medications`

Request: `CreateMedicationRequestSchema`
Response: `MedicationSchema`

### `PATCH /medications/:medicationId`

Request: `UpdateMedicationRequestSchema`
Response: `MedicationSchema`

### `GET /patients/:patientId/labs`

Response: `LabResultsResponseSchema`

### `POST /patients/:patientId/labs`

Request: `CreateLabResultRequestSchema`
Response: `LabResultSchema`

### `PATCH /labs/:labResultId`

Request: `UpdateLabResultRequestSchema`
Response: `LabResultSchema`

### `GET /patients/:patientId/procedures`

Response: `ProceduresResponseSchema`

### `POST /patients/:patientId/procedures`

Request: `CreateProcedureRequestSchema`
Response: `ProcedureSchema`

### `PATCH /procedures/:procedureId`

Request: `UpdateProcedureRequestSchema`
Response: `ProcedureSchema`

### `GET /patients/:patientId/visits`

Response: `VisitsResponseSchema`

### `POST /patients/:patientId/visits`

Request: `CreateVisitRequestSchema`
Response: `VisitSchema`

### `PATCH /visits/:visitId`

Request: `UpdateVisitRequestSchema`
Response: `VisitSchema`

### `GET /patients/:patientId/symptoms`

Response: `SymptomLogsResponseSchema`

### `POST /patients/:patientId/symptoms`

Request: `CreateSymptomLogRequestSchema`
Response: `SymptomLogSchema`

### `PATCH /symptoms/:symptomLogId`

Request: `UpdateSymptomLogRequestSchema`
Response: `SymptomLogSchema`

### `GET /patients/:patientId/appointments`

Response: `AppointmentsResponseSchema`

### `POST /patients/:patientId/appointments`

Request: `CreateAppointmentRequestSchema`
Response: `AppointmentSchema`

### `PATCH /appointments/:appointmentId`

Request: `UpdateAppointmentRequestSchema`
Response: `AppointmentSchema`

### `GET /patients/:patientId/tasks`

Response: `TasksResponseSchema`

### `POST /patients/:patientId/tasks`

Request: `CreateTaskRequestSchema`
Response: `TaskSchema`

### `PATCH /tasks/:taskId`

Request: `UpdateTaskRequestSchema`
Response: `TaskSchema`

---

## 6.5 Timeline

### `GET /patients/:patientId/timeline`

Query: `TimelineFilterQuerySchema`
Response: `TimelineResponseSchema`

### `POST /patients/:patientId/timeline/custom-view`

Request: `CreateCustomTimelineViewRequestSchema`
Response:

```ts
z.object({
  question: z.string(),
  items: z.array(TimelineEventSchema),
})
```

---

## 6.6 Documents

### `POST /patients/:patientId/documents`

Multipart upload
Response: `DocumentUploadResponseSchema`

### `GET /patients/:patientId/documents`

Response: `DocumentsResponseSchema`

### `GET /documents/:documentId`

Response: `DocumentSchema`

### `GET /documents/:documentId/pages`

Response: `DocumentPagesResponseSchema`

### `GET /documents/:documentId/extraction-candidates`

Response: `ExtractionCandidatesResponseSchema`

### `POST /documents/:documentId/extraction-candidates/:candidateId/accept`

Request: `AcceptExtractionCandidateRequestSchema`
Response:

```ts
z.object({
  candidate: ExtractionCandidateSchema,
  createdOrUpdatedEntityId: z.string().optional(),
  createdOrUpdatedEntityType: z.string().optional(),
})
```

### `POST /documents/:documentId/extraction-candidates/:candidateId/reject`

Response: `ExtractionCandidateSchema`

### `POST /documents/:documentId/reprocess`

Response:

```ts
z.object({
  queued: z.boolean(),
  documentId: DocumentIdSchema,
})
```

---

## 6.7 Imports

### `POST /patients/:patientId/imports`

Multipart upload
Response: `ImportUploadResponseSchema`

### `GET /patients/:patientId/imports`

Response: `ImportRunsResponseSchema`

### `GET /imports/:importRunId`

Response: `ImportRunSchema`

### `GET /imports/:importRunId/artifacts`

Response: `ImportArtifactsResponseSchema`

### `GET /imports/:importRunId/records`

Response: `ImportRecordsResponseSchema`

### `GET /imports/:importRunId/narrative-sections`

Response: `ImportNarrativeSectionsResponseSchema`

### `GET /imports/:importRunId/conflicts`

Response: `ImportConflictsResponseSchema`

### `POST /imports/:importRunId/conflicts/:conflictId/resolve`

Request: `ResolveImportConflictRequestSchema`
Response: `ImportConflictSchema`

### `POST /imports/:importRunId/reprocess`

Response:

```ts
z.object({
  queued: z.boolean(),
  importRunId: ImportRunIdSchema,
})
```

---

## 6.8 Search

### `GET /patients/:patientId/search`

Query:

```ts
z.object({
  q: z.string().trim().min(1).max(200),
  limit: z.coerce.number().int().min(1).max(100).default(25),
  offset: z.coerce.number().int().min(0).default(0),
})
```

Response: `SearchResponseSchema`

---

## 6.9 Summaries and exports

### `POST /patients/:patientId/summaries`

Request: `CreateSummaryRequestSchema`
Response: `SummaryExportSchema`

### `GET /patients/:patientId/summaries`

Response: `SummaryExportsResponseSchema`

### `POST /patients/:patientId/exports/binder`

Request: `CreateBinderExportRequestSchema`
Response: `SummaryExportSchema`

---

## 6.10 Sharing and emergency

### `POST /patients/:patientId/share-links`

Request: `CreateShareLinkRequestSchema`
Response: `ShareLinkSchema`

### `DELETE /share-links/:shareLinkId`

Response: `204 No Content`

### `GET /share-links/:token`

Response:

```ts
z.object({
  valid: z.boolean(),
  scope: ShareScopeSchema.optional(),
  patientId: PatientIdSchema.optional(),
})
```

### `GET /emergency/:token`

Response: `EmergencyViewSchema`

---

## 6.11 Ask the record

### `POST /patients/:patientId/query`

Request: `RecordQueryRequestSchema`
Response: `RecordQueryResponseSchema`

### `GET /patients/:patientId/saved-queries`

Response: `SavedQueriesResponseSchema`

---

## 7. Search query behavior

The search endpoint should union results from:

1. `document_page_fts`
2. `import_narrative_fts`
3. `timeline_event_fts`
4. direct SQL over structured tables for:

   * medications
   * conditions
   * providers
   * labs
   * visits
   * procedures

Return normalized result objects shaped as `SearchResultSchema`.

Recommended ranking order:

1. exact structured match
2. document/import FTS BM25 score
3. timeline event match

---

## 8. Important service-layer rules

## 8.1 Auth

* hash passwords with Argon2id
* store sessions in `sessions`
* revoke on logout by setting `revoked_at`

## 8.2 Patient authorization

Every patient-scoped route must verify:

* user is authenticated
* user belongs to household
* patient-level override does not block access
* share link scope is honored for token-based access

## 8.3 Document ingestion

On upload:

* store raw file first
* create `documents` row
* enqueue `OCR_DOCUMENT`
* enqueue `PARSE_DOCUMENT`
* enqueue `INDEX_DOCUMENT`

## 8.4 Import ingestion

On upload:

* store raw import file first
* create `import_runs` row
* if ZIP, enqueue `UNPACK_IMPORT_PACKAGE`
* then `PARSE_IMPORT`
* then `NORMALIZE_IMPORT_RECORDS`

## 8.5 Timeline projection

Timeline must be rebuilt from canonical records, not hand-edited except for `CUSTOM` events.

## 8.6 Share links

Only store `token_hash`, never the raw token.

---

## 9. Suggested shared file layout

```text
packages/shared/src/contracts/
  common.ts
  enums.ts
  auth-households.ts
  patients.ts
  clinical.ts
  timeline.ts
  documents.ts
  imports.ts
  features.ts
  index.ts
```

Recommended `index.ts`:

```ts
export * from "./common";
export * from "./enums";
export * from "./auth-households";
export * from "./patients";
export * from "./clinical";
export * from "./timeline";
export * from "./documents";
export * from "./imports";
export * from "./features";
```

---

## 10. Definition of done for this contract pack

Claude Code / Cursor should treat this document as complete when:

* all migrations exist and run cleanly on SQLite
* all shared Zod schemas compile
* all API routes validate with these schemas
* all DTOs returned by backend satisfy these contracts
* React forms use the same schemas or derived client-safe versions
* seed data inserts valid rows for each main table
* tests cover at least one happy-path CRUD flow per major entity

---

## 11. The two next files I would generate after this

After this schema/API pack, the next most useful two documents are:

### 1. `SEED_DATA_AND_FIXTURE_PACK.md`

This would define:

* one demo household
* one complex patient
* one digital PDF
* one scan needing OCR
* one XML import
* one ZIP import
* expected parsed results

That makes coding agents much faster because they can build against real fixtures.

### 2. `SPRINT_1_EXECUTION_PACK.md`

This would turn the blueprint into:

* exact first tickets
* acceptance tests
* prompts to give Claude/Cursor per ticket
* review checklist per ticket

The highest-value next move is the **Seed Data + Fixture Pack**, because it removes a lot of guesswork from OCR, import parsing, search, summaries, and the query system.
