# Branching Strategy and CI Flow

This document defines the branching model, promotion lifecycle, and CI/CD automation rules for SubTracker.

## The Three Branches

The repository maintains three long-lived branches:

1. **`development`**: Active feature development. All daily engineering tasks, feature work, and bugfixes originate here or in short-lived branches merging here.
2. **`testing`**: Integration and pre-release verification. Changes promoted from `development` are integrated and tested against local emulators and suites before reaching production.
3. **`production`**: The live release branch. Reflects the exact code deployed to GitHub Pages and production Firebase services.

## Promotion Flow

Work flows strictly forward:
