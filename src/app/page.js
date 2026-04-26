"use client";

import { useState } from "react";
import { Mail, Send, AlertCircle, CheckCircle } from "lucide-react";

export default function Home() {
  const [emails, setEmails] = useState("");
  const [subject, setSubject] = useState("");
  const [template, setTemplate] = useState("newMail");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: null, message: "" });

  const availableTemplates = [
    { id: "newMail", label: "Process Note / SOP Advisory" },
  ];

  const validateEmails = (emailString) => {
    const emailList = emailString
      .split(",")
      .map((email) => email.trim())
      .filter((email) => email);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const invalidEmails = emailList.filter((email) => !emailRegex.test(email));

    return {
      valid: invalidEmails.length === 0 && emailList.length > 0,
      emails: emailList,
      invalidEmails,
    };
  };

  const sendMail = async (e) => {
    e.preventDefault();
    setStatus({ type: null, message: "" });

    // Validation
    if (!subject.trim()) {
      setStatus({ type: "error", message: "Please enter a subject" });
      return;
    }

    const validation = validateEmails(emails);
    if (!validation.valid) {
      if (validation.emails.length === 0) {
        setStatus({ type: "error", message: "Please enter at least one email address" });
      } else {
        setStatus({
          type: "error",
          message: `Invalid email(s): ${validation.invalidEmails.join(", ")}`,
        });
      }
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/send-mail", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          recipients: validation.emails,
          subject: subject.trim(),
          template: template,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus({
          type: "success",
          message: `Email sent successfully to ${validation.emails.length} recipient(s)!`,
        });
        setEmails("");
        setSubject("");
      } else {
        setStatus({
          type: "error",
          message: data.message || "Failed to send email",
        });
      }
    } catch (error) {
      setStatus({
        type: "error",
        message: "Error sending email. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Mail className="w-8 h-8 text-blue-400" />
            <h1 className="text-4xl font-bold text-white">Email Sender</h1>
          </div>
          <p className="text-slate-400">Send professional emails with pre-designed templates</p>
        </div>

        {/* Main Card */}
        <div className="bg-slate-800 rounded-2xl shadow-2xl overflow-hidden border border-slate-700">
          {/* Card Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6">
            <h2 className="text-xl font-semibold text-white">Compose Email</h2>
          </div>

          {/* Card Body */}
          <form onSubmit={sendMail} className="p-8 space-y-6">
            {/* Status Messages */}
            {status.message && (
              <div
                className={`flex items-center gap-3 px-4 py-4 rounded-lg ${
                  status.type === "success"
                    ? "bg-green-900/30 border border-green-700 text-green-300"
                    : "bg-red-900/30 border border-red-700 text-red-300"
                }`}
              >
                {status.type === "success" ? (
                  <CheckCircle className="w-5 h-5 flex-shrink-0" />
                ) : (
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                )}
                <p className="text-sm">{status.message}</p>
              </div>
            )}

            {/* Template Selection */}
            <div>
              <label className="block text-sm font-semibold text-slate-200 mb-2">
                Email Template
              </label>
              <select
                value={template}
                onChange={(e) => setTemplate(e.target.value)}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition"
              >
                {availableTemplates.map((tmpl) => (
                  <option key={tmpl.id} value={tmpl.id}>
                    {tmpl.label}
                  </option>
                ))}
              </select>
              <p className="text-xs text-slate-400 mt-2">
                Select the email template you want to send
              </p>
            </div>

            {/* Subject Input */}
            <div>
              <label className="block text-sm font-semibold text-slate-200 mb-2">
                Subject
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Enter email subject..."
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition"
              />
              <p className="text-xs text-slate-400 mt-2">
                This will appear as the email subject line
              </p>
            </div>

            {/* Recipients Input */}
            <div>
              <label className="block text-sm font-semibold text-slate-200 mb-2">
                Recipients Email Addresses
              </label>
              <textarea
                value={emails}
                onChange={(e) => setEmails(e.target.value)}
                placeholder="Enter email addresses separated by commas&#10;Example: user1@example.com, user2@example.com, user3@example.com"
                rows="4"
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition resize-none"
              />
              <p className="text-xs text-slate-400 mt-2">
                Separate multiple email addresses with commas. Enter at least one valid email.
              </p>
            </div>

            {/* Email Count Preview */}
            {emails.trim() && (
              <div className="flex items-center gap-2 px-4 py-2 bg-blue-900/30 border border-blue-700 rounded-lg">
                <Mail className="w-4 h-4 text-blue-300" />
                <span className="text-sm text-blue-300">
                  Will send to {emails.split(",").filter((e) => e.trim()).length} recipient(s)
                </span>
              </div>
            )}

            {/* Send Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 px-6 rounded-lg font-semibold flex items-center justify-center gap-2 transition ${
                loading
                  ? "bg-slate-600 text-slate-300 cursor-not-allowed"
                  : "bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 active:scale-95"
              }`}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Send Email
                </>
              )}
            </button>
          </form>

          {/* Footer Info */}
          <div className="bg-slate-700/50 px-8 py-4 border-t border-slate-700">
            <p className="text-xs text-slate-400 text-center">
              Emails are sent securely using Gmail. Make sure all email addresses are valid.
            </p>
          </div>
        </div>

        {/* Quick Info */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
            <div className="text-blue-400 font-semibold text-sm mb-1">📝 Templates</div>
            <p className="text-xs text-slate-400">
              Choose from pre-designed professional email templates
            </p>
          </div>
          <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
            <div className="text-blue-400 font-semibold text-sm mb-1">📧 Batch Send</div>
            <p className="text-xs text-slate-400">
              Send to multiple recipients at once by separating emails with commas
            </p>
          </div>
          <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
            <div className="text-blue-400 font-semibold text-sm mb-1">✅ Validation</div>
            <p className="text-xs text-slate-400">
              Automatic email validation to prevent sending to invalid addresses
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
