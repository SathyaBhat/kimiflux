#!/usr/bin/env node
/**
 * Update changelog script
 * Usage: node update.js <section> <description>
 */

const fs = require('fs');
const path = require('path');

const CHANGELOG_PATH = path.resolve('CHANGELOG.md');

// Map section aliases
const SECTION_MAP = {
  'add': 'Added',
  'added': 'Added',
  'new': 'Added',
  'fix': 'Fixed',
  'fixed': 'Fixed',
  'bug': 'Fixed',
  'bugfix': 'Fixed',
  'change': 'Changed',
  'changed': 'Changed',
  'update': 'Changed',
  'remove': 'Removed',
  'removed': 'Deleted',
  'delete': 'Removed',
  'drop': 'Removed',
  'deprecate': 'Deprecated',
  'deprecated': 'Deprecated',
  'security': 'Security',
};

function detectSection(description) {
  const lower = description.toLowerCase();
  if (lower.match(/\b(fix|bug|resolve|correct|repair)/)) return 'Fixed';
  if (lower.match(/\b(add|create|implement|introduce|new)\b/)) return 'Added';
  if (lower.match(/\b(remove|delete|drop|eliminate)\b/)) return 'Removed';
  if (lower.match(/\b(update|change|modify|rename|improve|refactor)\b/)) return 'Changed';
  if (lower.match(/\b(deprecate)\b/)) return 'Deprecated';
  if (lower.match(/\b(security|vulnerability|exploit|cve)\b/)) return 'Security';
  return 'Changed';
}

function updateChangelog(section, description) {
  // Normalize section
  const normalizedSection = SECTION_MAP[section.toLowerCase()] || section;
  
  let content = '';
  try {
    content = fs.readFileSync(CHANGELOG_PATH, 'utf8');
  } catch {
    // Create new changelog
    content = `# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

`;
  }

  // Find or create Unreleased section
  let unreleasedMatch = content.match(/## \[?Unreleased\]?/);
  if (!unreleasedMatch) {
    // Add Unreleased section at the top
    content = content.replace(
      /(# Changelog.*\n(?:\n.*\n)?)/,
      `$1\n## [Unreleased]\n\n`
    );
  }

  // Find the section within Unreleased
  const sectionPattern = new RegExp(`(### ${normalizedSection}\\n)([\\s\\S]*?)(?=\\n## |\\n### |\\n---|$)`);
  const entry = `- ${description}\n`;

  if (sectionPattern.test(content)) {
    // Section exists, add entry at the top
    content = content.replace(sectionPattern, `$1${entry}$2`);
  } else {
    // Create new section after Unreleased header
    const unreleasedPattern = /## \[?Unreleased\]?\n\n/;
    content = content.replace(
      unreleasedPattern,
      `## [Unreleased]\n\n### ${normalizedSection}\n${entry}\n`
    );
  }

  fs.writeFileSync(CHANGELOG_PATH, content);
  console.log(`✓ Added to [Unreleased] -> ${normalizedSection}: ${description}`);
}

// Parse arguments
const args = process.argv.slice(2);
let section, description;

if (args.length === 0) {
  console.error('Usage: node update.js <section> <description>');
  console.error('   or: node update.js <description> (auto-detects section)');
  process.exit(1);
}

if (args.length === 1) {
  // Single argument - auto-detect section
  description = args[0];
  section = detectSection(description);
} else {
  // Two arguments - use provided section
  section = args[0];
  description = args.slice(1).join(' ').replace(/^["']|["']$/g, '');
}

updateChangelog(section, description);
