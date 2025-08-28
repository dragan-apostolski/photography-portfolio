# Requirements

We need to build a personal photography portfolio website for showcasing photos, selling prints, as well as getting leads for photography services.

I am a landscape & travel photographer, and my style encompasses capturing beautiful landscape photos from stunning locations in nature, artistic portraits, as well as random moments from the everyday life.

The website should have a minimalist design, and both a light and dark mode.

## Layout and structure

### Home page

The home page is consisted of three sections:

- Hero
- Short About me
- Gallery preview
- Footer

#### Hero

The hero section has a carousel of (4-5) background photos rotating automatically. Each photo is associated with a project (tag), and has a link to the gallery page filtered by the tag.

#### Short About me

Next there is a short “about me” section with a short intro about me, and a portrait photo. On desktop the photo and the text are placed in two columns, while on mobile each subsection occupies one column. There is a small (Read more) button that leads to the full /about page.

#### Gallery Preview

Shows a selection of 6 photos each with a different category (landscape, travel, portrait, urban, mountains, sea). Use the PhotoPreview component to display each photo (in a square aspect ratio). On hover, a CTA button appears which leads the user to the full gallery, filtered by the category the photo is marked with.

#### Footer

Copyright, link to socials, link to other websites (dev portfolio at apostolski-dragan.com).

### Gallery page

On top of the page there is a list of categories (tags - use Tag component) which represent different photo categories: landscape, travel, portrait, experimental, urban, events, etc. Each photo can have multiple tags, so it will show up under multiple tag selections.  
Then follows the photo grid (masonry) which displays a selection of my best photos, all wrapped by the PhotoPreview component. On hover, the PhotoPreview displays a title, and a description. Clicking the PhotoPreview opens the photo in detail view (PhotoDetail component).  
As you scroll down more photos start loading (lazy loading).

### Projects page

Project page lists projects in a grid. Each project is wrapped by the PhotoPreview component. On hover, the PhotoPreview displays a title, and a description. Clicking a project card opens the project in detail view (a separate page). Additionally, each card shows the proejcts's tags. On top of the page, the user can select a tag to filter the projects, in the same way it can be done for the gallery page.

### Project details

Each project is consisted of one cover photo (spanning the full width and height of the page), and a an array of other photos, which are shown as the user scrolls down the page. On the bottom of the cover photo, there is a small icon indicating that the user should scroll down to explore the project. Once the user starts scrolling, a description shows up. The description is consisted of a project name, client (if its a client project) or model (if its a photo-sesseion), and a short description.
After scrolling through the description the photos start loading and the user can scroll through them. Each photo is shown in its full width and height.

On the bottom there are links to other projects.

### About page

This page contains detailed info about me such as bio, projects, photographic style, and a couple of more photos of me.

### Prints page (under construction)

This page lets you purchase a physical or digital print of my photography works. For now, display a UnderConstruction component.

### Services

This page displays the services I offer as a photographer/content creator.  
Upon entering the page there are three products, represented by cards (use PhotoPreview component):

- Accommodations (Creating content for camps, resorts, airbnb’s in nature)
  - Display a selection from the photoshoot I did for Eko Kamp Rinčica last year
- Portraits
  - Selection of my photo-sessions with Eka, Lina, Lidija, Ivana
- Events
  - Here I will put some of my best shots from events \- photos I have shot for Sinergia

## Styling and Typography

### Colors

- **Primary Palette:**

  - Black (\#000000) for text, headers, and icons in light mode; white (\#FFFFFF) for text and icons in dark mode.

  - White (\#FFFFFF) for backgrounds in light mode; Black (\#000000) for backgrounds in dark mode.

- **Secondary Palette:**

  - Neutral grays (e.g. \#F5F5F5, \#E0E0E0, \#BDBDBD) to subtly separate sections, cards, and footers in light mode.
  - Dark grays (e.g. \#1F1F1F, \#2C2C2C, \#424242) to differentiate panels and components in dark mode.

- **Tertiary Accents:**

  - Single accent color (e.g. very subtle sandstone \#D4B483) for hover states, active links, CTA buttons, and focus rings—used sparingly to preserve minimalism.

### Font

- Use Rajdhani font for headings (weights 600–700), body text (weights 400–500), captions and small labels (weight 400)
- Font colors automatically swap between black/white based on the selected mode; ensure smooth 300ms transition on color changes.

### Light & Dark Mode Switch:

Font colors automatically swap between black/white based on the selected mode; ensure smooth 300ms transition on color changes.

## Components

### Navbar

- Fixed at top with transparent background that fades to solid upon scroll (\>50px).
- Logo/text on left, menu items centered (Home, Gallery, Prints, Services, About).
- Hamburger menu animates into a right-sliding drawer on mobile.
- On mobile, when the menu opens it takes up the full height and width of the screen. It displays the same menu items in a vertical column.

### Carousel

- Full-width hero slider
- Auto-rotates every 6s with cross-fade; pause on hover.

### PhotoPreview

- Parametrized to display square, vertical or horizontal aspect ratio
- On hover:
- semi-opaque black overlay (opacity 25%), title/description fade in from bottom, plus a CTA button (parametrized) that slides up.
- (optional): Translates the photo for a small percentage in the direction opposite to the direction where the hover is coming form

### PhotoDetail

- Full-screen modal overlay with black background at 95% opacity.
- Centered image with max-width constraint (90vw/90vh).
- Caption area below image:
  - Title (H3)
  - description (body text)
  - Location
  - Parameters
- Left/right arrow nav and close “×” button appear on hover; animate in with 150ms fade

### Button

- Parametrized to be large, medium, or small
- Base: uppercase text, letter-spacing 0.1em, weight 500, small padding (px-4 py-2), rounded-lg corners, border 2px solid tertiary accent.
- Idle: transparent background.
- Hover: background \= tertiary accent, text \= black/white (mode-dependent), slight upward translate (–2px).
- Clickable, with a pointer cursor

### Tag

- Parametrized to be large, medium, or small
- Inline pill shape: small padding (px-3 py-1), rounded-full, background \= secondary gray, text \= uppercase 0.75rem, weight 500\.
- Active/tag-selected: background \= tertiary accent, text \= white/black (depending on mode); slight drop-shadow.

## Backend models

### Photo

- Title
- Description
- Location
- Timestamp (shot on)
- CameraSettings (json)
  - ShutterSpeed
  - Apperture
  - ISO
  - …
- Width (calculated automatically)
- Height (calculated automatically)
- Project (optional)

### Project

- Title
- Client (optional)
- Model (optional)
- Description
- Location
- Tags (possible tags are: Client, Portrait, Travel, Hobby, Landscape)
- Date
- Photos

Todo:

- Implement models for Prints

## Backend services

GetPhotosByTag(tag)

- Selects all the photos that have the tag
- Used for the purposes of filtering out the gallery

Todo:

- Define services for prints & ordering
- integrations with third party providers for payments, shipping, etc.

## Open questions

### Content management

Question:
How do we manage content, in case we later decide to add a blog, or have a separate detail page for projects?

Answer:
Given your current requirements:

- Start with Nuxt Content. It’s perfect for a solo photographer, offers fast iteration, and supports blogs, project detail pages, and even custom content types (like photo stories or print descriptions).
- If you later need a more powerful editor experience, you can migrate to a headless CMS with minimal refactoring.

### Database

Question: Which database should we use, and how do we structure the data?

Answer: Start without a database if you only need static content (Nuxt Content).
Add a database (SQLite for simple, PostgreSQL/Supabase for scalable) when you add e-commerce, lead capture, or dynamic content.
Structure your data as shown above for easy migration from static files to a database later.

### Typescript and types

Question: How do we set up the project to use Typescript, and where and how do we define the types?
Nuxt projects come with TypeScript by default. We should define types in the /types folder. The backend types come at /serer/types.

### Internationalization

Primarily the page will be in English, but in the future, I want to be able to add Macedonian and Slovenian.

Answer: You can safely start with English, but avoid hardcoding UI strings and keep your content organized. When you’re ready, add @nuxtjs/i18n, translation files, and translated content. This approach minimizes refactoring and makes adding new languages a smooth process.

## MVP

For the MVP, we will build the Home page (Hero, About me, Gallery preview, Footer), the Gallery page (Tag list, Photo grid), the About page, and the Contact page.

Later on we will add projects, prints, and services.

### Organisation of the public/photos folder

The public/photos folder will contain all the photos that will be displayed on the website. It should be well structured and future proof.
One proposal for structuring the folder is to store all the content photos in the following format: /public/photos/gallery/year/month/[project]/[photo].jpg.
For other photos, such as the ones that will be placed in the about page, we can put them under /public/photos/about/[photo].jpg
