# Publishing workflow security

The publish and build/test workflows pin external actions to full commit SHAs.
Dependabot checks GitHub Actions weekly. Publishing inputs and step outputs enter
shell scripts through environment variables, not generated shell source. PR and
build numbers must be positive integers without leading zeroes.

## Required GitHub configuration

No new secret or environment is required by this change. Automatic dev publishing
after a successful master build and manual PR prereleases remain enabled.

1. Merge this PR into the default branch (`master`). Dependabot reads
   `.github/dependabot.yml` there and creates action-update PRs automatically.
   Review updates before merging; a SHA pin does not make the pinned code trusted.
2. Under **Settings > Actions > General**, ensure Actions are enabled and your
   action allowlist, if configured, permits `actions/checkout`,
   `actions/setup-node`, `pnpm/action-setup`, and `coactions/setup-xvfb`.
   Keep the default workflow token permissions read-only. The publish job declares
   its required `contents: read` and `id-token: write` explicitly.
3. Keep `DISCORD_WEBHOOK_NPM_RELEASES` as an Actions repository secret if Discord
   notifications are wanted. No npm publish token needs to be added.
4. Recommended: protect `master` with a ruleset requiring PR review and the
   existing build/test checks. Limit bypass access, and review workflow changes
   as security-sensitive code. Do not require a publish check before merge.

Dependabot PR workflows do not receive ordinary Actions secrets. If their tests
need LambdaTest credentials, provide appropriately scoped Dependabot secrets
under **Settings > Secrets and variables > Dependabot**, rather than exposing
repository secrets to untrusted code.

## Verify npm trusted publishers

In each package's npm settings, verify its GitHub Actions trusted publisher:

- Organization: `dexie`
- Repository: `Dexie.js`
- Workflow filename: `publish.yml` (not its full path)
- Environment: unset, because this workflow does not select an environment
- Allow direct `npm publish` if npm presents an allowed-actions selector

Packages: `dexie`, `dexie-cloud-common`, `dexie-react-hooks`, `dexie-svelte-query`,
`dexie-export-import`, `y-dexie`, and `dexie-cloud-addon`.

Existing working trusted publishers do not need to be recreated for this PR.
After verifying trusted publishing, consider npm's **Require two-factor
authentication and disallow tokens** publishing-access setting and revoke unused
automation tokens. Check other release workflows before disabling token access.

## Optional manual approval gate

This PR deliberately does not add an environment approval gate: required
reviewers would pause every automatic dev publish too.

To require approval for all publishing later:

1. Create an environment named `npm-publish` under **Settings > Environments**.
2. Add required reviewers, prevent self-review, and disable administrator bypass
   if those controls are available for the repository's plan.
3. Configure allowed deployment branches. Allow `master` and any trusted branches
   used for manual PR prereleases. Selecting only protected branches may block
   the current manual prerelease workflow.
4. Add `environment: npm-publish` to `jobs.publish` in the workflow.
5. Replace the npm trusted publisher for each package with one bound to the exact
   environment name `npm-publish`; remove the old environment-unrestricted
   publisher. Coordinate this with the workflow change to avoid failed publishes.
   Current npm documentation requires a newly configured publisher to complete
   its first successful publish within two days.

Creating an environment alone does not protect a job. Both the workflow's
environment selection and npm's environment restriction are needed. Manual
publishing still runs code from the selected branch, including install/build
scripts, so approve only branches and commits that have been reviewed.

## Local regression tests

Run `node --test .github/tests/publish-workflow.test.cjs` from the repository root.
The tests execute the workflow's shell scripts with mocked npm/pnpm/curl commands
and temporary package fixtures. They do not publish packages or contact Discord.

References:

- [npm trusted publishing](https://docs.npmjs.com/trusted-publishers)
- [Dependabot for GitHub Actions](https://docs.github.com/en/code-security/dependabot/working-with-dependabot/keeping-your-actions-up-to-date-with-dependabot)