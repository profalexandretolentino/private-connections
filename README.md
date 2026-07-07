# Private Connections

A private bridge between Brazil and Japan. Landing page with video, connection button, Google Sheets tracking and Telegram notification.

Created with ❤️

## Files
- `index.html` — page structure
- `style.css` — visual design
- `app.js` — screen flow + tracking
- `Code.gs` — Google Apps Script backend
- `assets/placeholder.mp4` — replace with final video
- `assets/poster.jpg` — optional video poster

## Quick setup
1. Create a GitHub repository.
2. Upload `index.html`, `style.css`, `app.js`, and `assets/`.
3. Enable GitHub Pages from branch `main` and root folder.
4. Create a Google Sheet.
5. Open Extensions > Apps Script.
6. Paste `Code.gs`.
7. Add Telegram token and chat id.
8. Deploy as Web App: Execute as Me; Who has access: Anyone.
9. Copy Web App URL into `TRACKING_ENDPOINT` in `app.js`.
10. Test: open the GitHub Pages URL and click CONNECT.
