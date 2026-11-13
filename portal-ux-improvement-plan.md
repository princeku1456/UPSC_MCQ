# MCQ Practice Portal: UI/UX Improvement Plan

**Scope:** User portal (`index.html`, `quiz.js`, `practice.js`, `dashboard.js`, `auth.js`, `utils.js`, `styles.css`, `config.js`) and Admin portal (`admin.html`, `admin.js`).
**Focus area:** the Take Test flow (Subjects → Chapters → Start modal → Test screen → Submit → Result → Review).
**Basis:** code review of the uploaded files and the SWOT analysis.

---

## 0. How to use this plan

- Every item has an ID (e.g. `P0-1`) so it can be tracked as a ticket.
- **Priority:** P0 = bug or trust issue, fix first. P1 = high-impact UX. P2 = polish or growth. P3 = long-term.
- **Effort:** S = under 0.5 day, M = 1–3 days, L = 4+ days.
- Status column: ☐ Not started · ◐ In progress · ☑ Done.

---

## 1. Summary of the plan

| Phase | Theme | Timeline | Outcome |
|---|---|---|---|
| Phase 1 | Fix bugs and build trust | Days 1–2 | Scoring is correct, rules are visible, submit is safe |
| Phase 2 | Test-screen and mobile experience | Week 1–2 | Usable on phones, accessible, clear palette |
| Phase 3 | Selection screens, dashboard, auth | Week 2–3 | Faster decisions, less clutter |
| Phase 4 | Insights and engagement | Week 3–5 | Calibration insights, recommendations, streaks |
| Phase 5 | Platform, admin, performance, security | Week 5–7 | Cleaner codebase, secure admin, offline-ready |

---

## 2. Phase 1: Bugs and trust (Days 1–2)

### P0-1 · Fix "confidence-only" answers being scored as wrong ☐ · S
- **Problem:** Clicking a confidence level before choosing an option creates `userAnswers[i] = { answer: -1, surety: x }`. The palette marks it "attempted" and `submitAll()` scores it as incorrect (−0.66).
- **Files:** `quiz.js` (`renderQuestion`, `updateNavHighlights`, `submitAll`, stats counters in the transaction).
- **Fix:**
  - Treat a question as attempted only when `answer` is a valid index (`typeof answer === "number" && answer >= 0`).
  - Apply the same rule to the palette, to `correctCounts` / `attemptedCounts`, and in review mode.
  - Optionally store confidence separately from the answer.
- **Acceptance:** Rating confidence without answering leaves the question "Unattempted", scores 0, and the palette stays unattempted.

### P0-2 · Show the rules before the test starts ☐ · S
- **Problem:** The start modal doesn't mention marking scheme, confidence, pause, or auto-submit.
- **Files:** `index.html` (start modal), `quiz.js` (`showStartModal`, `updateStartModal`).
- **Fix:** Add a compact "Test rules" block:
  - +2 for correct, −0.66 for wrong, 0 for unattempted (read values from one constant).
  - How the confidence rating works and why it matters.
  - Timer behaviour, pause rule, auto-submit when time ends.
  - Progress is auto-saved.
- **Acceptance:** A user can read the full marking scheme before pressing Start.

### P0-3 · Resume vs Start fresh ☐ · S
- **Problem:** Saved progress is silently restored, with only a toast saying "Restored…".
- **Files:** `quiz.js` (`loadQuiz`, `showStartModal`).
- **Fix:** If `quiz_progress_<id>` exists and is under 24h old, the modal shows "You have an unfinished attempt: X answered, Y min left" with **Resume** and **Start fresh** buttons. Start fresh clears the saved progress.
- **Acceptance:** The user chooses explicitly; progress is never restored silently.

### P0-4 · Replace native `confirm()` for submit with a summary modal ☐ · M
- **Files:** `index.html` (new modal), `quiz.js` (`submitAll`).
- **Fix:** A Bootstrap modal showing:
  - Answered / Unattempted / Marked for review counts.
  - "Low confidence answers" count (0% and 50%).
  - Links to jump to unattempted or marked questions.
  - Buttons: "Go back" (primary) and "Submit test" (danger).
  - A stronger warning when time is almost over.
- **Acceptance:** No browser `confirm()` in the test flow; the summary appears every manual submit.

### P0-5 · Confirm on Exit during a test ☐ · S
- **Files:** `index.html` (Exit button), `auth.js` (`exitQuiz`), `quiz.js`.
- **Fix:** If a test is in progress, show a modal: "Progress is saved. Your timer will stop. Exit?" with Stay and Exit buttons.

### P0-6 · Pause abuse policy ☐ · S
- **Files:** `quiz.js` (`toggleTimer`), `utils.js` (`QuizTimer`).
- **Fix (pick one):**
  - Exam mode: no pause.
  - Practice mode: unlimited pause.
  - Default mode: limit to N pauses or M total minutes, and log pause count with the result.
- **Acceptance:** The pause rule is stated in the start modal (see P0-2) and enforced in code.

### P0-7 · Result visibility after submit ☐ · S
- **Problem:** The result card renders below the Prev/Clear/Next row and can be off-screen.
- **Fix:** Scroll the result card into view, or move it to the top of the quiz box. Hide Prev/Clear/Next appropriately.

### P0-8 · Handle failed stats calls ☐ · S
- **Problem:** "Calculating class standing…" has no timeout or failure message; the Firestore write failure only logs to console.
- **Fix:** Add a timeout and a fallback message ("Couldn't load class standing. Your result is saved."). Show a toast if saving the result fails, with a retry option.

### P0-9 · Reduce localStorage write frequency ☐ · S
- **Problem:** `saveQuizProgress()` runs on every timer tick (every second).
- **Fix:** Save on answer, navigation and mark events, and on a throttle (e.g. every 10 s), plus on `beforeunload` and `visibilitychange`.

### P0-10 · Time-sync robustness ☐ · M
- **Problem:** The timer is a decrementing `setInterval`, which drifts when the tab is throttled or the device sleeps.
- **Fix:** Store an absolute end timestamp (`endAt`), compute remaining time as `endAt - Date.now()`, and handle pause by shifting `endAt`.

---

## 3. Phase 2: Test screen and mobile experience (Weeks 1–2)

### P1-1 · Mobile-first test layout ☐ · L
- **Problem:** Under 992px the timer, palette and Submit button sit below the question. `styles.css` has no `@media` rules.
- **Files:** `quiz.js` (`renderQuizLayout`), `styles.css`, `index.html`.
- **Fix:**
  - Sticky compact header on mobile: Q number, timer, pause icon, palette button.
  - Question palette opens in a bottom sheet / offcanvas (Bootstrap Offcanvas).
  - Sticky bottom action bar: Previous · Mark · Clear · Next, with thumb-sized buttons.
  - Reduce `quiz-box` padding (2.5rem → ~1rem on small screens).
- **Acceptance:** On a 360px-wide phone the user always sees the timer and can reach the palette and Next in one tap, without scrolling.

### P1-2 · Fix sticky sidebar offset ☐ · S
- **Problem:** `.quiz-nav-sidebar { top: 2rem }` is less than the sticky navbar height.
- **Fix:** Use a CSS variable (`--navbar-height`) and `top: calc(var(--navbar-height) + 1rem)`; add `max-height` with internal scroll for long palettes.

### P1-3 · Redesign confidence selector ☐ · M
- **Problem:** 75% = red, 50% = yellow, 0% = blue, 100% = green. Red/green imply right/wrong; 0% isn't explained.
- **Files:** `quiz.js` (`renderQuestion`), `styles.css`.
- **Fix:**
  - Add text labels: **100% Sure · 75% Fairly sure · 50% Unsure · 0% Guess**.
  - Use a neutral single-hue scale (light → dark) so colour doesn't suggest correctness.
  - Add a one-line tooltip/help icon: "Rate how sure you are. Used for your confidence analytics."
  - Make the selector optional but gently encouraged (e.g. a small hint on skip).

### P1-4 · Fix colour contrast across the app ☐ · M
- **Problem:** Several combos (e.g. `#ff4000` on `#fce4dc`, `#fa9624` on `#fff2c2`, white on `--accent-color` amber) likely fail WCAG AA.
- **Fix:** Audit with a contrast checker; define accessible token pairs for light and dark themes; ensure 4.5:1 for body text and 3:1 for large text and UI components.

### P1-5 · Palette legend and counters ☐ · S
- **Fix:** Add a legend below the palette: Current · Answered · Marked · Answered + Marked · Not visited · Unattempted. Show counts ("12 answered · 3 marked · 25 left").
- **Also:** Don't rely on colour alone. Add small icons or shapes (e.g. a dot or flag for marked) for colour-blind users.

### P1-6 · Make "Mark for Review" a proper control ☐ · S
- **Problem:** A clipped star shape, 38px, toast on every toggle, full re-render.
- **Fix:**
  - Use a normal button with a bookmark/flag icon and the label "Mark for review" (44px minimum touch target).
  - Remove the toast; the button state and palette change are sufficient feedback.
  - Update only the button and the palette, not the entire question, to avoid scroll jumps.

### P1-7 · Re-order the action row ☐ · S
- **Problem:** Clear sits between Previous and Next with the same weight.
- **Fix:** Layout as `[Previous]  ·····  [Clear] [Next]`, with Clear as a subtle/outline button; Next is primary. Consider "Save & Next" wording.

### P1-8 · Keyboard shortcuts ☐ · M
- **Fix:** `1–4` or `A–D` select an option, `N` / `→` next, `P` / `←` previous, `M` mark, `C` clear, `Shift+S` submit. Show a "Keyboard shortcuts" popover. Disable shortcuts while a modal is open.

### P1-9 · Accessibility pass on the test screen ☐ · M
- Visible `:focus-visible` rings on options, palette items, confidence options and buttons (current CSS only suppresses focus for mouse, check it covers all).
- Use real `<fieldset>/<legend>` for the question and options; announce question changes with `aria-live="polite"`.
- Palette items: `aria-label` includes state ("Question 5, answered, marked").
- Timer: `role="timer"`, with a polite announcement at 10, 5 and 1 minute remaining (not every second).
- Respect `prefers-reduced-motion` (disable pulse, fade-in, palette animation).
- Minimum touch target 44×44px (palette items on small screens, star/pause buttons).

### P1-10 · Timer redesign ☐ · S
- Reduce size on mobile (3.5rem → ~1.5rem in the compact header).
- Remove the heavy text-shadow; use a clear low-time state (colour + icon, not only pulse).
- Place the Pause control in a predictable position (not absolutely positioned in the corner).
- Show "Time spent on this question" subtly (optional, Practice mode).

### P1-11 · Question text and option readability ☐ · S
- Constrain line length (~70 characters), increase line height, and support long statement-type UPSC questions ("Consider the following statements…") with clear numbered-list styling.
- Scrollable quiz box with the question area independently scrollable if the question is long.
- Support images/tables in questions if the data format allows.

### P1-12 · Option selection interaction ☐ · S
- Make the whole option card selectable with a clear selected state (not only the hidden radio).
- Allow deselecting by clicking the selected option again (alternative to "Clear").
- Hover styles should not conflict with the selected state.

### P1-13 · Result screen redesign ☐ · M
- Dedicated result view/card with: score ring, correct / incorrect / unattempted, time taken, average time per question, percentile, accuracy by confidence.
- Primary CTA: "Review answers". Secondary: "Retry mistakes", "Next test", "Back to chapters".
- Show negative-marking impact ("You lost X marks to wrong answers").

---

## 4. Phase 3: Selection screens, dashboard, auth (Weeks 2–3)

### P1-14 · Richer subject cards ☐ · M
- Add: total tests, total questions, average accuracy, last attempted date.
- Add a **Search / filter** field and sort (A–Z, progress, recently used).
- Show a "Continue" chip if any test is in progress.

### P1-15 · Richer chapter (test) cards ☐ · M
- Show: number of questions, estimated duration, last score, best score, last attempt date, status chip (New / In progress / Completed).
- Visual hierarchy: **Start** (primary) for new tests; **Review** primary and **Retake** secondary for completed tests.
- Add filters: All / New / Completed / In progress.

### P1-16 · Single navigation pattern ☐ · S
- Keep breadcrumbs and remove duplicate "← Back" buttons (or keep Back only on mobile).
- Make sure breadcrumb labels are escaped and links are real buttons/anchors without inline `onclick` string concatenation.

### P1-17 · Improve the Revision Test builder ☐ · M
- Add "Select all / Clear", selected-count, and the number of questions available for the chosen filter.
- Let the user choose the number of questions (e.g. 25 / 50 / 100) and time limit.
- Move the entry point to a more visible place (and also from the dashboard).
- Show a loading and empty state ("No incorrect questions in the selected tests").

### P1-18 · "Continue where you left off" ☐ · S
- Add a card at the top of the dashboard: "Continue: Polity – Test 4 (23 min left)" with a Resume button, based on saved localStorage progress.

### P1-19 · Dashboard hierarchy and decluttering ☐ · M
- Put primary actions (Take Test, Practice MCQ, Continue) at the top.
- Keep 4–5 headline stats visible; move the rest into a collapsible "Detailed analytics" section.
- Add tooltips/explanations for **Precision, Neg. Drain, Concept Gap**.
- Add an empty state for new users with a "Take your first test" prompt, instead of zeros everywhere.
- Group charts into tabs (Confidence / Accuracy trend / Subject-wise).

### P1-20 · Strengthen the AI Mentor card ☐ · M
- Define the loading, error and "not available" states clearly (the key is fetched from Firestore, so failures are likely to occur).
- Show a timestamp of the last review and cache it so it isn't regenerated needlessly.
- Add a short disclaimer ("AI-generated, verify with your notes").
- Render output with sanitised markdown (see sanitisation in P3-3).

### P1-21 · Auth screen improvements ☐ · M
- Add **Forgot password** (Firebase `sendPasswordResetEmail`).
- Add **Resend verification email** when login is denied for an unverified email.
- Inline validation and password-strength hint; show clear messages instead of relying only on toasts.
- Replace the `visibility_lock` icon with a standard eye / eye-off pair, with `aria-pressed` and an accessible label.
- Add proper `autocomplete` attributes (`email`, `current-password`, `new-password`).
- Move the Login/Register switch to a tab or segmented control; fix the fragile `.card-body small a` selector.

### P2-1 · Consistent iconography ☐ · M
- Choose a single icon set (recommended: Bootstrap Icons) and replace emoji used as functional icons and Material Symbols.
- Keep emoji only for decorative or celebratory moments, if desired.
- Removing one or two icon fonts also reduces page weight.

### P2-2 · Replace inline styles with classes/tokens ☐ · M
- Move repeated inline styles (star button, timer button, cards, gradients) into named classes in `styles.css`.
- Define design tokens (spacing, radius, shadows, z-index, font sizes) once.

### P2-3 · Consolidate theme CSS ☐ · M
- Merge the duplicated `[data-theme="dark"]` blocks, remove `!important` overrides where possible, and verify every component in both themes.
- Respect `prefers-color-scheme` on first visit, and persist the user's choice.
- Make the theme toggle a proper button with an accessible label and `aria-pressed`.

### P2-4 · Navbar clean-up ☐ · S
- Group "BOR Compilation" under a clearly labelled "Resources" menu; avoid emoji-only labels.
- Add Dashboard / Take Test / Practice / Performance links for quick navigation.
- Make the navbar collapse on small screens (a toggler is missing in the markup).

### P2-5 · Loading, empty and error states everywhere ☐ · M
- Use skeleton loaders for subject/chapter/dashboard data instead of centred spinners.
- Standardise empty states (icon, message, action) and error states (message, retry button).

---

## 5. Phase 4: Insights and engagement (Weeks 3–5)

### P2-6 · Post-test confidence calibration ☐ · M
- Show: "Sure but wrong: N · Unsure but right: N · Guess accuracy: X%".
- Visual: accuracy by confidence band compared with expected (calibration chart).
- Suggest actions ("Review the 6 questions you were 100% sure of but got wrong").

### P2-7 · Time analytics ☐ · M
- Use the existing `questionTimeSpent` to show average time per question, slowest questions, and questions answered in under 10 seconds that were wrong (rushed).
- Compare with the test's allotted time per question.

### P2-8 · "Retry only mistakes" and "Retry unattempted" ☐ · M
- One-click build of a short test from incorrect, unattempted, low-confidence-correct or marked questions of the attempt just completed.

### P2-9 · Smart "Take this next" recommendation ☐ · M
- Use weak subjects, Concept Gap (easy questions missed), Neg. Drain and recency to suggest the next test or topic on the dashboard.

### P2-10 · Exam mode vs Practice mode ☐ · L
- **Exam mode:** strict timer, no pause, no feedback until submit, full-length marking.
- **Practice mode:** pause allowed, optional instant feedback with explanation after each answer.
- Mode selector in the start modal; the mode is stored with the result so analytics can filter by it.

### P2-11 · Streaks, goals and reminders ☐ · M
- Daily goal (questions or minutes), streak counter, weekly summary card.
- Optional email or web-push reminders (needs a backend function).

### P2-12 · Bookmarks and personal notes ☐ · M
- Save questions permanently (not only "mark for review" within one attempt).
- Add an optional note per question; a "My bookmarks" practice set.

### P2-13 · Review mode improvements ☐ · M
- Filters (All / Correct / Incorrect / Unattempted / Marked / Low confidence) with counts; sticky filter bar.
- Show your answer, correct answer, confidence, time spent and explanation together on each question.
- Add "Report an issue with this question" for content quality feedback.

### P2-14 · Leaderboard UX ☐ · S
- Show your rank even if outside the top 10; allow display-name or anonymous mode instead of full email (privacy).

### P3-1 · Bilingual UI (English / Hindi) ☐ · L
- Externalise strings; add a language toggle (the Hindi BOR resource suggests demand).

### P3-2 · Performance page / printable report ☐ · M
- Exportable PDF/CSV of attempt history and subject-wise accuracy for mentors.

---

## 6. Phase 5: Platform, admin, performance, security (Weeks 5–7)

### Admin portal

#### P1-22 · Make admin styles complete ☐ · S
- `admin.html` doesn't load `styles.css` but uses `btn-secondary-custom`. Add the style or define the class in the admin `<style>` block.

#### P1-23 · Enforce admin authorisation server-side ☐ · M
- Verify that admin access depends on **Firestore security rules / custom claims (or an allow-list collection)**, not only on UI visibility. Non-admin users who sign in on `admin.html` must be signed out with a clear message.
- Review who can read all `results` documents and who can write `chapter_stats`.

#### P2-15 · Replace native `confirm()` for destructive actions ☐ · S
- Use a modal that names the user, test and consequences ("Deletes the attempt and recalculates class statistics"). Require typing a keyword for irreversible actions, if desired.

#### P2-16 · Admin discussion-session improvements ☐ · M
- Sort/filter questions by accuracy; "Show only high-error questions".
- Add a legend that doesn't rely on colour alone (numbers or icons in the palette items).
- Keyboard-friendly navigation between questions; "Copy shareable summary" for discussion notes.
- Add a show/hide password toggle and loading/disabled states on the login form.

### Code quality and performance

#### P2-17 · Align library versions and pin them ☐ · S
- Use the same Firebase SDK version in `index.html` (10.7.1) and `admin.html` (9.22.0).
- Replace `toastr/latest` and `chart.js` / `marked` unpinned URLs with exact versions; consider SRI hashes.
- Remove unused libraries from pages that don't need them (e.g. Chart.js on the login page).

#### P2-18 · Reduce initial load ☐ · M
- Defer non-critical scripts (`defer`), lazy-load Chart.js only when the dashboard charts render, and `preconnect` to font/CDN origins.
- Consider bundling and minifying the app scripts; remove the large cache-busting query strings in favour of a build hash.
- Provide a `font-display: swap` strategy for web fonts.

#### P2-19 · Split `quiz.js` (≈2,200 lines) ☐ · L
- Separate modules: `subjects.js`, `test-runner.js`, `review.js`, `result.js`, `timer.js`, `stats.js`.
- Replace implicit globals (`questionTimeSpent`, `currentQuestionStartTime` are created ad hoc) with a single state object.
- Replace inline `onclick="..."` string handlers with event listeners.

#### P3-3 · Security hygiene ☐ · M
- **Sanitise HTML** before inserting question text, options, explanations and AI markdown with `innerHTML` (e.g. DOMPurify) and escape subject/chapter names used in template strings and `onclick` attributes (a name with a quote will break handlers).
- Restrict the Firebase and Gemini keys by HTTP referrer and quota; prefer calling Gemini through a Cloud Function so the key is never in the browser.
- Add rate limiting or a daily cap for AI reviews.
- Review Firestore rules for `results` (users read/write only their own), `chapter_stats` (writes via transaction/function) and `app_config/keys` (never client-readable if it contains secrets).

#### P3-4 · Scoring and stats integrity ☐ · M
- Compute scores and update `chapter_stats` in a Cloud Function (or at least validate in rules) so users can't submit forged scores to the leaderboard.
- Store marking scheme and test version with each result so analytics stay correct if rules change.

#### P3-5 · PWA and offline support ☐ · L
- Add a manifest and service worker; cache app shell and fetched questions; queue result submissions while offline (Firestore persistence is already enabled).

#### P3-6 · Analytics and feedback loop ☐ · M
- Track funnel events (subject → chapter → start → submit → review), drop-off points, mobile vs desktop usage and mean time on test screen.
- Add an in-app feedback button and a short post-test rating ("How was this test?").

#### P3-7 · Automated testing ☐ · M
- Unit tests for scoring, timer, progress restore and stats calculation.
- End-to-end tests for login → take test → submit → review on desktop and mobile viewports.
- Accessibility checks (axe/Lighthouse) in CI.

---

## 7. Sprint breakdown

### Sprint 1 (Days 1–5): Trust and safety
P0-1, P0-2, P0-3, P0-4, P0-5, P0-6, P0-7, P0-8, P0-9, P1-22

### Sprint 2 (Week 2): Test screen and mobile
P0-10, P1-1, P1-2, P1-3, P1-4, P1-5, P1-6, P1-7, P1-10

### Sprint 3 (Week 3): Accessibility, results, selection screens
P1-8, P1-9, P1-11, P1-12, P1-13, P1-14, P1-15, P1-16, P1-18

### Sprint 4 (Week 4): Dashboard, auth, revision tests
P1-17, P1-19, P1-20, P1-21, P2-4, P2-5, P2-1

### Sprint 5 (Week 5): Insights and engagement
P2-6, P2-7, P2-8, P2-9, P2-13, P2-14, P2-2, P2-3

### Sprint 6 (Weeks 6–7): Modes, admin, platform
P2-10, P2-11, P2-12, P2-15, P2-16, P2-17, P2-18, P2-19

### Backlog (long-term)
P3-1, P3-2, P3-3, P3-4, P3-5, P3-6, P3-7
*(Start P3-3 and P3-4 earlier if the leaderboard or user base is growing. They are security-relevant.)*

---

## 8. Success metrics

| Metric | Target |
|---|---|
| Test completion rate (started → submitted) | +15% |
| Mobile bounce on test screen | −30% |
| Scoring disputes or bug reports | Near zero |
| Lighthouse Accessibility score | ≥ 90 on all main screens |
| WCAG AA contrast failures | 0 |
| Time from login to first question | < 4 taps |
| Dashboard first meaningful paint | < 2 s on 4G |
| Users who rate confidence on ≥ 80% of questions | +20% |
| 7-day return rate | +10% |

---

## 9. Test checklist (use after each sprint)

**Scoring and logic**
- [ ] Confidence-only question counts as unattempted (score 0).
- [ ] Correct = +2, wrong = −0.66, unattempted = 0, in both result and review.
- [ ] Refresh mid-test restores answers, marks, confidence and the correct remaining time.
- [ ] Timer stays accurate after tab sleep / phone lock.
- [ ] Auto-submit at 0:00 works and saves the result once.

**UX**
- [ ] Start modal shows rules and Resume / Start fresh.
- [ ] Submit summary shows correct counts; Exit asks for confirmation.
- [ ] Palette legend and counters are accurate.
- [ ] Result screen is visible without scrolling.

**Mobile (360×640, 390×844)**
- [ ] Timer and palette access are always reachable.
- [ ] Touch targets are at least 44px; no horizontal scroll.

**Accessibility**
- [ ] Full test can be taken by keyboard only.
- [ ] Screen reader announces question changes and palette states.
- [ ] Contrast passes in light and dark themes; reduced motion respected.

**Admin and security**
- [ ] Non-admin account can't access admin data.
- [ ] Destructive actions use confirmation modals.
- [ ] User-supplied or question HTML is sanitised.

---

## 10. Open decisions for you

1. **Pause policy:** unlimited, limited or disabled? (Affects P0-6 and P2-10.)
2. **Confidence rating:** required or optional? (Affects P1-3.)
3. **Leaderboard privacy:** show emails, display names or anonymous? (Affects P2-14.)
4. **Where should Gemini be called from:** keep client-side with a restricted key, or move to a Cloud Function? (Affects P1-20, P3-3.)
5. **Mobile priority:** what share of your users are on phones? If it's high, move P1-1 to Sprint 1.
6. **Languages:** is a Hindi UI needed? (Affects P3-1.)
