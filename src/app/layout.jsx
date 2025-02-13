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
        <meta charSet="UTF-8" />

        <title>Login | The Lewis College (TLC) - Tracify</title>

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
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=5"
        />

        <meta
          name="keywords"
          content="TLC, The Lewis College, Tracify, TLC Tracify, Student Portal, College Login, Lost and Found"
        />
        <meta
          name="description"
          content="Login to The Lewis College (TLC) Tracify portal to manage your lost and found items."
        />

        <meta
          property="og:title"
          content="Login | The Lewis College (TLC) - Tracify"
        />
        <meta
          property="og:description"
          content="Login to your TLC Tracify account to manage your lost and found items."
        />
        <meta
          property="og:image"
          content="https://tlc-tracify.vercel.app/tracify_logo1.png"
        />
        <meta property="og:url" content="https://tlc-tracify.vercel.app/" />
        <meta property="og:type" content="website" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:title"
          content="Login | The Lewis College (TLC) - Tracify"
        />
        <meta
          name="twitter:description"
          content="Access your TLC Tracify account to manage your lost and found items."
        />
        <meta
          name="twitter:image"
          content="https://tlc-tracify.vercel.app/tracify_logo1.png"
        />

        <link rel="canonical" href="https://tlc-tracify.vercel.app/" />

        <meta name="robots" content="index, follow" />

        <meta
          name="google-site-verification"
          content="ACWj2uO1RWm6yPG0XOU-5hARanmlEIVjAfAq3VXPSfY"
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
