## 2026-01-22 - Keyboard Inaccessible Action Cards
**Learning:** The application frequently uses `div` elements with `onclick` handlers for primary navigation actions (like "Take Test"), rendering them inaccessible to keyboard users (no tab focus, no Enter/Space support).
**Action:** For similar existing components, add `role="button"`, `tabindex="0"`, and keyboard event listeners (Enter/Space). For new components, always use semantic `<button>` or `<a>` tags.
