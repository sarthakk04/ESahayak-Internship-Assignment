"use client";

import { SignUp } from "@clerk/nextjs";

export default function SignupPage() {
  return (
    <div className="flex justify-center items-center h-screen bg-gray-50">
      <div className="w-full max-w-md p-6 bg-white rounded shadow">
        <SignUp
          path="/signup"
          routing="path" // still fine, or use "hash"
          signInUrl="/login"
        />
      </div>
    </div>
  );
}
