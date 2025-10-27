import Navbar from "@/components/navbar";
import RegisterFormSwitcher from "./RegisterFormSwitcher";
import PoweredBy from "@/components/poweredby";

export const metadata = {
  title: "Register | APEX 2025",
};

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex flex-col pb-2">
      <Navbar />
      <main className="flex-1 flex flex-col items-center px-4 py-6">
        <div className="w-full max-w-md bg-card rounded-lg shadow p-6">
          <h1 className="text-xl font-semibold text-center mb-4">
            Register for APEX 2025
          </h1>
          <RegisterFormSwitcher />
        </div>
      </main>
        <PoweredBy />
    </div>
  );
}
