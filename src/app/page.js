"use client";

export default function Home() {
  const sendMail = async () => {
    const res = await fetch("/api/send-mail", {
      method: "POST",
    });

    if (res.ok) {
      alert("Email sent successfully!");
    } else {
      alert("Failed to send email");
    }
  };

  return (
    <main style={{ padding: 40 }}>
      <div className="container">
        <button className="text-fuchsia-200 cursor-pointer font-medium bg-red-700 p-4 rounded-2xl" onClick={sendMail}>
          Send Email
        </button>
      </div>
    </main>
  );
}
