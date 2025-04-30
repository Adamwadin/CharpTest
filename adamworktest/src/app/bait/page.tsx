"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function BaitPage() {
  const [countdown, setCountdown] = useState(10);
  const router = useRouter();

  useEffect(() => {
    if (countdown === 0) {
      router.push("/dashboard");
    }

    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [countdown, router]);

  return (
    <div className="min-h-screen bg-login flex flex-col items-center justify-center bg-gray-900 text-white px-4">
      <h2 className="text-6xl md:text-5xl font-extrabold mb-6 text-center">
        Just wanted to try to recreate the cool button :)
      </h2>
      <p className="text-xl md:text-2xl">
        Redirecting to{" "}
        <span className="text-[#14c0c7] font-bold">dashboard</span> in{" "}
        <span className="text-[#14c0c7] font-bold">{countdown}</span> seconds...
      </p>
    </div>
  );
}
