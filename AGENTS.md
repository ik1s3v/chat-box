# AGENTS.md

# Project Overview

This project is a Widy application built with **React**, **TypeScript**, and **Rsbuild**.

The project consists of **two independent entry points**:

* `src/control`
* `src/view`

Each directory contains its own Rsbuild application.

---

# Build Configuration

Never create additional Rsbuild configs.

Use existing configurations:

* `rsbuild.config.control.ts`
* `rsbuild.config.view.ts`

---

# Project Structure

```
src/
    control/
        ...
    view/
        ...
```

Both folders represent separate application entry points.


---

# Manifest

The application manifest is located at:

```
manifest.json
```

Example:

```json
{
  "manifest_version": 1,
  "id": "chat-box",
  "name": "chat-box",
  "version": "1.0.0"
}
```

Do not change the manifest unless explicitly requested.

---

# Tech Stack

* TypeScript
* React
* Rsbuild

---

# Libraries

The project already uses:

* `@widy/sdk`
* `@widy/react`

Prefer existing APIs from these packages.

Do not replace them with custom implementations.

---

# SDK Usage

`@widy/sdk` is the source of truth.

Always prefer:

* types
* interfaces
* enums

Do not duplicate SDK types.

Do not redefine enums already provided by the SDK.

Always import them from `@widy/sdk`.

---

# React Usage

Use modern React.

Prefer:

* functional components
* hooks
* composition

Avoid class components.

---

# Coding Style

Follow the existing code style.

Prefer:

* small components
* readable code
* descriptive names
* early returns

Avoid deeply nested conditions.

Avoid duplicated logic.

---

# Imports

Prefer absolute or existing project import style.

Keep imports organized.

Remove unused imports.

---

# Dependencies

Do not introduce new dependencies unless explicitly requested.

Always prefer existing project libraries.

---


# Refactoring Rules

Safe refactoring is encouraged when:

* behavior stays unchanged
* duplicated code is reduced
* readability improves

Avoid unnecessary architectural changes.

---

# Before Finishing

Before considering a task complete:

* ensure TypeScript has no obvious type errors
* remove unused code
* remove unused imports
* keep formatting consistent
* preserve existing project structure

---

# When Implementing Features

Unless instructed otherwise:

1. Reuse existing SDK types.
2. Reuse existing React components.
3. Avoid creating duplicate abstractions.
4. Keep changes minimal.
5. Do not modify unrelated files.

---

# Forbidden

Do NOT:

* introduce another UI framework
* replace React
* replace Rsbuild
* replace `@widy/sdk`
* replace `@widy/react`
* duplicate SDK models or enums
* change `manifest.json` unless explicitly requested
