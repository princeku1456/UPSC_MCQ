# Feature Proposal: In-Quiz Feedback System

## 1. Problem Statement
Users currently have no way to report errors (typos, wrong keys, ambiguous phrasing) in questions while taking a test or practicing. This leads to frustration and potential distrust in the platform's content.

## 2. Proposed Solution
Add a "Report/Feedback" button to the Question UI. When clicked, it should allow the user to select an issue type and (optionally) add a comment.

## 3. User Flow
1.  User encounters a problematic question during a Quiz or Review.
2.  User clicks a "Flag" icon or "Report" button located near the Question ID.
3.  A modal or prompt appears asking for the issue type:
    *   Wrong Answer Key
    *   Typos / Grammar
    *   Ambiguous Question
    *   Other
4.  User submits.
5.  System logs the report to a `feedback` collection in Firestore.
6.  User receives a "Thank You" toast notification.

## 4. Technical Implementation (Vanilla JS)

### A. UI Changes (`quiz.js`)
*   Modify `renderQuestion()` to include the button HTML.
*   Create a simple Bootstrap Modal for the feedback form in `index.html` (or inject it dynamically).

### B. Logic (`quiz.js`)
*   Function `openFeedbackModal(questionId, questionText)`
*   Function `submitFeedback()`

### C. Data Model (Firestore)
**Collection:** `feedback`
**Document Structure:**
```json
{
  "questionId": "History_Ancient_India_Q1",
  "chapterId": "History_Ancient_India",
  "questionTextSnippet": "Who built the Red Fort...",
  "issueType": "wrong_key",
  "comment": "It should be Shah Jahan",
  "userId": "auth_uid",
  "userEmail": "user@example.com",
  "timestamp": "server_timestamp",
  "status": "open"
}
```

## 5. Success Metrics
*   Number of valid reports received.
*   Time-to-fix for content errors (Admin metric).
