import { NextResponse } from "next/server";
import { auth } from "@/auth";
import {
  getUserDefaultAddressById,
  removeUserDefaultAddressById,
  saveUserDefaultAddressById,
} from "@/lib/users";

export const runtime = "nodejs";

async function requireAddressUser() {
  const session = await auth();

  if (!session?.user?.id) {
    return null;
  }

  return session.user;
}

export async function GET() {
  try {
    const user = await requireAddressUser();

    if (!user) {
      return NextResponse.json(
        { ok: false, message: "Please log in to access your saved address." },
        { status: 401 }
      );
    }

    const address = await getUserDefaultAddressById(user.id);

    return NextResponse.json({
      ok: true,
      address,
    });
  } catch (error) {
    return NextResponse.json(
      { ok: false, message: "Unable to load your saved address right now." },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const user = await requireAddressUser();

    if (!user) {
      return NextResponse.json(
        { ok: false, message: "Please log in to save your address." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const address = await saveUserDefaultAddressById(user.id, body);

    return NextResponse.json({
      ok: true,
      address,
      message: "Your delivery address has been saved.",
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message: error?.message || "Unable to save your delivery address right now.",
      },
      { status: 400 }
    );
  }
}

export async function DELETE() {
  try {
    const user = await requireAddressUser();

    if (!user) {
      return NextResponse.json(
        { ok: false, message: "Please log in to update your address." },
        { status: 401 }
      );
    }

    await removeUserDefaultAddressById(user.id);

    return NextResponse.json({
      ok: true,
      address: null,
      message: "Saved address removed successfully.",
    });
  } catch (error) {
    return NextResponse.json(
      { ok: false, message: "Unable to remove your saved address right now." },
      { status: 500 }
    );
  }
}
