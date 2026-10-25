import type { ReactNode } from "react";
import "./globals.css";
export const metadata = {title:"माधव–पार्थ AI",description:"भगवद्गीतेवर आधारित मार्गदर्शन"};
export default function RootLayout({children}:{children:ReactNode}) {return <html lang="mr"><body>{children}</body></html>}
