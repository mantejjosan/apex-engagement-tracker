import PoweredBy from "@/components/poweredby";
import "./globals.css";

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
        <div className="flex flex-col">
          <main>
            {children}
          </main>

         
        </div>
      </body>
    </html>
  );
}
