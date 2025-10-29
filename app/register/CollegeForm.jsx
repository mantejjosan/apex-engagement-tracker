"use client";
import Logo from "@/components/logo";
import { useState } from "react";

export default function CollegeForm({ formData, setFormData, onSubmit }) {
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await onSubmit();
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      {loading ? (
        <div className="flex justify-center py-6">
          <Logo size="md" animated />
        </div>
      ) : (
        <>
          <input
            name="name"
            placeholder="Full Name"
            value={formData.name}
            onChange={handleChange}
            className="p-2 rounded-md border w-full"
            required
          />
          <input
            name="crn"
            type="number"
            placeholder="College Roll Number (CRN)"
            value={formData.crn}
            onChange={handleChange}
            className="p-2 rounded-md border w-full"
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            className="p-2 rounded-md border w-full"
            required
          />

          <button
            type="submit"
            className="mt-2 bg-secondary hover:bg-accent text-white py-2 rounded-lg font-medium"
          >
            Register
          </button>
        </>
      )}
    </form>
  );
}
