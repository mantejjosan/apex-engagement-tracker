import PoweredBy from "@/components/poweredby";
import "./globals.css";
import Menu from "@/components/menu";

export const metadata = {
  title: "Apex Engagement Tracking PWA",
  description: "Created for Apex with love by @mantejjosan",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`font-sans food-texture antialiased`}
      >
        
         
            {children}
         
      </body>
    </html>
  );
}
