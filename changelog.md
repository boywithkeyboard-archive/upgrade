## [v0.3.0](https://github.com/azurystudio/upgrade/releases/tag/v0.3.0)

- fix: determine latest semver
  ([#3](https://github.com/azurystudio/upgrade/pull/3))

  Previously, only the latest version was retrieved. In some rare cases the
  latest version is not the latest semver version, thus the URL should not be
  updated to that version, but instead an attempt should be made to locate the
  latest semver version.
- refactor: check semver difference
  ([#4](https://github.com/azurystudio/upgrade/pull/4))

## [v0.2.0](https://github.com/azurystudio/upgrade/releases/tag/v0.2.0)

- feat: add cli arguments ([#2](https://github.com/azurystudio/upgrade/pull/2))
- refactor: simplify log ([#1](https://github.com/azurystudio/upgrade/pull/1))
