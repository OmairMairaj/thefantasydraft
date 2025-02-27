"use client";

import React, { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Exo_2 } from "next/font/google";
import axios from "axios";

const exo2 = Exo_2({
  weight: ["400", "700", "800"],
  style: ["italic"],
  subsets: ["latin"],
});

const VerifyContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const code = searchParams.get("code");
  const [MyText, setMyText] = useState("Verifying Email...");

  React.useEffect(() => {
    if (!code) {
      setMyText("Invalid Link");
    } else {
      axios
        .post(process.env.NEXT_PUBLIC_BACKEND_URL + "user/verify", {
          code: code,
        })
        .then((res) => {
          console.log(res);
          setMyText(res.data.message + "\n" + "\n" + "Redirecting to login...");
          setTimeout(() => {
            router.push("/login");
          }, 5000);
        })
        .catch((err) => {
          setMyText("Unexpected Error occurred \n Please try again");
          console.log(err);
        });
    }
  }, []);

  return (
    <div className="min-h-[88vh] flex flex-col items-center justify-center px-6 sm:px-8 md:px-16">
      <div className="w-full max-w-xl bg-[#0C1922] p-8 sm:p-12 md:p-16 rounded-3xl shadow-lg">
        <h1
          style={{ textAlign: "center" }}
          className={`text-3xl sm:text-4xl font-bold italic ${exo2.className}`}
        >
          EMAIL VERIFICATION
        </h1>
        <div className="mt-6 md:mt-8">
          <div
            className={`text-lg sm:text-xl md:text-2xl font-bold italic ${exo2.className}`}
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "30vh",
              textAlign: "center",
              whiteSpace: "pre-line",
            }}
          >
            {MyText}
          </div>
        </div>
      </div>
    </div>
  );
};

// Wrap the VerifyContent in Suspense to avoid errors
const Verify = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VerifyContent />
    </Suspense>
  );
};

export default Verify;
