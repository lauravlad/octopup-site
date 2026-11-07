# Octopup Studio — project notes

Octopup Studio is the studio behind Laura's apps and websites. This repository is its website.

## Where everything lives

| Piece | Where | Notes |
|---|---|---|
| Website | https://octopupstudio.com | GitHub Pages from this repo (`main`, root). `CNAME` holds the domain. |
| Code | https://github.com/lauravlad/octopup-site (public) | One page: `index.html`, plus `logo.svg` and `mark.svg`. Pushing to `main` updates the site. |
| Domain | octopupstudio.com at **Namecheap** | DNS: four GitHub A records for `@`, CNAME `www` → `lauravlad.github.io`. |
| Email | hello@octopupstudio.com | Namecheap **Redirect Email** → Laura's Gmail (receive only). |

`octopup.com` is **not** part of this setup. Its DNS sits at atom.com, a domain marketplace, and it has no email.

## What the site lists (the "Apps & websites" section)

| Area | App | Status on the site | Link |
|---|---|---|---|
| Learning | **Therefore**: logic practice | Available | https://lauravlad.github.io/Therefore/ (repo `lauravlad/Therefore`) |
| Swapping | **Swapfume**: perfume swap community | Early access | https://swapfume.com (repo `lauravlad/swapfume`, see its `PROJECT_NOTES.md`) |
| Organizing time | **Family Chores**: shared household chore organizer | Planned | none yet |
| Websites | Personal websites for people and small businesses | First project in progress | Contact |

## Family Chores

Planned only: *"A shared chore organizer for families: assign tasks, set routines, and see who has done what this week."* As of 2026-11-07 there is no code, repository or domain for it. When it starts, the Swapfume setup is a good template: a static site, Supabase for accounts, GitHub Pages and a custom domain, and Capacitor for the phone app.

## Timeline

- Class 11 and Class 12 pages were removed from the site; they live in the repos `lauravlad/class-11` and `lauravlad/class-12`.
- **2026-11-05:** the Swapfume card was changed from "In development / Coming soon" to "Early access", with its real icon and a link to swapfume.com (commit `7a99a33`).

## Next

- Change Swapfume to "Available" once its email sender and legal review are done.
- Add Family Chores' link when it exists.
