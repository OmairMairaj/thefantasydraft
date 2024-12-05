"use client";

import { SessionProvider } from "next-auth/react";
import React from "react";
import { AlertProvider } from "../components/AlertContext/AlertContext";

function Provider({ children, session }) {
  return (
    <SessionProvider session={session}>
      <AlertProvider>
        {children}
      </AlertProvider>
    </SessionProvider>
  );
}

export default Provider;
