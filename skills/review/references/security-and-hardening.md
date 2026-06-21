# Security and Hardening Reference

Use this reference during review when a change touches untrusted data, authentication, authorization, sessions, secrets, PII, payments, database queries, file uploads, webhooks, server-side URL fetches, external integrations, dependencies, infrastructure configuration, or LLM/agent features.

## Threat-Model First

Before judging individual lines, spend a few minutes thinking like an attacker:

1. **Map trust boundaries.** Include HTTP requests, forms, file uploads, webhooks, third-party APIs, message queues, config files, logs, fetched web pages, uploaded documents, and LLM output.
2. **Name assets.** Include credentials, tokens, PII, payment data, tenant data, admin actions, money movement, infrastructure access, proprietary data, and tool permissions.
3. **Run STRIDE quickly.** Check spoofing, tampering, repudiation, information disclosure, denial of service, and elevation of privilege.
4. **Write abuse cases.** Ask how a malicious user, tenant, integration, or prompt could misuse the feature.

If you cannot name the trust boundary, asset, and abuse case, keep investigating before approving a sensitive change.

## Boundary Rules

### Always Require

- Validate all external input at the system boundary before it enters business logic.
- Parameterize database queries and avoid string-built SQL/NoSQL predicates.
- Encode or escape output for its destination; do not bypass framework escaping with untrusted content.
- Enforce authentication and authorization at the resource/action boundary.
- Keep secrets out of source, logs, prompts, client-readable storage, and committed config.
- Use secure session cookies where applicable: `httpOnly`, `secure`, and `sameSite`.
- Use TLS for external communication and verify webhook/API signatures where relevant.
- Set appropriate security headers such as CSP, HSTS, frame protection, and content-type protection.
- Limit request sizes, file sizes, payload sizes, token use, and loop/recursion depth on exposed surfaces.
- Review new dependencies for maintenance, vulnerabilities, install scripts, typosquatting, and license compatibility.

### Require Human Justification

- New authentication flows or changes to auth logic.
- New categories of sensitive data collection or storage.
- New external service integrations, callbacks, webhooks, or server-side URL fetches.
- CORS, CSP, cookie, session, or rate-limit changes.
- File upload handlers or document ingestion.
- Elevated permissions, roles, tenant boundaries, or admin paths.
- LLM/agent tools that can read, write, execute, spend money, send messages, or mutate user data.

### Reject by Default

- Committed secrets, credentials, tokens, private keys, or `.env` values.
- Sensitive data in logs, analytics, errors, prompts, or traces.
- Client-side validation used as the only security boundary.
- `eval`, shell execution, SQL execution, DOM HTML, or file path construction from untrusted or model-generated content.
- Wildcard CORS with credentials or broad origins on sensitive APIs.
- Stack traces or internal errors exposed to users.
- Authentication tokens stored in localStorage or other script-readable storage without a very strong reason.

## High-Risk Review Areas

### Injection

Flag user-controlled data reaching SQL, NoSQL, shells, templates, file paths, expression evaluators, or command/tool arguments without schema validation and allowlisting. Prefer parameterized queries and explicit command allowlists.

### Broken Access Control

Check object-level authorization, not just authentication. A user who is logged in still must be authorized for the specific tenant, resource, role, and action.

### XSS and Output Handling

Treat user content, Markdown, HTML, third-party content, and LLM output as untrusted. Prefer framework auto-escaping. If HTML rendering is required, require sanitization and clear allowed tags/attributes.

### SSRF and External Fetches

Any server-side fetch influenced by a user, webhook, document, or model is SSRF-prone. Require scheme and host allowlists, reject private/reserved IPs, handle redirects deliberately, set timeouts, and consider DNS rebinding for high-risk surfaces.

### File Uploads and Document Ingestion

Require file size limits, allowed MIME/content checks, storage isolation, safe filenames, active-content controls, malware scanning when appropriate, and tenant-aware access controls.

### Secrets and Sensitive Data

Check that secrets come from environment or a secret manager, not code. Check that API responses omit password hashes, reset tokens, internal IDs where sensitive, full payment details, and cross-tenant data. If a secret was committed, require rotation, not just deletion.

### Sessions and Auth

Check password hashing with a modern slow hash, token expiry, password reset expiry, rate limits on auth endpoints, CSRF protections where cookies are used, and generic auth errors that do not reveal account existence unnecessarily.

### Supply Chain

For new dependencies, ask whether the existing stack or standard library already solves the problem. Check maintenance, known vulnerabilities, lockfile impact, bundle/runtime cost, install scripts, and license. Treat every dependency as attack surface.

### LLM and Agent Features

Treat all model output as untrusted. Do not rely on prompts as a security boundary. Enforce permissions in code, scope tools narrowly, require confirmation for destructive or irreversible actions, keep secrets and other users' data out of prompts, bound token/cost/loop usage, and partition retrieval data by tenant.

## Security Finding Quality

For each security finding:

- Name the trust boundary and the asset at risk.
- Describe a concrete abuse case.
- Identify the changed line or new path that creates the risk.
- Recommend the control at the right layer: validation, authorization, parameterization, encoding, allowlisting, rate limiting, or least privilege.
- Avoid vague claims like "sanitize this"; state what validation or encoding the destination requires.

## Review Checklist

### Authentication and Authorization

- [ ] Protected routes enforce authentication.
- [ ] Object-level and action-level authorization are checked.
- [ ] Admin and elevated actions require explicit role/permission checks.
- [ ] Session cookies and token lifetimes are appropriate.
- [ ] Auth endpoints have rate limiting and generic error behavior.

### Input and Output

- [ ] External input is schema-validated at the boundary.
- [ ] Database queries are parameterized.
- [ ] HTML/Markdown/rendered output is encoded or sanitized.
- [ ] Server-side URL fetches are allowlisted and protected from SSRF.
- [ ] File uploads are constrained by type, size, content, storage, and access controls.

### Data and Secrets

- [ ] No secrets appear in code, logs, prompts, or version control.
- [ ] Sensitive fields are excluded from responses and traces.
- [ ] Cross-tenant data cannot be retrieved or inferred.
- [ ] PII/payment data storage and transmission are justified and protected.

### Infrastructure and Dependencies

- [ ] CORS and security headers are appropriately restrictive.
- [ ] Error responses do not expose internals.
- [ ] New dependencies are necessary, maintained, and vulnerability-reviewed.
- [ ] Lockfiles and reproducible install practices are preserved.

### AI / LLM

- [ ] Model output is parsed, schema-validated, and allowlisted before use.
- [ ] Prompt injection cannot override code-level permissions.
- [ ] Tool permissions are least-privilege and destructive actions require confirmation.
- [ ] Retrieval data is tenant-isolated and poisoned content cannot steer privileged behavior.
