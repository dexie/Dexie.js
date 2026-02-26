# CI Publishing Setup Guide

## Overview
This document describes how to set up automated CI publishing for Dexie.js packages using npm Trusted Publishing with OIDC.

## Benefits
- **No secrets needed**: Uses OIDC tokens instead of long-lived NPM_TOKEN
- **Automatic provenance**: Packages get cryptographic proof of where they were built
- **More secure**: Short-lived tokens that can't be extracted or reused

## Setup Steps

### 1. GitHub Workflow (Already Created)
File: `.github/workflows/publish-ci.yml`
- Triggers after successful "Build and Test" workflow on master
- Uses `id-token: write` permission for OIDC
- Publishes packages with `--tag ci`

### 2. Configure Trusted Publishing on npmjs.com (Manual Step)

For each package that needs CI publishing, go to npmjs.com and configure:

#### dexie-cloud-common
- Navigate to: https://www.npmjs.com/package/dexie-cloud-common/access
- Settings → Trusted Publisher → GitHub Actions
- Configure:
  - Organization: `dexie`
  - Repository: `Dexie.js`
  - Workflow filename: `publish-ci.yml`
  - Environment: (leave empty)

#### dexie
- Navigate to: https://www.npmjs.com/package/dexie/access
- Same configuration as above

#### dexie-cloud-addon
- Navigate to: https://www.npmjs.com/package/dexie-cloud-addon/access
- Same configuration as above

### 3. Alternative: Use NPM_TOKEN (Fallback)

If trusted publishing isn't set up yet, the workflow can use a traditional token:

1. Create a granular access token on npmjs.com with publish access
2. Add it as a repository secret named `NPM_TOKEN`
3. Modify the workflow to use:
   ```yaml
   env:
     NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
   ```

## Version Scheme

CI versions follow the pattern:
```
<base-version>-ci.<timestamp>.<short-sha>
```

Example: `1.0.58-ci.20260212090000.abc1234`

## Usage

Install CI packages:
```bash
npm install dexie@ci dexie-cloud-addon@ci
```

Or specific version:
```bash
npm install dexie-cloud-common@1.0.58-ci.20260212090000.abc1234
```

## E2E Test Integration

The dexie-cloud E2E tests can use CI packages by:
1. Updating package.json to use `@ci` tag
2. Or pinning to a specific CI version

Example in dexie-cloud/e2e/package.json:
```json
{
  "dependencies": {
    "dexie": "ci",
    "dexie-cloud-addon": "ci"
  }
}
```
