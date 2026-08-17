# Connecting RSVPs to a Google Sheet

The RSVP form on the site already saves every response to the guest's own
browser (`localStorage`), so nothing is lost even before you do this setup.
To also collect responses centrally in a spreadsheet:

1. Create a new Google Sheet (any name).
2. In the sheet, go to **Extensions → Apps Script**.
3. Delete the placeholder code and paste in the contents of `Code.gs` from
   this folder.
4. Click **Deploy → New deployment**.
   - Select type: **Web app**.
   - Execute as: **Me**.
   - Who has access: **Anyone**.
5. Click **Deploy**, authorize the script when prompted, and copy the
   resulting **web app URL** (ends in `/exec`).
6. Open `js/script.js` in the site and paste that URL into:
   ```js
   rsvpEndpoint: ""   // <- paste your /exec URL here
   ```
7. Redeploy/refresh the site. New RSVP submissions will now also land as
   rows in a sheet named **RSVPs**.

Because the form posts with `mode: "no-cors"`, the browser can't read the
response back — that's expected and fine; the row still gets written.
