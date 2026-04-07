import { getDatabase, isMongoConfigured } from "./mongodb";

const ORDERS_COLLECTION = "orders";

export const ORDER_STATUS_TABS = [
  "All",
  "Pending",
  "Confirmed",
  "In Process",
  "Delivered",
  "Cancelled",
];

export const ADMIN_ORDER_STATUSES = ORDER_STATUS_TABS.filter((status) => status !== "All");

function normalizeOrderLookup(value) {
  return String(value || "").trim().toUpperCase();
}

function formatTimelineEntry(entry, orderNumber, index) {
  const timestamp = new Date(entry?.at || entry?.createdAt || Date.now());

  return {
    id: `${String(entry?.status || "pending").toLowerCase().replace(/\s+/g, "-")}-${index}`,
    title: entry?.status || "Pending",
    date: timestamp.toLocaleDateString("en-CA"),
    time: timestamp.toLocaleTimeString("en-BD", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }),
    location: entry?.location || "Location not available",
    note: entry?.note || "",
    orderId: orderNumber,
    at: timestamp.toISOString(),
  };
}

function formatOrder(order) {
  if (!order) return null;

  const items = Array.isArray(order.items) ? order.items : [];

  return {
    id: order._id?.toString?.() || "",
    orderNumber: order.orderNumber,
    lookupKey: order.lookupKey,
    source: order.source || "cart",
    userId: order.userId || "",
    userEmail: order.userEmail || "",
    status: order.status || "Pending",
    customer: order.customer || {},
    items,
    payment: order.payment || {},
    pricing: order.pricing || {},
    itemCount: items.reduce((sum, item) => sum + Number(item.qty || 0), 0),
    createdAt: order.createdAt ? new Date(order.createdAt).toISOString() : null,
    updatedAt: order.updatedAt ? new Date(order.updatedAt).toISOString() : null,
    timeline: (order.timeline || []).map((entry, index) =>
      formatTimelineEntry(entry, order.orderNumber, index)
    ),
  };
}

async function getOrdersCollection() {
  const db = await getDatabase();
  return db.collection(ORDERS_COLLECTION);
}

async function ensureOrderIndexes() {
  const orders = await getOrdersCollection();

  await Promise.all([
    orders.createIndex({ orderNumber: 1 }, { unique: true }),
    orders.createIndex({ lookupKey: 1 }, { unique: true }),
    orders.createIndex({ userId: 1, createdAt: -1 }),
    orders.createIndex({ status: 1, createdAt: -1 }),
    orders.createIndex({ createdAt: -1 }),
  ]);

  return orders;
}

async function generateOrderNumber(orders) {
  const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, "");

  for (let attempt = 0; attempt < 8; attempt += 1) {
    const randomPart = Math.floor(100000 + Math.random() * 900000);
    const orderNumber = `ECM${datePart}${randomPart}`;
    const exists = await orders.findOne({ lookupKey: normalizeOrderLookup(orderNumber) });

    if (!exists) return orderNumber;
  }

  throw new Error("Unable to generate a unique order number.");
}

function buildInitialTimeline(location) {
  return [
    {
      status: "Pending",
      note: "Order placed successfully.",
      location: location || "Online Store",
      at: new Date(),
    },
  ];
}

export async function createOrder({
  user,
  customer,
  items,
  payment,
  pricing,
  source = "cart",
}) {
  if (!isMongoConfigured()) {
    throw new Error("MongoDB is not configured for orders.");
  }

  const orders = await ensureOrderIndexes();
  const timestamp = new Date();
  const orderNumber = await generateOrderNumber(orders);
  const normalizedItems = items.map((item) => ({
    id: String(item.id),
    name: String(item.name || ""),
    image: item.image || "/images/product.webp",
    price: Number(item.price || 0),
    oldPrice: item.oldPrice ? Number(item.oldPrice) : Number(item.price || 0),
    qty: Math.max(1, Number(item.qty || 1)),
    category: item.category || "",
    brand: item.brand || "",
  }));

  const subtotal = normalizedItems.reduce((sum, item) => sum + item.price * item.qty, 0);
  const originalSubtotal = normalizedItems.reduce((sum, item) => sum + item.oldPrice * item.qty, 0);
  const itemDiscount = Math.max(0, originalSubtotal - subtotal);
  const offerAmount = Math.max(0, Number(pricing?.offerAmount || 0));
  const deliveryFee = Math.max(0, Number(pricing?.deliveryFee || 0));
  const total = Math.max(0, subtotal - offerAmount + deliveryFee);

  const orderDocument = {
    orderNumber,
    lookupKey: normalizeOrderLookup(orderNumber),
    source,
    userId: user?.id || null,
    userEmail: user?.email || "",
    status: "Pending",
    customer: {
      name: String(customer?.name || "").trim(),
      phone: String(customer?.phone || "").trim(),
      district: String(customer?.district || "").trim(),
      address: String(customer?.address || "").trim(),
      note: String(customer?.note || "").trim(),
    },
    items: normalizedItems,
    payment: {
      method: String(payment?.method || "Cash on Delivery"),
      type: String(payment?.type || "offline"),
      senderNumber: String(payment?.senderNumber || "").trim(),
      transactionId: String(payment?.transactionId || "").trim(),
    },
    pricing: {
      subtotal,
      originalSubtotal,
      itemDiscount,
      offerAmount,
      deliveryFee,
      total,
    },
    timeline: buildInitialTimeline(customer?.district || customer?.address),
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  const result = await orders.insertOne(orderDocument);

  return formatOrder({
    ...orderDocument,
    _id: result.insertedId,
  });
}

export async function findOrderByOrderNumber(orderNumber) {
  if (!isMongoConfigured()) return null;

  const lookupKey = normalizeOrderLookup(orderNumber);
  if (!lookupKey) return null;

  const orders = await getOrdersCollection();
  const order = await orders.findOne({ lookupKey });
  return formatOrder(order);
}

export async function findOrdersByUserId(userId, status = "All") {
  if (!isMongoConfigured() || !userId) return [];

  const orders = await getOrdersCollection();
  const query = { userId };

  if (status && status !== "All") {
    query.status = status;
  }

  const docs = await orders.find(query).sort({ createdAt: -1 }).toArray();
  return docs.map(formatOrder);
}

export async function hasPurchasedProductByUserId(userId, productId) {
  if (!isMongoConfigured() || !userId || !productId) return false;

  const orders = await getOrdersCollection();
  const match = await orders.findOne({
    userId,
    "items.id": String(productId),
  });

  return Boolean(match);
}

export async function findLatestOrderByUserId(userId) {
  if (!isMongoConfigured() || !userId) return null;

  const orders = await getOrdersCollection();
  const order = await orders.findOne({ userId }, { sort: { createdAt: -1 } });
  return formatOrder(order);
}

export async function listOrdersForAdmin({ status = "All", search = "", limit = 100 } = {}) {
  if (!isMongoConfigured()) return [];

  const orders = await getOrdersCollection();
  const query = {};
  const searchValue = String(search || "").trim();

  if (status && status !== "All") {
    query.status = status;
  }

  if (searchValue) {
    query.$or = [
      { orderNumber: { $regex: searchValue, $options: "i" } },
      { lookupKey: { $regex: searchValue, $options: "i" } },
      { "customer.name": { $regex: searchValue, $options: "i" } },
      { "customer.phone": { $regex: searchValue, $options: "i" } },
      { userEmail: { $regex: searchValue, $options: "i" } },
    ];
  }

  const docs = await orders
    .find(query)
    .sort({ createdAt: -1 })
    .limit(Math.max(1, Math.min(200, Number(limit) || 100)))
    .toArray();

  return docs.map(formatOrder);
}

export async function updateOrderStatus(orderNumber, { status, note = "", location = "" }) {
  if (!isMongoConfigured()) {
    throw new Error("MongoDB is required to update orders.");
  }

  const lookupKey = normalizeOrderLookup(orderNumber);
  if (!lookupKey) {
    throw new Error("Order number is required.");
  }

  const nextStatus = String(status || "").trim();

  if (!ADMIN_ORDER_STATUSES.includes(nextStatus)) {
    throw new Error("Invalid order status.");
  }

  const orders = await ensureOrderIndexes();
  const timestamp = new Date();

  const result = await orders.updateOne(
    { lookupKey },
    {
      $set: {
        status: nextStatus,
        updatedAt: timestamp,
      },
      $push: {
        timeline: {
          status: nextStatus,
          note: String(note || "").trim() || `Order status updated to ${nextStatus}.`,
          location: String(location || "").trim() || "Admin Dashboard",
          at: timestamp,
        },
      },
    }
  );

  if (!result.matchedCount) {
    throw new Error("Order not found.");
  }

  return findOrderByOrderNumber(lookupKey);
}

export async function getAdminOrderStats() {
  if (!isMongoConfigured()) {
    return {
      totalOrders: 0,
      pendingOrders: 0,
      deliveredOrders: 0,
      totalRevenue: 0,
    };
  }

  const orders = await getOrdersCollection();
  const docs = await orders.find({}).toArray();

  return {
    totalOrders: docs.length,
    pendingOrders: docs.filter((order) => order.status === "Pending").length,
    deliveredOrders: docs.filter((order) => order.status === "Delivered").length,
    totalRevenue: docs.reduce((sum, order) => sum + Number(order?.pricing?.total || 0), 0),
  };
}
