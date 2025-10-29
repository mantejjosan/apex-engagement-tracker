import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import {v4 as uuidv4 } from "uuid";
import { sendStudentIdEmail } from "@/lib/mail";

export async function POST(req) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    const body = await req.json();
    const { name, school, class: studentClass, roll_number, age, gender, crn, email, type } = body;
    
    if (!email || email.trim() === "") {
      return NextResponse.json(
        {error: "Email is required"}, {status: 400}
      )
    }

    const id = uuidv4();
    const eightDigitId = id.replace(/-/g, "").slice(0,8);

    const { data, error } = await supabase
      .from("students")
      .insert([
        {
          name,
          school: type === "school" ? school : null,
          class: type === "school" ? studentClass : null,
          roll_number: type === "school" ? roll_number : null,
          age: type === "school" ? age : null,
          gender: type === "school" ? gender : null,
          crn: type === "college" ? crn : null,
          email,
          type,
        },
      ])
      .select()
      .single();

      if (error) throw error;

      sendStudentIdEmail(email, name, eightDigitId).catch(console.error)

    
    // Create the same session cookie as in login route
    const cookieStore = await cookies();
    const sessionData = {
      studentId: data.id,
      name: data.name,
      school: data.school,
      loginTime: new Date().toISOString(),
    };
    
    cookieStore.set("apex_session", JSON.stringify(sessionData), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 8,
    });
    
    return NextResponse.json({
      success: true,
      message: "Registered and logged in successfully",
      student: { name: data.name, school: data.school },
    });
  } catch (err) {
    console.error("Register error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
