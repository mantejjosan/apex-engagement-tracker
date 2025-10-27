"use client";
import Logo from "@/components/logo";
import { useState } from "react";

export default function SchoolForm({ formData, setFormData, onSubmit }) {
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
            name="school"
            placeholder="School Name"
            value={formData.school}
            onChange={handleChange}
            className="p-2 rounded-md border w-full"
            required
          />
          <input
            name="class"
            placeholder="Class"
            value={formData.class}
            onChange={handleChange}
            className="p-2 rounded-md border w-full"
          />
          <input
            name="roll_number"
            placeholder="Roll Number"
            value={formData.roll_number}
            onChange={handleChange}
            className="p-2 rounded-md border w-full"
          />
          <div className="flex gap-2">
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className="p-2 rounded-md border flex-1"
            >
              <option value="">Gender</option>
              <option>Male</option>
              <option>Female</option>
              <option>Other</option>
            </select>
            <input
              type="number"
              name="age"
              placeholder="Age"
              value={formData.age}
              onChange={handleChange}
              className="p-2 rounded-md border w-20"
            />
          </div>
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            className="p-2 rounded-md border w-full"
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
