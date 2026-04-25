'use client';

import { useState } from 'react';

export default function EmailComposer({ onEmailSent }) {
  const [formData, setFormData] = useState({
    to: '',
    cc: '',
    bcc: '',
    subject: '',
    body: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError('');
  };

  const validateForm = () => {
    if (!formData.to.trim()) {
      setError('Recipient email is required');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.to)) {
      setError('Invalid recipient email format');
      return false;
    }
    if (formData.cc && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.cc)) {
      setError('Invalid CC email format');
      return false;
    }
    if (formData.bcc && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.bcc)) {
      setError('Invalid BCC email format');
      return false;
    }
    if (!formData.subject.trim()) {
      setError('Subject is required');
      return false;
    }
    if (!formData.body.trim()) {
      setError('Message body is required');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send email');
      }

      setSuccess('Email sent successfully!');
      onEmailSent(formData);
      setFormData({
        to: '',
        cc: '',
        bcc: '',
        subject: '',
        body: '',
      });
    } catch (err) {
      setError(err.message || 'An error occurred while sending the email');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setFormData({
      to: '',
      cc: '',
      bcc: '',
      subject: '',
      body: '',
    });
    setError('');
    setSuccess('');
  };

  const bodyCharCount = formData.body.length;
  const maxChars = 5000;
  const charPercentage = (bodyCharCount / maxChars) * 100;

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
        <h2 className="text-2xl font-bold text-white">Compose Email</h2>
      </div>

      <form onSubmit={handleSubmit} className="p-6">
        {/* Alerts */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3">
            <span className="text-red-600 text-xl">⚠️</span>
            <div>
              <p className="text-red-800 font-semibold">Error</p>
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start space-x-3">
            <span className="text-green-600 text-xl">✓</span>
            <div>
              <p className="text-green-800 font-semibold">Success</p>
              <p className="text-green-700 text-sm">{success}</p>
            </div>
          </div>
        )}

        {/* To Field */}
        <div className="mb-4">
          <label htmlFor="to" className="block text-sm font-semibold text-gray-700 mb-2">
            Recipient Email *
          </label>
          <input
            type="email"
            id="to"
            name="to"
            value={formData.to}
            onChange={handleChange}
            placeholder="recipient@example.com"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
          />
        </div>

        {/* CC Field */}
        <div className="mb-4">
          <label htmlFor="cc" className="block text-sm font-semibold text-gray-700 mb-2">
            CC (Optional)
          </label>
          <input
            type="email"
            id="cc"
            name="cc"
            value={formData.cc}
            onChange={handleChange}
            placeholder="cc@example.com"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
          />
        </div>

        {/* BCC Field */}
        <div className="mb-4">
          <label htmlFor="bcc" className="block text-sm font-semibold text-gray-700 mb-2">
            BCC (Optional)
          </label>
          <input
            type="email"
            id="bcc"
            name="bcc"
            value={formData.bcc}
            onChange={handleChange}
            placeholder="bcc@example.com"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
          />
        </div>

        {/* Subject Field */}
        <div className="mb-4">
          <label htmlFor="subject" className="block text-sm font-semibold text-gray-700 mb-2">
            Subject *
          </label>
          <input
            type="text"
            id="subject"
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            placeholder="Email subject"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
          />
        </div>

        {/* Body Field */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="body" className="block text-sm font-semibold text-gray-700">
              Message *
            </label>
            <span className="text-xs font-medium text-gray-500">
              {bodyCharCount} / {maxChars}
            </span>
          </div>
          <textarea
            id="body"
            name="body"
            value={formData.body}
            onChange={handleChange}
            placeholder="Type your message here..."
            rows="8"
            maxLength={maxChars}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition resize-none"
          />
          <div className="mt-2 bg-gray-200 rounded-full h-2 overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                charPercentage > 80
                  ? 'bg-red-500'
                  : charPercentage > 50
                  ? 'bg-yellow-500'
                  : 'bg-green-500'
              }`}
              style={{ width: `${Math.min(charPercentage, 100)}%` }}
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex space-x-4 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transform transition hover:scale-105"
          >
            {loading ? (
              <span className="flex items-center justify-center space-x-2">
                <span className="inline-block animate-spin">⟳</span>
                <span>Sending...</span>
              </span>
            ) : (
              'Send Email'
            )}
          </button>
          <button
            type="button"
            onClick={handleClear}
            disabled={loading}
            className="flex-1 px-6 py-3 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            Clear
          </button>
        </div>
      </form>
    </div>
  );
}
