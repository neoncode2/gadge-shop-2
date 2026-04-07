import { hash } from "bcryptjs";
import { NextResponse } from "next/server";
import { isMongoConfigured } from "@/lib/mongodb";
import { createCredentialsUser, ensureUserIndexes, findUserByEmail } from "@/lib/users";

export const runtime = "nodejs";

export async function POST(request) {
  try {
    if (!isMongoConfigured()) {
      return NextResponse.json(
        {
          message:
            "MongoDB is not configured. Add MONGODB_URI to .env.local and restart the dev server.",
        },
        { status: 500 }
      );
    }

    const body = await request.json();
    const name = String(body?.name || "").trim();
    const email = String(body?.email || "").trim();
    const password = String(body?.password || "");
    const confirmPassword = String(body?.confirmPassword || "");

    if (!name || !email || !password || !confirmPassword) {
      return NextResponse.json(
        { message: "All fields are required." },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { message: "Password must be at least 6 characters." },
        { status: 400 }
      );
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { message: "Passwords do not match." },
        { status: 400 }
      );
    }

    await ensureUserIndexes();
    const existingUser = await findUserByEmail(email);

    if (existingUser) {
      return NextResponse.json(
        { message: "An account with this email already exists." },
        { status: 409 }
      );
    }

    const passwordHash = await hash(password, 12);
    const user = await createCredentialsUser({ name, email, passwordHash });

    return NextResponse.json(
      {
        ok: true,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Register route failed:", error);

    if (error?.code === 11000) {
      return NextResponse.json(
        { message: "An account with this email already exists." },
        { status: 409 }
      );
    }

    if (error?.name === "MongoServerSelectionError" || error?.name === "MongoNetworkError") {
      return NextResponse.json(
        { message: "MongoDB connection failed. Check Atlas network access or TLS settings." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "Unable to create your account right now." },
      { status: 500 }
    );
  }
}
