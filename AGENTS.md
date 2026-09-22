# Project instructions

This is a Vite static PWA for a Vaundy fan guide. Work from source files; `dist/` is generated output. Preserve existing user changes and keep each patch limited to the requested scope.

## Workflow

1. Inspect `git status --short --branch`, the relevant files, and `package.json` before editing. Read `DESIGN.md` for visual or accessibility work and the relevant `README.md` section for user-facing behavior. Done when the affected files and verification command are clear.
2. Edit the source of truth: content and timing in `src/data.js` or `src/chant-guide.js`; readings in `src/furigana-corrections.js` and `furigana.js`; karaoke timing in `karaoke-sources.js`; app behavior in `src/main.js`; styles and icons in `src/*.css` and `src/ui/icons.js`; caching and packaging in `sw.js` and `vite.config.js`. Preserve the spoiler gate and the non-official status of reference setlist data. Done when the intended source files express the complete change.
3. Verify the result: run `npm run check:lyrics` for lyric or romaji changes, `npm run build` for application changes, and `git diff --check` for every text change. Inspect the final diff and status. Done when all applicable checks pass and only intentional files changed.

## Explicit release requests

When the user asks to publish, release, or deploy:

1. Inspect status, remotes, and the upstream branch; resolve release scope before staging. Done when unrelated work is excluded.
2. Update `CHANGELOG.md` from the complete release scope. Use Traditional Chinese, follow its existing version-commit boundary and link format, put the newest section at the top, and cover every user-visible change in the release. Resolve every song name through the Japanese original title in `src/data.js` (for example, `〈不可幸力〉` and `〈恋風邪にのせて〉`) before writing it. Done when the new section is complete, uses Japanese song titles, and contains no placeholder commit links.
3. Bump the next patch version unless another version is requested. Synchronize `package.json`, both root version fields in `package-lock.json`, `src/main.js` (`BUILD`), and `sw.js` (`CACHE_VERSION`). Done when every shipped version marker matches.
4. Run `npm run build` and `git diff --check`. Done when both succeed.
5. Stage only the approved release files, create `chore(release): publish guide vX.Y.Z`, push to upstream, and verify the remote branch contains the new full commit SHA. If the changelog heading links to the release commit, fill in the final full SHA and amend the release commit before pushing. Done when the remote readback matches and the changelog has the final commit link; report the version, subject, and commit URL only then.
