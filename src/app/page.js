'use client';

import { useState } from 'react';
import EmailComposer from '@/components/EmailComposer';

export default function Home() {
  const [showComposer, setShowComposer] = useState(false);
  const [sentEmails, setSentEmails] = useState([]);

  const handleEmailSent = (emailData) => {
    setSentEmails([
      {
        id: Date.now(),
        ...emailData,
        timestamp: new Date().toLocaleString(),
      },
      ...sentEmails,
    ]);
    setShowComposer(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">✉️</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Next Mailer</h1>
                <p className="text-xs text-gray-600">Professional Email Management</p>
              </div>
            </div>
            <button
              onClick={() => setShowComposer(!showComposer)}
              className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:shadow-lg transform transition hover:scale-105"
            >
              {showComposer ? '✕ Close' : '✎ Compose'}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Composer Section */}
        {showComposer && (
          <div className="mb-8 animate-in fade-in slide-in-from-top">
            <EmailComposer onEmailSent={handleEmailSent} />
          </div>
        )}

        {/* Dashboard Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {/* Stats Cards */}
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500 hover:shadow-lg transition">
            <h3 className="text-gray-600 text-sm font-semibold mb-2">Total Sent</h3>
            <p className="text-3xl font-bold text-blue-600">{sentEmails.length}</p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-purple-500 hover:shadow-lg transition">
            <h3 className="text-gray-600 text-sm font-semibold mb-2">Today</h3>
            <p className="text-3xl font-bold text-purple-600">
              {sentEmails.filter((e) =>
                new Date(e.timestamp).toDateString() === new Date().toDateString()
              ).length}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-pink-500 hover:shadow-lg transition">
            <h3 className="text-gray-600 text-sm font-semibold mb-2">Status</h3>
            <p className="text-3xl font-bold text-pink-600">Ready</p>
          </div>
        </div>

        {/* Sent Emails Section */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
            <h2 className="text-xl font-bold text-white">Sent Emails</h2>
          </div>

          {sentEmails.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📧</span>
              </div>
              <p className="text-gray-600 font-medium mb-2">No emails sent yet</p>
              <p className="text-gray-500 text-sm">
                Click "Compose" button to send your first email
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {sentEmails.map((email) => (
                <div
                  key={email.id}
                  className="px-6 py-4 hover:bg-gray-50 transition flex items-start justify-between"
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-sm font-semibold">
                          {email.to.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">{email.subject}</p>
                        <p className="text-sm text-gray-600">To: {email.to}</p>
                      </div>
                    </div>
                    {email.cc && (
                      <p className="text-xs text-gray-500 ml-13">CC: {email.cc}</p>
                    )}
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="inline-block px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full mb-2">
                      ✓ Sent
                    </span>
                    <p className="text-xs text-gray-500">{email.timestamp}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
