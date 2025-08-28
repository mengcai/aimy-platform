'use client';

import React, { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

export default function RedirectPage() {
  useEffect(() => {
    // Redirect to the public platform on port 3000
    window.location.href = 'http://localhost:3000';
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Redirecting to AIMYA Platform</h2>
        <p className="text-gray-600">Please wait while we redirect you to the public platform...</p>
        <p className="text-sm text-gray-500 mt-4">
          If you're not redirected automatically,{' '}
          <a href="http://localhost:3000" className="text-blue-600 hover:text-blue-700 underline">
            click here
          </a>
        </p>
      </div>
    </div>
  );
}
