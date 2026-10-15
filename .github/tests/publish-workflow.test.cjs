const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const { test } = require('node:test');

const root = path.resolve(__dirname, '../..');
const workflow = fs.readFileSync(path.join(root, '.github/workflows/publish.yml'), 'utf8');

function stepScript(name) {
  return workflow.split(`      - name: ${name}\n`)[1]
    .split('        run: |\n')[1]
    .split('\n      - name:')[0]
    .split('\n').map(line => line.slice(10)).join('\n');
}

const publish = stepScript('Publish packages');
const notify = stepScript('Notify via Discord (PR mode only)');

function run(script, env = {}, cwd = root) {
  return spawnSync('bash', ['-e', '-o', 'pipefail', '-c', script], {
    cwd,
    env: { ...process.env, ...env },
    encoding: 'utf8'
  });
}

test('publish and notification scripts are valid bash without inline expressions', () => {
  for (const script of [publish, notify]) {
    assert.equal(spawnSync('bash', ['-n'], { input: script }).status, 0);
    assert(!script.includes('${{'));
  }
});

test('all actions in the publish and test workflows are SHA-pinned', () => {
  for (const name of ['publish', 'main']) {
    const source = fs.readFileSync(path.join(root, `.github/workflows/${name}.yml`), 'utf8');
    const actions = [...source.matchAll(/uses:\s+(\S+)/g)];
    assert(actions.length > 0);
    for (const [, action] of actions) assert.match(action, /@[a-f0-9]{40}$/);
  }
});

test('mode and numeric version components are validated before publishing', () => {
  const validation = publish.split('PUBLISHED_VERSIONS=""')[0] + '\n:';
  const cases = [
    ['pr', '2253', '1', 0],
    ['dev', '', '', 0],
    ['other', '', '', 1],
    ['pr', '', '1', 1],
    ['pr', '$(exit 99)', '1', 1],
    ['pr', '01', '1', 1],
    ['pr', '2253', '', 1],
    ['pr', '2253', '0', 1],
    ['pr', '2253', '01', 1],
    ['pr', '2253', "1';process.exit(0);//", 1]
  ];
  for (const [MODE, PR, BUILD, expected] of cases) {
    const result = run(validation, { MODE, PR, BUILD, PACKAGES: 'all' });
    assert.equal(result.status, expected, result.stdout + result.stderr);
  }
});

test('PR and dev publishing preserve versions and produce expected output', () => {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'dexie-publish-test-'));
  try {
    fs.writeFileSync(path.join(temp, 'package.json'), '{"version":"1.0.0"}');
    for (const MODE of ['pr', 'dev']) {
      const output = path.join(temp, `output-${MODE}`);
      const result = run(`
        pnpm() { printf 'MOCK_PUBLISH %s %s\\n' "$*" "$(node -p 'require(\"./package.json\").version')"; }
        npm() { return 1; }
        ${publish}
      `, { MODE, PR: '2253', BUILD: '1', PACKAGES: 'dexie', GITHUB_OUTPUT: output }, temp);
      assert.equal(result.status, 0, result.stdout + result.stderr);
      const version = MODE === 'pr' ? '1.0.0-pr2253.1' : '1.0.0';
      const tag = MODE === 'pr' ? 'pr2253' : 'dev';
      assert(result.stdout.includes(`MOCK_PUBLISH publish --tag ${tag} --provenance --no-git-checks ${version}`));
      assert(fs.readFileSync(output, 'utf8').includes(`npm install dexie@${version}`));
      assert.equal(JSON.parse(fs.readFileSync(path.join(temp, 'package.json'))).version, '1.0.0');
    }
  } finally {
    fs.rmSync(temp, { recursive: true, force: true });
  }
});

test('notification keeps command-like inputs literal and sends JSON content', () => {
  for (const OUTCOME of ['success', 'failure']) {
    const result = run('curl() { cat; }\n' + notify, {
      OUTCOME,
      PR: '2253',
      REQUESTER: '123456789',
      VERSIONS: '\n- `npm install dexie@1.0.0-pr2253.1` $(exit 99)',
      GITHUB_REF_NAME: 'test/$(exit 99)',
      GITHUB_SERVER_URL: 'https://github.com',
      GITHUB_REPOSITORY: 'dexie/Dexie.js',
      GITHUB_RUN_ID: '123',
      DISCORD_WEBHOOK: 'https://example.invalid'
    });
    assert.equal(result.status, 0, result.stderr);
    const { content } = JSON.parse(result.stdout);
    assert(content.includes('https://github.com/dexie/Dexie.js/actions/runs/123'));
    if (OUTCOME === 'success') {
      assert(content.includes('`npm install dexie@1.0.0-pr2253.1` $(exit 99)'));
      assert(content.includes('test/$(exit 99)'));
      assert(content.includes('<@123456789>'));
    } else {
      assert(content.includes('FAILED'));
    }
  }
});