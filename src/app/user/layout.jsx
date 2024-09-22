import React from "react";
import SidebarComponent from "../components/SidebarComponent";

const navigation = [
  { menu: "Home", url: "/user/dashboard" },
  { menu: "Profile", url: "/user/profile" },
  { menu: "Match Items", url: "/user/match-items" },
  { menu: "Ratings", url: "user/ratings" },
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
