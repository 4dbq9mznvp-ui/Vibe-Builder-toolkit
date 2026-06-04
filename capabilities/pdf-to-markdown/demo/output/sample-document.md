# Quarterly Builder Notes

**Owner:** Mina  
**Date:** 2026-06-04

## Summary

This document collects rough notes from a solo builder project. It includes goals, blockers, and a small metrics table.

## Goals

- Ship a small capability-card demo.
- Keep third-party execution out of scope.
- Produce a Codex-ready prompt for the next build step.

## Metrics

| Metric | Value | Notes |
|---|---:|---|
| Capability cards | 6 | Static registry |
| Fixture demos | 3 | No external tools |
| Tests | 16 | Node test runner |

## Open Questions

1. Which cards deserve real local runners first?
2. How should sensitive documents be handled?

## Review Notes

- This fixture demonstrates the expected Markdown shape.
- It does not prove MarkItDown extraction quality.
- A real runner should warn before processing untrusted or sensitive files.
