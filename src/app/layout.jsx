'use client'
import { createGlobalStyle } from "styled-components";
import { Poppins } from "next/font/google";
import { SessionProvider } from "next-auth/react";

const poppins = Poppins({
  weight: "300",
  subsets: ["latin"],
  display: "swap",
});

const GlobalStyle = createGlobalStyle`
  body {
    font-family: ${poppins.style.fontFamily};
  }
`;

export default function RootLayout({ children }) {
  return (
    <>
      <GlobalStyle />
      <html lang="en" className={poppins.className}>
        <head>
          <title>Login</title>
        </head>
        <body style={{ backgroundColor: "whitesmoke" }}>
          <SessionProvider>
            {children}
          </SessionProvider>
        </body>
      </html>
    </>
  );
}
