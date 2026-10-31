"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { upload } from "@vercel/blob/client";
import logo from "../../public/envelope-paper-plane.svg";
import {
  Mail,
  Send,
  Heart,
  Star,
  FileText,
  Image as ImageIcon,
  X,
  CheckCircle,
  AlertCircle,
  Loader2,
  UploadCloud,
  Monitor,
  Smartphone,
  Contact,
} from "lucide-react";
import Image from "next/image";

// 👉 Change this to your real repository / profile link
const GITHUB_URL = "https://github.com/18mayur/Next-mailer";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const IMAGE_TYPES = /^image\/(png|jpe?g|gif|webp)$/;

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Replace local image paths (images/banner.png, ./banner.png ...) with URLs, matched by file name
function replaceImagePaths(html, urlMap) {
  let out = html;
  for (const [name, url] of Object.entries(urlMap)) {
    const re = new RegExp(
      `(["'(])(?!https?:|data:|//)(?:[^"'()\\s]*[/\\\\])?${escapeRegex(name)}(?=["')])`,
      "gi",
    );
    out = out.replace(re, (_, quote) => quote + url);
  }
  return out;
}

// Find the file names of all local images the HTML refers to
function findLocalImages(html) {
  const found = new Set();
  const re = /(?:src\s*=\s*|background\s*=\s*|url\()\s*["']?([^"')\s>]+)/gi;
  let m;
  while ((m = re.exec(html))) {
    const p = m[1];
    if (/^(https?:|data:|cid:|mailto:|#|\/\/)/i.test(p)) continue;
    found.add(p.split(/[/\\]/).pop().split("?")[0]);
  }
  return [...found];
}

const inputCls =
  "w-full rounded-lg border border-slate-200 bg-blue-50/40 px-3 py-2.5 text-sm text-slate-800 placeholder-slate-400 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20";

const cardCls =
  "shrink-0 rounded-2xl border border-slate-200/70 bg-white p-4 shadow-[0_2px_12px_-4px_rgba(30,64,175,0.12)]";

const dropzoneCls =
  "flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed border-blue-200 bg-blue-50/50 text-center transition hover:border-blue-400 hover:bg-blue-50";

const chipCls =
  "flex items-center gap-2 rounded-lg border border-blue-100 bg-blue-50/60 px-3 py-1.5 text-xs font-medium text-slate-700";

const dropProps = (handler) => ({
  onDragOver: (e) => e.preventDefault(),
  onDrop: (e) => {
    e.preventDefault();
    handler(e.dataTransfer.files);
  },
});

// GitHub mark (lucide dropped brand icons in newer versions, so it's inlined)
function GithubMark({ className }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
      className={className}
    >
      <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.1.79-.25.79-.56v-2c-3.2.7-3.87-1.37-3.87-1.37-.52-1.33-1.28-1.69-1.28-1.69-1.05-.71.08-.7.08-.7 1.15.08 1.76 1.19 1.76 1.19 1.03 1.76 2.69 1.25 3.35.96.1-.75.4-1.25.73-1.54-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.78 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.83 1.19 3.09 0 4.42-2.69 5.39-5.25 5.68.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z" />
    </svg>
  );
}

export default function Home() {
  const [tab, setTab] = useState("upload");
  const [html, setHtml] = useState("");
  const [htmlName, setHtmlName] = useState("");
  const [images, setImages] = useState([]);
  const [previewMap, setPreviewMap] = useState({});
  const [subject, setSubject] = useState("");
  const [emails, setEmails] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);
  const [device, setDevice] = useState("desktop");

  const htmlInputRef = useRef(null);
  const recipientsRef = useRef(null);

  // Local object URLs so the preview shows images before anything is uploaded
  useEffect(() => {
    const map = {};
    images.forEach((f) => (map[f.name] = URL.createObjectURL(f)));
    setPreviewMap(map);
    return () => Object.values(map).forEach((u) => URL.revokeObjectURL(u));
  }, [images]);

  // Let the recipients box grow with its content (single line by default)
  useEffect(() => {
    const el = recipientsRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight + 2, 112)}px`;
  }, [emails]);

  const previewHtml = useMemo(
    () => replaceImagePaths(html, previewMap),
    [html, previewMap],
  );
  const localRefs = useMemo(() => findLocalImages(html), [html]);
  const missing = localRefs.filter(
    (n) => !images.some((f) => f.name.toLowerCase() === n.toLowerCase()),
  );

  const loadHtmlFile = async (fileList) => {
    const file = fileList?.[0];
    if (!file) return;
    setHtml(await file.text());
    setHtmlName(file.name);
  };

  const clearHtml = () => {
    setHtml("");
    setHtmlName("");
  };

  const addImages = (fileList) => {
    const incoming = Array.from(fileList).filter((f) =>
      IMAGE_TYPES.test(f.type),
    );
    setImages((prev) => {
      const map = new Map(prev.map((f) => [f.name, f]));
      incoming.forEach((f) => map.set(f.name, f));
      return [...map.values()];
    });
  };

  const sendMail = async () => {
    setStatus(null);

    if (!html.trim())
      return setStatus({
        type: "error",
        message: "Add your HTML template first.",
      });
    if (!subject.trim())
      return setStatus({ type: "error", message: "Please enter a subject." });

    const list = emails
      .split(/[,;\n]/)
      .map((e) => e.trim())
      .filter(Boolean);
    if (!list.length)
      return setStatus({
        type: "error",
        message: "Enter at least one email address.",
      });

    const bad = list.filter((e) => !EMAIL_REGEX.test(e));
    if (bad.length)
      return setStatus({
        type: "error",
        message: `Invalid email(s): ${bad.join(", ")}`,
      });

    if (missing.length)
      return setStatus({
        type: "error",
        message: `Upload these images first: ${missing.join(", ")}`,
      });

    setLoading(true);
    try {
      // Upload only the images the HTML actually uses
      const urlMap = {};
      const used = images.filter((f) =>
        localRefs.some((n) => n.toLowerCase() === f.name.toLowerCase()),
      );
      for (const file of used) {
        const blob = await upload(file.name, file, {
          access: "public",
          handleUploadUrl: "/api/upload",
        });
        urlMap[file.name] = blob.url;
      }

      const finalHtml = replaceImagePaths(html, urlMap);

      const res = await fetch("/api/send-mail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipients: list,
          subject: subject.trim(),
          html: finalHtml,
        }),
      });
      const data = await res.json();

      if (res.ok) {
        setStatus({
          type: "success",
          message: `Sent to ${list.length} recipient(s).`,
        });
        setSubject("");
        setEmails("");
      } else {
        setStatus({
          type: "error",
          message: data.message || "Failed to send email.",
        });
      }
    } catch (err) {
      setStatus({
        type: "error",
        message: err.message || "Something went wrong. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const recipientCount =
    emails.split(/[,;\n]/).filter((e) => e.trim()).length || 0;

  return (
    <main className="min-h-screen bg-[#f1f4fb] text-slate-800 lg:h-screen lg:overflow-hidden">
      {/* Outer gradient frame */}
      <div
        className="relative min-h-screen w-full overflow-hidden bg-[#eef2fb] shadow-[0_30px_80px_-30px_rgba(79,99,214,0.45)] lg:h-full lg:min-h-0"
        style={{
          backgroundImage:
            "radial-gradient(circle, #f0fdff, #bae6fd, #a5f3fc), transparent 42%)",
        }}
      >
        {/* Top gradient that fades out toward the bottom */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-[460px]"
          style={{
            background: "linear-gradient(128deg, #020617, #0c3b66, #155e75)",
            WebkitMaskImage:
              "linear-gradient(128deg, #020617, #0284c7, #22d3ee)",
            maskImage:
              "linear-gradient(to bottom, #000 0, #000 130px, transparent 100%)",
          }}
        />

        <div className="relative flex min-h-screen flex-col lg:h-full lg:min-h-0">
          {/* Header */}
          <header className="flex shrink-0 flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8 sm:py-4">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl">
                <Image
                  src={logo}
                  width={24}
                  height={24}
                  alt="Node Mailer logo"
                  className="h-14 w-14"
                />
              </div>
              <div>
                <h1 className="text-2xl font-semibold leading-tight text-white">
                  Universal Node Mailer
                </h1>
                <p className="text-[1rem] text-white/85">
                  Upload a template, add images and send emails
                </p>
              </div>
            </div>

            {/* Credit */}
            <div className="flex items-center gap-3 rounded-2xl border border-white/20 bg-white/10 py-2 pl-5 pr-2 backdrop-blur">
              <div className="leading-tight">
                <p className="flex items-center gap-1.5 text-[1rem] font-semibold text-white">
                  Created by Mayur
                </p>
                <p className="text-xs text-white/70">
                  Like it? Give it a star on GitHub
                </p>
              </div>
              <a
                href={GITHUB_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex h-11 items-center gap-2 rounded-xl bg-[linear-gradient(120deg,#f0fdff,#bae6fd,#a5f3fc)] px-[14px] text-[1rem] font-semibold text-slate-900 shadow-lg shadow-black/20 transition hover:bg-amber-50"
              >
                <GithubMark className="h-8 w-8" />
                Star
                <Star className="h-6 w-6 text-amber-500 transition group-hover:fill-amber-400" />
              </a>
            </div>
          </header>

          {/* Frosted content panel */}
          <div className="mx-3 mb-3 flex flex-col rounded-3xl border border-white/70 bg-white/75 p-3 shadow-[0_10px_40px_-20px_rgba(30,64,175,0.25)] backdrop-blur-md sm:mx-5 sm:mb-5 sm:p-4 lg:min-h-0 lg:flex-1">
            <div className="grid grid-cols-1 gap-4 lg:min-h-0 lg:flex-1 lg:grid-cols-[42fr_58fr] lg:grid-rows-[minmax(0,1fr)]">
              {/* Left: controls (scrolls inside itself on short screens, never the page) */}
              <section className="flex min-w-0 flex-col gap-4 lg:min-h-0 lg:overflow-y-auto lg:pr-1">
                {/* 1. Template */}
                <div className={cardCls}>
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <h2 className="flex items-center gap-3 text-sm font-bold text-slate-800">
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-500 text-sm font-bold text-white">
                        1
                      </span>
                      HTML Template
                    </h2>
                    <button
                      type="button"
                      onClick={() => {
                        setTab("upload");
                        htmlInputRef.current?.click();
                      }}
                      className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-xs font-semibold text-blue-700 transition hover:bg-blue-100"
                    >
                      Choose Template
                    </button>
                  </div>

                  {tab === "upload" ? (
                    <label
                      {...dropProps(loadHtmlFile)}
                      className={`${dropzoneCls} h-24`}
                    >
                      <input
                        ref={htmlInputRef}
                        type="file"
                        accept=".html,.htm,text/html"
                        hidden
                        onChange={(e) => {
                          loadHtmlFile(e.target.files);
                          e.target.value = "";
                        }}
                      />
                      <UploadCloud
                        className="h-7 w-7 text-blue-500"
                        strokeWidth={1.8}
                      />
                      <span className="text-xs font-medium text-slate-700">
                        Drag &amp; drop your HTML file here
                      </span>
                      <span className="text-xs text-slate-500">
                        or click to browse
                      </span>
                    </label>
                  ) : (
                    <textarea
                      value={html}
                      onChange={(e) => setHtml(e.target.value)}
                      placeholder="Paste your HTML here..."
                      className={`${inputCls} h-24 resize-none font-mono text-xs`}
                    />
                  )}

                  {tab === "upload" && htmlName && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      <span className={chipCls}>
                        <FileText className="h-4 w-4 text-red-500" />
                        {htmlName}
                        <button
                          type="button"
                          onClick={clearHtml}
                          className="text-slate-400 transition hover:text-red-500"
                          aria-label={`Remove ${htmlName}`}
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </span>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() =>
                      setTab(tab === "upload" ? "paste" : "upload")
                    }
                    className="mt-3 text-xs font-medium text-blue-600 transition hover:text-blue-800"
                  >
                    {tab === "upload"
                      ? "Or paste HTML instead"
                      : "Or upload an HTML file instead"}
                  </button>
                </div>

                {/* 2. Images */}
                <div className={cardCls}>
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <h2 className="flex items-center gap-3 text-sm font-bold text-slate-800">
                      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500">
                        <ImageIcon className="h-4 w-4 text-white" />
                      </span>
                      <span>
                        Images{" "}
                        <span className="font-semibold text-slate-600">
                          (Optional)
                        </span>
                      </span>
                    </h2>
                    <span className="hidden text-[11px] text-slate-400 sm:inline">
                      file names must match the HTML
                    </span>
                  </div>

                  <label
                    {...dropProps(addImages)}
                    className={`${dropzoneCls} h-16 flex-row gap-2`}
                  >
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/gif,image/webp"
                      multiple
                      hidden
                      onChange={(e) => {
                        addImages(e.target.files);
                        e.target.value = "";
                      }}
                    />
                    <UploadCloud
                      className="h-6 w-6 text-blue-500"
                      strokeWidth={1.8}
                    />
                    <span className="text-xs font-medium text-slate-700">
                      Drag &amp; drop images or click to browse
                    </span>
                  </label>

                  {images.length > 0 && (
                    <div className="mt-3 flex max-h-24 flex-wrap gap-2 overflow-y-auto">
                      {images.map((f) => (
                        <span key={f.name} className={chipCls}>
                          {f.name}
                          <button
                            type="button"
                            onClick={() =>
                              setImages((prev) =>
                                prev.filter((x) => x.name !== f.name),
                              )
                            }
                            className="text-slate-400 transition hover:text-red-500"
                            aria-label={`Remove ${f.name}`}
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}

                  {missing.length > 0 && (
                    <p className="mt-3 flex items-start gap-1.5 text-xs text-amber-600">
                      <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                      Still needed: {missing.join(", ")}
                    </p>
                  )}
                </div>

                {/* 3. Email details */}
                <div className={cardCls}>
                  <h2 className="mb-4 flex items-center gap-3 text-sm font-bold text-slate-800">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-500 text-sm font-bold text-white">
                      3
                    </span>
                    Email Details
                  </h2>

                  <div className="space-y-4">
                    <div>
                      <label className="mb-1.5 block text-xs font-bold text-slate-800">
                        Subject
                      </label>
                      <input
                        type="text"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        placeholder="Enter email subject..."
                        className={`${inputCls} h-11`}
                      />
                    </div>

                    <div>
                      <label className="mb-1.5 block text-xs font-bold text-slate-800">
                        Recipients
                        <span className="ml-2 font-normal text-slate-400">
                          {recipientCount} added
                        </span>
                      </label>
                      <div className="flex items-start gap-3">
                        <textarea
                          ref={recipientsRef}
                          value={emails}
                          onChange={(e) => setEmails(e.target.value)}
                          placeholder="user1@example.com, user2@example.com"
                          rows={1}
                          className={`${inputCls} min-h-[44px] resize-none`}
                        />
                        <button
                          type="button"
                          onClick={() => recipientsRef.current?.focus()}
                          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-blue-200 bg-blue-50 text-blue-600 transition hover:bg-blue-100"
                          aria-label="Edit recipients"
                        >
                          <Contact className="h-5 w-5" />
                        </button>
                      </div>
                    </div>

                    {status && (
                      <div
                        className={`flex items-start gap-2 rounded-lg border px-3 py-2 text-xs ${
                          status.type === "success"
                            ? "border-green-200 bg-green-50 text-green-700"
                            : "border-red-200 bg-red-50 text-red-700"
                        }`}
                      >
                        {status.type === "success" ? (
                          <CheckCircle className="h-4 w-4 shrink-0" />
                        ) : (
                          <AlertCircle className="h-4 w-4 shrink-0" />
                        )}
                        <span>{status.message}</span>
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={sendMail}
                      disabled={loading}
                      className={`flex h-12 w-full items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold transition ${
                        loading
                          ? "cursor-not-allowed bg-slate-200 text-slate-500"
                          : "bg-[#0b62f6] text-white shadow-lg shadow-blue-600/25 hover:bg-blue-700 active:scale-[0.99]"
                      }`}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" /> Uploading
                          &amp; sending...
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4" /> Send Email
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </section>

              {/* Right: live preview */}
              <section className="flex min-h-[420px] min-w-0 flex-col overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-[0_2px_12px_-4px_rgba(30,64,175,0.12)] lg:min-h-0">
                <div className="flex h-14 shrink-0 items-center justify-between px-5">
                  <span className="text-sm font-bold text-slate-800">
                    Live Preview
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setDevice("desktop")}
                      aria-label="Desktop preview"
                      className={`rounded-lg p-2 transition ${
                        device === "desktop"
                          ? "bg-blue-50 text-blue-600"
                          : "text-slate-400 hover:text-blue-600"
                      }`}
                    >
                      <Monitor className="h-5 w-5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDevice("mobile")}
                      aria-label="Mobile preview"
                      className={`rounded-lg p-2 transition ${
                        device === "mobile"
                          ? "bg-blue-50 text-blue-600"
                          : "text-slate-400 hover:text-blue-600"
                      }`}
                    >
                      <Smartphone className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                <div className="relative min-h-[360px] flex-1 lg:min-h-0">
                  <div className="absolute inset-x-4 bottom-4 top-0 flex justify-center overflow-hidden rounded-xl bg-slate-50">
                    {html ? (
                      <iframe
                        title="Email preview"
                        srcDoc={previewHtml}
                        sandbox="allow-same-origin"
                        style={{
                          width: device === "mobile" ? 390 : "100%",
                          maxWidth: "100%",
                        }}
                        className="h-full bg-white transition-[width] duration-300"
                      />
                    ) : (
                      <div className="flex flex-1 flex-col items-center justify-center gap-2 text-slate-400">
                        <Mail className="h-10 w-10" />
                        <p className="text-sm">
                          Your email preview will appear here
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
