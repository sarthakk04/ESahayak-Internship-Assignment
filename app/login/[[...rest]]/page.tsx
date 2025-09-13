"use client";

import { SignIn } from "@clerk/nextjs";

export default function LoginPage() {
  return (
    <div className="flex justify-center items-center h-screen bg-gray-50">
      <div className="w-full max-w-md p-6 bg-white rounded shadow">
        <SignIn
          path="/login"
          routing="path" // path routing works with catch-all
          signUpUrl="/signup"
        />
      </div>
    </div>
  );
}
