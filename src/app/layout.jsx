"use client";

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
    background-color: whitesmoke;
  }
`;

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={poppins.className}>
      <head>
        <title>TLC-Tracify | Login</title>
        <link
          rel="icon"
          type="image/png"
          href="/favicon-96x96.png"
          sizes="96x96"
        />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-touch-icon.png"
        />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="apple-mobile-web-app-title" content="TLC-Tracify" />
        <meta name="keywords" content="tlc, tracify, the lewis college" />
        <meta name="description" content="Login to access your account" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="robots" content="index, follow" />
        <meta charSet="UTF-8" />
        <meta
          name="google-site-verification"
          content="google-site-verification=ACWj2uO1RWm6yPG0XOU-5hARanmlEIVjAfAq3VXPSfY"
        />
      </head>
      <body>
        <SessionProvider>
          <GlobalStyle />
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
