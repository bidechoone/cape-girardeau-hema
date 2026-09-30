# Cape Girardeau HEMA website

A plain static site: no build step, no framework.

- `index.html`: the whole site (join the club, events, what HEMA is, club, documents)
- `assets/styles.css`, `assets/site.js`: styling and small scripts
- `assets/logo-original.png`: the club logo as supplied; `logo.jpg` (hero), `logo-small.png` (menu + browser tab) and `apple-touch-icon.png` are resized copies
- `assets/photos/`: club photos for the Photos section (add a `<figure class="photo">` line per photo in index.html)
- `assets/sponsors/`: sponsor logos (`hema-alliance.png`: stacked HEMA Alliance mark from their visual identity file)
- `documents/`: put PDFs here (`safety-policy.pdf`, `waiver.pdf` and `hema-alliance-waiver.pdf` added; `bylaws.pdf` to come), then swap the
  "coming soon" tag in the Documents section for the `Open` link in the comment beside it

## Hosting
Hosted free on GitHub Pages from the `main` branch (repository root). Changes pushed to `main`
go live automatically. Class times and signups live in the club's Spond group.

## Events calendar
The Events section embeds the Google Calendar of capegirardeauhema@gmail.com.
- The calendar must be public: Google Calendar > Settings > the calendar > Access permissions >
  "Make available to public" with "See all event details".
- To let other admins add events: same page > "Share with specific people or groups" >
  add their email with "Make changes to events".
Events added there show up on the site automatically; no site edits needed.
