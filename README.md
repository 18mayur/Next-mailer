# Next Mailer

A simple HTML email tester built with Next.js. Upload an HTML email template and its images straight from the browser, preview it live, and send it to any list of recipients. No code changes, no git push, no redeploy.

## Features

- **Upload or paste HTML**: drop in a `.html` file or paste the markup
- **Image uploads**: add the template's images from the UI; they are stored on Vercel Blob and get public URLs automatically
- **Automatic path rewriting**: local paths like `images/banner.png` are swapped for public image URLs, matched by file name
- **Live preview**: see the email (with images) before sending
- **Missing image warning**: the UI tells you which images the HTML needs but you haven't uploaded yet
- **Multiple recipients**: separate addresses with commas, semicolons or new lines; each one is validated
- **Single-screen UI**: modern dark layout that fits one screen with no page scrolling

## Tech Stack

- [Next.js](https://nextjs.org/) (App Router)
- [React](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Lucide React](https://lucide.dev/) icons
- [Nodemailer](https://nodemailer.com/) with Gmail
- [Vercel Blob](https://vercel.com/docs/storage/vercel-blob) for image storage

## How It Works

Templates and images are treated as data, not code, so nothing in the project changes when you send an email.

1. You choose an HTML file and its images in the browser. The live preview uses temporary local links, so images show instantly.
2. When you click **Send**, the browser asks `/api/upload` for a short-lived upload token for each image the HTML uses.
3. The browser uploads each image **directly to Vercel Blob** with that token and receives a public URL. (Client uploads avoid Vercel's 4.5 MB request limit.)
4. The app replaces the local image paths in the HTML with those public URLs.
5. The final HTML, subject and recipients are sent to `/api/send-mail`, which delivers the email with Nodemailer.

Email clients can only load images from public `https://` URLs, which is why the images go to Blob first.

## Project Structure

```
src/
  app/
    api/
      send-mail/route.js   # Sends the email with Nodemailer
      upload/route.js      # Issues Vercel Blob client-upload tokens
    layout.js
    page.js                # Upload, preview and send UI
    globals.css
```

## Getting Started

### Prerequisites

- Node.js 18 or later
- A Gmail account with an [App Password](https://support.google.com/accounts/answer/185833) (2-Step Verification must be on)
- A Vercel account

### 1. Clone and install

```bash
git clone <your-repo-url>
cd next-mailer
npm install
```

### 2. Create a Vercel Blob store

1. In the Vercel dashboard, open your project and go to **Storage**.
2. Create a **Blob** store and set its access to **Public**.
3. Connect it to your project and tick **Add a read-write token env var**.
4. If you want to run locally, enable the **Development** environment for the connection (this means turning off the "Sensitive" option for the token).

### 3. Set environment variables

Create a `.env.local` file in the project root:

```env
EMAIL_USER=your-gmail-address@gmail.com
EMAIL_PASS=your-gmail-app-password
BLOB_READ_WRITE_TOKEN=your-vercel-blob-read-write-token
```

You can also run `vercel link` and `vercel env pull .env.local` to download the Blob variables automatically.

> Never commit `.env.local`. It is already ignored by git in a default Next.js project.

### 4. Run the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Usage

1. Upload your `.html` file (or switch to **Paste** and paste the markup).
2. Add the images the template uses. **File names must match the paths in the HTML**: if the HTML contains `images/banner.png`, upload a file named `banner.png`.
3. Check the live preview.
4. Enter a subject and one or more recipient emails.
5. Click **Send email**.

## Deploying to Vercel

1. Push the repo to GitHub and import it in Vercel.
2. Add `EMAIL_USER`, `EMAIL_PASS` and `BLOB_READ_WRITE_TOKEN` under **Settings → Environment Variables** (the Blob variables are added automatically if you connect the Blob store to the project).
3. Deploy. After this first deploy you do not need to redeploy to send new templates.

## Limitations and Notes

- **No authentication yet.** Anyone with the deployed URL can send mail through your Gmail account. Add password protection before sharing the link.
- **Gmail sending limits.** A standard Gmail account allows roughly 500 emails per day, so this is meant for testing, not bulk sending.
- **Supported image types:** PNG, JPEG, GIF and WebP, up to 5 MB each.
- **Blob files are not auto-deleted.** Uploaded images stay in the store until you remove them from **Manage Blobs** in the Vercel dashboard.
- **Templates are not saved.** The HTML only lives in the browser until you send it.
- Email clients render HTML differently, so always check the received email as well as the preview.
