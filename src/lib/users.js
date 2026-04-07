import { ObjectId } from "mongodb";
import { getDatabase } from "./mongodb";
import { normalizeRole, USER_ROLE } from "./roles";
import { bangladeshDistricts } from "@/data/districts";

const USERS_COLLECTION = "users";

export function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

export function formatUser(user) {
  if (!user) return null;

  return {
    id: user._id.toString(),
    name: user.name || "",
    email: user.email || "",
    image: user.image || null,
    role: normalizeRole(user.role),
    authType: user.authType || "credentials",
    passwordHash: user.passwordHash || null,
    emailVerified: user.emailVerified || null,
    defaultAddress: formatUserAddress(user.defaultAddress),
    createdAt: user.createdAt ? new Date(user.createdAt).toISOString() : null,
    updatedAt: user.updatedAt ? new Date(user.updatedAt).toISOString() : null,
  };
}

function formatUserAddress(address) {
  if (!address) return null;

  const normalizedAddress = {
    name: String(address.name || "").trim(),
    phone: String(address.phone || "").trim(),
    district: String(address.district || "").trim(),
    address: String(address.address || "").trim(),
    note: String(address.note || "").trim(),
    updatedAt: address.updatedAt ? new Date(address.updatedAt).toISOString() : null,
  };

  if (
    !normalizedAddress.name &&
    !normalizedAddress.phone &&
    !normalizedAddress.district &&
    !normalizedAddress.address &&
    !normalizedAddress.note
  ) {
    return null;
  }

  return normalizedAddress;
}

export async function getUsersCollection() {
  const db = await getDatabase();
  return db.collection(USERS_COLLECTION);
}

export async function ensureUserIndexes() {
  const users = await getUsersCollection();
  await users.createIndex({ email: 1 }, { unique: true, sparse: true });
  await users.createIndex({ role: 1 });
  return users;
}

export async function findUserByEmail(email) {
  const users = await getUsersCollection();
  const user = await users.findOne({ email: normalizeEmail(email) });
  return formatUser(user);
}

export async function findUserById(id) {
  if (!ObjectId.isValid(id)) return null;

  const users = await getUsersCollection();
  const user = await users.findOne({ _id: new ObjectId(id) });
  return formatUser(user);
}

export async function getUserDefaultAddressById(id) {
  const user = await findUserById(id);
  return user?.defaultAddress || null;
}

export async function saveUserDefaultAddressById(id, addressInput) {
  if (!ObjectId.isValid(id)) {
    throw new Error("User not found.");
  }

  const normalizedAddress = {
    name: String(addressInput?.name || "").trim(),
    phone: String(addressInput?.phone || "").trim(),
    district: String(addressInput?.district || "").trim(),
    address: String(addressInput?.address || "").trim(),
    note: String(addressInput?.note || "").trim(),
  };

  if (!normalizedAddress.name) {
    throw new Error("Name is required.");
  }

  if (!normalizedAddress.phone) {
    throw new Error("Phone number is required.");
  }

  if (!normalizedAddress.district) {
    throw new Error("District is required.");
  }

  if (!bangladeshDistricts.includes(normalizedAddress.district)) {
    throw new Error("Please select a valid district.");
  }

  if (normalizedAddress.address.length < 8) {
    throw new Error("Please enter a complete delivery address.");
  }

  const users = await ensureUserIndexes();
  const timestamp = new Date();

  const result = await users.updateOne(
    { _id: new ObjectId(id) },
    {
      $set: {
        defaultAddress: {
          ...normalizedAddress,
          updatedAt: timestamp,
        },
        updatedAt: timestamp,
      },
    }
  );

  if (!result.matchedCount) {
    throw new Error("User not found.");
  }

  return getUserDefaultAddressById(id);
}

export async function removeUserDefaultAddressById(id) {
  if (!ObjectId.isValid(id)) {
    throw new Error("User not found.");
  }

  const users = await ensureUserIndexes();
  const timestamp = new Date();

  const result = await users.updateOne(
    { _id: new ObjectId(id) },
    {
      $unset: {
        defaultAddress: "",
      },
      $set: {
        updatedAt: timestamp,
      },
    }
  );

  if (!result.matchedCount) {
    throw new Error("User not found.");
  }

  return null;
}

export async function createCredentialsUser({ name, email, passwordHash }) {
  const users = await ensureUserIndexes();
  const normalizedEmail = normalizeEmail(email);
  const timestamp = new Date();

  const result = await users.insertOne({
    name: String(name || "").trim() || normalizedEmail.split("@")[0],
    email: normalizedEmail,
    image: null,
    role: USER_ROLE,
    emailVerified: null,
    passwordHash,
    authType: "credentials",
    createdAt: timestamp,
    updatedAt: timestamp,
  });

  return findUserById(result.insertedId.toString());
}

export async function syncOAuthUser({ id, email, name, image, provider }) {
  if (!id || !ObjectId.isValid(id)) return;

  const users = await ensureUserIndexes();
  const timestamp = new Date();
  const existingUser = await users.findOne({ _id: new ObjectId(id) });
  const existingRole = normalizeRole(existingUser?.role);

  await users.updateOne(
    { _id: new ObjectId(id) },
    {
      $set: {
        email: normalizeEmail(email),
        name: name || normalizeEmail(email).split("@")[0],
        image: image || null,
        role: existingRole || USER_ROLE,
        authType: provider || "oauth",
        updatedAt: timestamp,
      },
      $setOnInsert: {
        createdAt: timestamp,
      },
    },
    { upsert: true }
  );
}

export async function listUsers({ search = "", limit = 100 } = {}) {
  const users = await getUsersCollection();
  const query = {};

  if (String(search || "").trim()) {
    query.$or = [
      { name: { $regex: String(search).trim(), $options: "i" } },
      { email: { $regex: String(search).trim(), $options: "i" } },
      { role: { $regex: String(search).trim(), $options: "i" } },
    ];
  }

  const docs = await users
    .find(query)
    .sort({ createdAt: -1, name: 1 })
    .limit(Math.max(1, Math.min(200, Number(limit) || 100)))
    .toArray();

  return docs.map(formatUser);
}

export async function countUsers() {
  const users = await getUsersCollection();
  return users.countDocuments();
}
