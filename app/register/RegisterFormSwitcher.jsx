"use client";
import { useState } from "react";
import SchoolForm from "./SchoolForm";
import CollegeForm from "./CollegeForm";
import Logo from "@/components/logo";
import { Check } from "lucide-react";
import { useRouter, useSearchParams } from 'next/navigation'

export default function RegisterFormSwitcher() {
  const [type, setType] = useState("school");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();

  const redirectUrl = searchParams.get("redirect") || "/";

  // Persist both forms' data in parent
  const [schoolForm, setSchoolForm] = useState({
    name: "",
    school: "",
    class: "",
    roll_number: "",
    gender: "",
    age: "",
    email: "",
  });

  const [collegeForm, setCollegeForm] = useState({
    name: "",
    crn: "",
    email: "",
  });

  // One handler for submit
  const handleSubmit = async (data, type) => {
    try {
        setLoading(true);
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, type }),
      });
      const response = await res.json();
      if (!res.ok) throw new Error(response.message || "Registration failed");
      setSuccess(true);
      
      setTimeout(() => {
        router.push(redirectUrl)
      }, 800)
    } catch (err) {
      alert(err.message);
    } finally {
        setLoading(false)
    }
  };

  if (loading) return (
    <div className="mx-auto">
        <Logo size="md" animated />
    </div>
    )

  if (success) return (
      <div className="flex justify-center items-center h-full p-6">
        <div className="bg-card p-6 rounded-lg text-center">
          <Check className="text-green-500 mx-auto mb-2" size={48} />
          <h2 className="text-xl font-semibold mb-1">Registration Successful!</h2>
          <p className="text-gray-600 text-sm">Logging you in automatically...</p>
        </div>
      </div>
    );

  return (
    <div className="flex flex-col">
      {/* toggle buttons */}
      <div className="flex justify-center gap-2 mb-4">
        <button
          onClick={() => setType("school")}
          className={`px-3 py-1.5 rounded-full text-sm font-medium ${
            type === "school"
              ? "bg-secondary text-white border-4  hover:bg-accent" 
              : "bg-primary text-white hover:bg-accent"
          }`}
        >
          School Student
        </button>
        <button
          onClick={() => setType("college")}
          className={`px-3 py-1.5 rounded-full text-sm font-medium ${
            type === "college"
              ? "bg-secondary text-white border-4  hover:bg-accent" 
              : "bg-primary text-white hover:bg-accent"
          }`}
        >
          College Student
        </button>
      </div>

      {/* forms */}
      {type === "school" ? (
        <SchoolForm
          formData={schoolForm}
          setFormData={setSchoolForm}
          onSubmit={() => handleSubmit(schoolForm, "school")}
        />
      ) : (
        <CollegeForm
          formData={collegeForm}
          setFormData={setCollegeForm}
          onSubmit={() => handleSubmit(collegeForm, "college")}
        />
      )}
    </div>
  );
}
