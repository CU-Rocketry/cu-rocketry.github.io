# Clarkson University Rocketry Website

Static site for [Clarkson University Rocketry](https://clarksonuniversityrocketry.com) based on Astro framework and Pages CMS for easy editing.

## Stack

- [Pages CMS](https://pagescms.org/) is configured by `.pages.yml` so people can edit anything in `src/content/`
- Astro static site generator compiles the content edited by Pages CMS
- Website stylesheets split into component style and global CSS

## Usage

First, run `npm install` in the project root directory to install all the dependencies from the package. Requires NPM.

Then, you can use a dev server to see changes with hot reloads by running `npm run dev` and opening https://localhost:4321 in your browser.

Finally, ensure everything still builds with `npm run build` and `npm run preview`. If all of this works then the GitHub Actions CI should still work technically.
