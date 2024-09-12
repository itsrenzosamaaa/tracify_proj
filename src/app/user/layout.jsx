import React from "react";
import SidebarComponent from "../components/SidebarComponent";

const navigation = [
  { menu: "Home", url: "/user/dashboard" },
  { menu: "Match Items", url: "" },
  { menu: "Ratings", url: "" },
];

export default function Layout({ children }) {
  return (
    <html>
      <head>
        <title>User Dashboard</title>
      </head>
      <body>
        <SidebarComponent arr={navigation} avtr="User" />
        {children}
      </body>
    </html>
  );
}
