"use client";

import React from "react";

export default function Billing() {
  return (
    <main className="min-h-screen bg-zinc-900 text-white px-6 py-12 flex flex-col items-center">
      <h1 className="text-5xl font-extrabold mb-6 tracking-tight text-center text-green-400">
        Support Modix & Apply for Your Free License
      </h1>

      <p className="text-gray-300 mb-12 text-center max-w-3xl leading-relaxed text-lg">
        Modix is always free to use for everyone via the <strong>Personal Plan</strong>.  
        Simply apply for a free license and enjoy full access to core features for your hobby servers or personal projects.  
        <br /><br />
        While Modix is free, your donations help fund server hosting, development of new tools, and keeping Modix alive for the long term.  
        Every contribution — big or small — supports the community and ensures we can continue improving.
      </p>

      <div className="flex flex-col md:flex-row gap-8 items-center">
        {/* Apply for Free License */}
        <a
          href="/apply-license"
          className="bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-8 rounded-xl shadow-lg transition transform hover:scale-105"
        >
          Apply for Free License
        </a>

        {/* PayPal Donation */}
        <a
          href="https://www.paypal.com/donate?hosted_button_id=YOUR_PAYPAL_ID"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-xl shadow-lg transition transform hover:scale-105"
        >
          Donate with PayPal
        </a>

        {/* Ko-fi Donation */}
        <a
          href="https://ko-fi.com/YOUR_KOFI_USERNAME"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-pink-500 hover:bg-pink-600 text-white font-bold py-4 px-8 rounded-xl shadow-lg transition transform hover:scale-105"
        >
          Support on Ko-fi
        </a>
      </div>

      <p className="text-sm text-green-400 mt-10 text-center max-w-xl leading-relaxed">
        Modix is built for the long term. All users can enjoy free access to the Personal Plan,  
        and donations help ensure Modix continues to grow, improve, and serve the community for years to come.  
        Thank you for your support!
      </p>
    </main>
  );
}
