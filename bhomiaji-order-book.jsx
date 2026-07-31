import React, { useState, useEffect, useMemo } from "react";
import { Plus, Trash2, Package, ClipboardList, Tag, Search, X, Check, LogOut, Users, Lock, ScanLine, Camera, CameraOff } from "lucide-react";

const FONTS = `
@import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@500;600;700;800&family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@500;600&display=swap');
`;

const COLORS = {
  bg: "#F6F2E8",
  surface: "#FFFFFF",
  ink: "#241F19",
  inkSoft: "#6B6255",
  brass: "#B8862E",
  brassDark: "#8F6820",
  indigo: "#2E3F54",
  indigoSoft: "#4A5D75",
  line: "#E4DCC9",
  danger: "#A3432F",
  ok: "#3E6B4C",
};

const uid = () => Math.random().toString(36).slice(2, 10);

const ORDER_STATUSES = ["Pending", "Confirmed", "Dispatched", "Delivered"];
const PAYMENT_STATUSES = ["Unpaid", "Partial", "Paid"];

const statusColor = (s) =>
  ({
    Pending: COLORS.brassDark,
    Confirmed: COLORS.indigo,
    Dispatched: "#6B4FA0",
    Delivered: COLORS.ok,
    Unpaid: COLORS.danger,
    Partial: COLORS.brassDark,
    Paid: COLORS.ok,
  }[s] || COLORS.inkSoft);

async function load(key, fallback) {
  try {
    const r = await window.storage.get(key, true);
    return r ? JSON.parse(r.value) : fallback;
  } catch {
    return fallback;
  }
}
async function save(key, value) {
  try {
    await window.storage.set(key, JSON.stringify(value), true);
  } catch (e) {
    console.error("storage save failed", e);
  }
}

function TagCard({ children, style }) {
  return (
    <div
      style={{
        background: COLORS.surface,
        border: `1px solid ${COLORS.line}`,
        borderRadius: 10,
        position: "relative",
        ...style,
      }}
    >
      <div
        style={{
          position: "absolute",
          top: -7,
          left: 18,
          width: 14,
          height: 14,
          borderRadius: "50%",
          background: COLORS.bg,
          border: `1px solid ${COLORS.line}`,
        }}
      />
      {children}
    </div>
  );
}

function Pill({ text, color }) {
  return (
    <span
      style={{
        fontFamily: "'IBM Plex Mono', monospace",
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: 0.4,
        textTransform: "uppercase",
        color: "#fff",
        background: color,
        padding: "3px 9px",
        borderRadius: 20,
        whiteSpace: "nowrap",
      }}
    >
      {text}
    </span>
  );
}

function Field({ label, children }) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 6, fontFamily: "Inter" }}>
      <span style={{ fontSize: 12, fontWeight: 600, color: COLORS.inkSoft, letterSpacing: 0.2 }}>
        {label}
      </span>
      {children}
    </label>
  );
}

const inputStyle = {
  fontFamily: "Inter",
  fontSize: 14,
  padding: "9px 11px",
  borderRadius: 7,
  border: `1px solid ${COLORS.line}`,
  background: "#FCFAF4",
  color: COLORS.ink,
  outline: "none",
};

function Button({ children, onClick, variant = "primary", style, type = "button", disabled }) {
  const base = {
    fontFamily: "'Barlow Condensed', sans-serif",
    fontWeight: 700,
    fontSize: 15,
    letterSpacing: 0.3,
    padding: "9px 16px",
    borderRadius: 7,
    border: "none",
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.5 : 1,
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
  };
  const variants = {
    primary: { background: COLORS.indigo, color: "#fff" },
    brass: { background: COLORS.brass, color: "#fff" },
    ghost: { background: "transparent", color: COLORS.indigo, border: `1px solid ${COLORS.line}` },
    danger: { background: "transparent", color: COLORS.danger },
  };
  return (
    <button type={type} onClick={onClick} disabled={disabled} style={{ ...base, ...variants[variant], ...style }}>
      {children}
    </button>
  );
}

function AuthGate({ users, onLogin, needsSetup, onSetup }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  const submitLogin = (e) => {
    e.preventDefault();
    const u = users.find(
      (x) => x.username.toLowerCase() === username.trim().toLowerCase() && x.password === password
    );
    if (!u) {
      setError("Incorrect username or password.");
      return;
    }
    setError("");
    onLogin(u);
  };

  const submitSetup = (e) => {
    e.preventDefault();
    if (!username.trim() || !password || !name.trim()) return;
    onSetup({ id: uid(), username: username.trim(), password, name: name.trim(), role: "owner" });
  };

  return (
    <div
      style={{
        minHeight: "100%",
        background: COLORS.bg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        fontFamily: "Inter",
      }}
    >
      <style>{FONTS}</style>
      <TagCard style={{ padding: 28, width: 320 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
          <Lock size={16} color={COLORS.brassDark} />
          <h1
            style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontWeight: 800,
              fontSize: 26,
              letterSpacing: 0.5,
              color: COLORS.ink,
              margin: 0,
              textTransform: "uppercase",
            }}
          >
            Bhomiaji
          </h1>
        </div>
        <p style={{ fontSize: 12, color: COLORS.inkSoft, margin: "0 0 18px" }}>
          {needsSetup ? "First-time setup — create the owner login." : "Sign in to the order book."}
        </p>

        {needsSetup ? (
          <form onSubmit={submitSetup} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <Field label="Your name">
              <input style={inputStyle} value={name} onChange={(e) => setName(e.target.value)} required />
            </Field>
            <Field label="Choose a username">
              <input style={inputStyle} value={username} onChange={(e) => setUsername(e.target.value)} required />
            </Field>
            <Field label="Choose a password">
              <input style={inputStyle} type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </Field>
            <Button type="submit" variant="brass" onClick={submitSetup} style={{ justifyContent: "center", marginTop: 6 }}>
              Create owner account
            </Button>
          </form>
        ) : (
          <form onSubmit={submitLogin} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <Field label="Username">
              <input style={inputStyle} value={username} onChange={(e) => setUsername(e.target.value)} autoFocus />
            </Field>
            <Field label="Password">
              <input style={inputStyle} type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            </Field>
            {error && <div style={{ color: COLORS.danger, fontSize: 12 }}>{error}</div>}
            <Button type="submit" variant="brass" onClick={submitLogin} style={{ justifyContent: "center", marginTop: 6 }}>
              Sign in
            </Button>
          </form>
        )}
      </TagCard>
    </div>
  );
}

function TeamTab({ users, currentUser, onAdd, onRemove }) {
  const [form, setForm] = useState({ name: "", username: "", password: "" });

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.username.trim() || !form.password) return;
    if (users.some((u) => u.username.toLowerCase() === form.username.trim().toLowerCase())) {
      alert("That username is already taken.");
      return;
    }
    await onAdd({ id: uid(), name: form.name.trim(), username: form.username.trim(), password: form.password, role: "rep" });
    setForm({ name: "", username: "", password: "" });
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "minmax(260px, 340px) 1fr", gap: 28 }}>
      <TagCard style={{ padding: 20 }}>
        <h3 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 20, margin: "0 0 14px", color: COLORS.ink }}>
          Add Sales Rep
        </h3>
        <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <Field label="Name">
            <input style={inputStyle} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </Field>
          <Field label="Username">
            <input style={inputStyle} value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} required />
          </Field>
          <Field label="Password">
            <input style={inputStyle} type="text" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
          </Field>
          <Button type="submit" variant="brass" onClick={submit} style={{ justifyContent: "center", marginTop: 6 }}>
            <Plus size={16} /> Add rep
          </Button>
        </form>
      </TagCard>
      <div>
        <h3 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 20, margin: "0 0 14px", color: COLORS.ink }}>
          Team ({users.length})
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {users.map((u) => (
            <div
              key={u.id}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                background: COLORS.surface,
                border: `1px solid ${COLORS.line}`,
                borderRadius: 8,
                padding: "8px 12px",
              }}
            >
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: COLORS.ink }}>
                  {u.name} {u.id === currentUser.id && <span style={{ color: COLORS.inkSoft, fontWeight: 400 }}>(you)</span>}
                </div>
                <div style={{ fontSize: 12, color: COLORS.inkSoft }}>
                  @{u.username} · {u.role === "owner" ? "Owner" : "Sales rep"}
                </div>
              </div>
              {u.role !== "owner" && (
                <button onClick={() => onRemove(u.id)} style={{ background: "transparent", border: "none", color: COLORS.danger, cursor: "pointer" }}>
                  <Trash2 size={15} />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [users, setUsers] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [tab, setTab] = useState("catalog");
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    (async () => {
      const [u, p, o] = await Promise.all([load("users", []), load("products", []), load("orders", [])]);
      setUsers(u);
      setProducts(p);
      setOrders(o);
    })();
  }, []);

  const persistProducts = async (next) => {
    setProducts(next);
    await save("products", next);
  };
  const persistOrders = async (next) => {
    setOrders(next);
    await save("orders", next);
  };
  const persistUsers = async (next) => {
    setUsers(next);
    await save("users", next);
  };

  const brands = useMemo(() => [...new Set(products.map((p) => p.brand))].sort(), [products]);
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return products;
    return products.filter((p) => p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q));
  }, [products, search]);

  if (users === null) {
    return (
      <div style={{ padding: 40, fontFamily: "Inter", color: COLORS.inkSoft }}>
        <style>{FONTS}</style>
        Loading order book…
      </div>
    );
  }

  if (!currentUser) {
    return (
      <AuthGate
        users={users}
        needsSetup={users.length === 0}
        onLogin={setCurrentUser}
        onSetup={async (owner) => {
          await persistUsers([owner]);
          setCurrentUser(owner);
        }}
      />
    );
  }

  const isOwner = currentUser.role === "owner";

  return (
    <div style={{ background: COLORS.bg, minHeight: "100%", padding: "20px 16px 60px", fontFamily: "Inter" }}>
      <style>{FONTS}</style>

      <div style={{ maxWidth: 980, margin: "0 auto 22px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 10, flexWrap: "wrap" }}>
            <h1
              style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontWeight: 800,
                fontSize: 34,
                letterSpacing: 0.5,
                color: COLORS.ink,
                margin: 0,
                textTransform: "uppercase",
              }}
            >
              Bhomiaji
            </h1>
            <span
              style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: 12,
                color: COLORS.brassDark,
                letterSpacing: 1,
                textTransform: "uppercase",
                borderLeft: `2px solid ${COLORS.brass}`,
                paddingLeft: 10,
              }}
            >
              Order Book
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 13, color: COLORS.inkSoft }}>
              {currentUser.name} · <span style={{ textTransform: "capitalize" }}>{currentUser.role}</span>
            </span>
            <Button variant="ghost" onClick={() => setCurrentUser(null)} style={{ fontSize: 13, padding: "6px 12px" }}>
              <LogOut size={13} /> Sign out
            </Button>
          </div>
        </div>
        <p style={{ color: COLORS.inkSoft, fontSize: 13, margin: "4px 0 0" }}>
          Catalog, retailer orders, and payment tracking — shared across the whole team.
        </p>
      </div>

      <div style={{ maxWidth: 980, margin: "0 auto 22px", display: "flex", gap: 6, borderBottom: `1px solid ${COLORS.line}`, flexWrap: "wrap" }}>
        {[
          { id: "catalog", label: "Catalog", icon: Package },
          ...(isOwner ? [{ id: "add", label: "Add Product", icon: Plus }] : []),
          { id: "order", label: "New Order", icon: Tag },
          { id: "orders", label: `Orders (${orders.length})`, icon: ClipboardList },
          ...(isOwner ? [{ id: "team", label: "Team", icon: Users }] : []),
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontWeight: 700,
              fontSize: 16,
              letterSpacing: 0.3,
              padding: "9px 14px",
              background: "transparent",
              border: "none",
              borderBottom: tab === id ? `3px solid ${COLORS.brass}` : "3px solid transparent",
              color: tab === id ? COLORS.ink : COLORS.inkSoft,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <Icon size={16} />
            {label}
          </button>
        ))}
      </div>

      <div style={{ maxWidth: 980, margin: "0 auto" }}>
        {tab === "catalog" && (
          <CatalogTab
            products={filtered}
            search={search}
            setSearch={setSearch}
            isOwner={isOwner}
            onDelete={async (id) => persistProducts(products.filter((p) => p.id !== id))}
          />
        )}
        {tab === "add" && isOwner && (
          <AddProductTab
            onAdd={async (p) => persistProducts([...products, p])}
            products={products}
            onDelete={async (id) => persistProducts(products.filter((p) => p.id !== id))}
          />
        )}
        {tab === "order" && (
          <NewOrderTab
            products={products}
            brands={brands}
            currentUser={currentUser}
            onSubmit={async (order) => {
              await persistOrders([order, ...orders]);
              const next = products.map((p) => {
                const items = order.items.filter((i) => i.productId === p.id);
                if (!items.length) return p;
                const usedQty = items.reduce((s, i) => s + i.qty, 0);
                return { ...p, stock: Math.max(0, (p.stock || 0) - usedQty) };
              });
              await persistProducts(next);
              setTab("orders");
            }}
          />
        )}
        {tab === "orders" && (
          <OrdersTab
            orders={orders}
            onUpdate={async (id, patch) => persistOrders(orders.map((o) => (o.id === id ? { ...o, ...patch } : o)))}
          />
        )}
        {tab === "team" && isOwner && (
          <TeamTab
            users={users}
            currentUser={currentUser}
            onAdd={async (u) => persistUsers([...users, u])}
            onRemove={async (id) => persistUsers(users.filter((u) => u.id !== id))}
          />
        )}
      </div>
    </div>
  );
}

function CatalogTab({ products, search, setSearch, isOwner, onDelete }) {
  return (
    <div>
      <div style={{ position: "relative", marginBottom: 18, maxWidth: 340 }}>
        <Search size={15} style={{ position: "absolute", left: 11, top: 11, color: COLORS.inkSoft }} />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search brand or product…"
          style={{ ...inputStyle, paddingLeft: 32, width: "100%" }}
        />
      </div>

      {products.length === 0 ? (
        <EmptyState text="No products yet." />
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 16 }}>
          {products.map((p) => (
            <TagCard key={p.id} style={{ padding: 14 }}>
              <div
                style={{
                  width: "100%",
                  aspectRatio: "1",
                  borderRadius: 6,
                  overflow: "hidden",
                  background: COLORS.bg,
                  marginBottom: 10,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: `1px solid ${COLORS.line}`,
                }}
              >
                {p.imageUrl ? (
                  <img src={p.imageUrl} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 40, fontWeight: 800, color: COLORS.line }}>
                    {p.brand?.[0] || "?"}
                  </span>
                )}
              </div>
              <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: COLORS.brassDark, letterSpacing: 0.6, textTransform: "uppercase", marginBottom: 2 }}>
                {p.brand}
              </div>
              <div style={{ fontWeight: 600, fontSize: 14, color: COLORS.ink, marginBottom: 6 }}>{p.name}</div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontWeight: 600, fontSize: 15, color: COLORS.ink }}>₹{p.price}</span>
                <span style={{ fontSize: 11, color: p.stock > 0 ? COLORS.inkSoft : COLORS.danger, fontWeight: 600 }}>
                  {p.stock > 0 ? `${p.stock} in stock` : "Out of stock"}
                </span>
              </div>
              {p.sizes && <div style={{ fontSize: 11, color: COLORS.inkSoft, marginTop: 6 }}>Sizes: {p.sizes}</div>}
              {isOwner && (
                <button
                  onClick={() => onDelete(p.id)}
                  title="Remove product"
                  style={{ position: "absolute", top: 10, right: 10, background: "transparent", border: "none", color: COLORS.inkSoft, cursor: "pointer", padding: 4 }}
                >
                  <Trash2 size={14} />
                </button>
              )}
            </TagCard>
          ))}
        </div>
      )}
    </div>
  );
}

function AddProductTab({ onAdd, products, onDelete }) {
  const [form, setForm] = useState({ brand: "", name: "", imageUrl: "", barcode: "", price: "", sizes: "", stock: "" });
  const [saved, setSaved] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!form.brand || !form.name || !form.price) return;
    await onAdd({
      id: uid(),
      brand: form.brand.trim(),
      name: form.name.trim(),
      imageUrl: form.imageUrl.trim(),
      barcode: form.barcode.trim(),
      price: Number(form.price) || 0,
      sizes: form.sizes.trim(),
      stock: Number(form.stock) || 0,
    });
    setForm({ brand: "", name: "", imageUrl: "", barcode: "", price: "", sizes: "", stock: "" });
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "minmax(280px, 380px) 1fr", gap: 28 }}>
      <TagCard style={{ padding: 20 }}>
        <h3 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 20, margin: "0 0 14px", color: COLORS.ink }}>New Product</h3>
        <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <Field label="Brand name">
            <input style={inputStyle} value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} placeholder="e.g. Levi's" required />
          </Field>
          <Field label="Product name">
            <input style={inputStyle} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Slim Fit Denim Shirt" required />
          </Field>
          <Field label="Photo URL (paste a link — e.g. from Google Drive share link, Imgur)">
            <input style={inputStyle} value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} placeholder="https://…" />
          </Field>
          <Field label="Barcode / SKU (for scanning — scan it here with a scanner, or type it)">
            <input style={inputStyle} value={form.barcode} onChange={(e) => setForm({ ...form, barcode: e.target.value })} placeholder="Scan or type the code" />
          </Field>
          <div style={{ display: "flex", gap: 10 }}>
            <Field label="Price (₹)">
              <input style={inputStyle} type="number" min="0" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required />
            </Field>
            <Field label="Stock qty">
              <input style={inputStyle} type="number" min="0" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} />
            </Field>
          </div>
          <Field label="Sizes (comma-separated)">
            <input style={inputStyle} value={form.sizes} onChange={(e) => setForm({ ...form, sizes: e.target.value })} placeholder="S, M, L, XL" />
          </Field>
          <Button type="submit" variant="brass" onClick={submit} style={{ justifyContent: "center", marginTop: 6 }}>
            <Plus size={16} /> Add to catalog
          </Button>
          {saved && (
            <div style={{ color: COLORS.ok, fontSize: 13, display: "flex", alignItems: "center", gap: 5 }}>
              <Check size={14} /> Added.
            </div>
          )}
        </form>
      </TagCard>

      <div>
        <h3 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 20, margin: "0 0 14px", color: COLORS.ink }}>Current Catalog ({products.length})</h3>
        {products.length === 0 ? (
          <EmptyState text="Nothing added yet." />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {products.map((p) => (
              <div key={p.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: COLORS.surface, border: `1px solid ${COLORS.line}`, borderRadius: 8, padding: "8px 12px" }}>
                <div>
                  <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: COLORS.brassDark, textTransform: "uppercase" }}>{p.brand}</span>
                  <div style={{ fontSize: 14, fontWeight: 600, color: COLORS.ink }}>{p.name}</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 13, color: COLORS.inkSoft }}>₹{p.price} · stock {p.stock}</span>
                  <button onClick={() => onDelete(p.id)} style={{ background: "transparent", border: "none", color: COLORS.danger, cursor: "pointer" }}>
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function NewOrderTab({ products, brands, currentUser, onSubmit }) {
  const [retailerName, setRetailerName] = useState("");
  const [brandFilter, setBrandFilter] = useState("All");
  const [cart, setCart] = useState([]);

  const visible = useMemo(() => (brandFilter === "All" ? products : products.filter((p) => p.brand === brandFilter)), [products, brandFilter]);

  const addItem = (product, size) => {
    setCart((c) => {
      const existing = c.find((i) => i.productId === product.id && i.size === size);
      if (existing) return c.map((i) => (i === existing ? { ...i, qty: i.qty + 1 } : i));
      return [...c, { productId: product.id, size, qty: 1 }];
    });
  };
  const updateQty = (idx, qty) => setCart((c) => c.map((i, ix) => (ix === idx ? { ...i, qty: Math.max(1, qty) } : i)));
  const removeItem = (idx) => setCart((c) => c.filter((_, ix) => ix !== idx));

  const cartDetailed = cart.map((i) => {
    const p = products.find((pp) => pp.id === i.productId);
    return { ...i, product: p, lineTotal: p ? p.price * i.qty : 0 };
  });
  const total = cartDetailed.reduce((s, i) => s + i.lineTotal, 0);
  const canSubmit = retailerName.trim() && cart.length > 0;

  const submit = async () => {
    if (!canSubmit) return;
    await onSubmit({
      id: uid(),
      repName: currentUser.name,
      retailerName: retailerName.trim(),
      date: new Date().toISOString(),
      items: cartDetailed.map((i) => ({ productId: i.productId, brand: i.product?.brand, name: i.product?.name, size: i.size, qty: i.qty, price: i.product?.price || 0 })),
      totalAmount: total,
      orderStatus: "Pending",
      paymentStatus: "Unpaid",
    });
    setCart([]);
    setRetailerName("");
  };

  const [pendingScan, setPendingScan] = useState(null); // { product }

  const handleScannedCode = (code) => {
    const clean = code.trim();
    if (!clean) return { ok: false, msg: "Empty code." };
    const match = products.find((p) => p.barcode && p.barcode.trim() === clean);
    if (!match) return { ok: false, msg: `No product matches code "${clean}".` };
    const sizeList = match.sizes ? match.sizes.split(",").map((s) => s.trim()).filter(Boolean) : [];
    if (sizeList.length <= 1) {
      addItem(match, sizeList[0] || "");
      return { ok: true, msg: `Added: ${match.brand} — ${match.name}${sizeList[0] ? ` (${sizeList[0]})` : ""}` };
    }
    setPendingScan({ product: match, sizeList });
    return { ok: true, msg: `Scanned ${match.brand} — ${match.name}. Pick a size below.` };
  };

  const resolvePendingSize = (size) => {
    if (!pendingScan) return;
    addItem(pendingScan.product, size);
    setPendingScan(null);
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr minmax(280px, 340px)", gap: 24 }}>
      <div>
        <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
          <Field label="Retailer / shop name">
            <input style={inputStyle} value={retailerName} onChange={(e) => setRetailerName(e.target.value)} placeholder="Retailer placing the order" />
          </Field>
        </div>

        <ScanPanel onScan={handleScannedCode} />

        {pendingScan && (
          <TagCard style={{ padding: 14, marginBottom: 16, borderColor: COLORS.brass }}>
            <div style={{ fontSize: 13, color: COLORS.inkSoft, marginBottom: 8 }}>
              Choose a size for <strong style={{ color: COLORS.ink }}>{pendingScan.product.brand} — {pendingScan.product.name}</strong>:
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {pendingScan.sizeList.map((s) => (
                <Button key={s} variant="ghost" onClick={() => resolvePendingSize(s)} style={{ padding: "6px 14px" }}>
                  {s}
                </Button>
              ))}
              <Button variant="danger" onClick={() => setPendingScan(null)} style={{ padding: "6px 14px" }}>
                Cancel
              </Button>
            </div>
          </TagCard>
        )}

        <div style={{ display: "flex", gap: 6, marginBottom: 14, flexWrap: "wrap" }}>
          {["All", ...brands].map((b) => (
            <button
              key={b}
              onClick={() => setBrandFilter(b)}
              style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: 11,
                textTransform: "uppercase",
                letterSpacing: 0.4,
                padding: "5px 10px",
                borderRadius: 20,
                border: `1px solid ${brandFilter === b ? COLORS.indigo : COLORS.line}`,
                background: brandFilter === b ? COLORS.indigo : "transparent",
                color: brandFilter === b ? "#fff" : COLORS.inkSoft,
                cursor: "pointer",
              }}
            >
              {b}
            </button>
          ))}
        </div>
        {visible.length === 0 ? (
          <EmptyState text="No products in the catalog yet." />
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 14 }}>
            {visible.map((p) => (
              <ProductPicker key={p.id} product={p} onAdd={addItem} />
            ))}
          </div>
        )}
      </div>

      <TagCard style={{ padding: 16, alignSelf: "start", position: "sticky", top: 12 }}>
        <h3 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 18, margin: "0 0 10px", color: COLORS.ink }}>Order Summary</h3>
        {cart.length === 0 ? (
          <p style={{ fontSize: 13, color: COLORS.inkSoft }}>Tap "+ Add" on a product to build the order.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 12 }}>
            {cartDetailed.map((i, idx) => (
              <div key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 13 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, color: COLORS.ink }}>{i.product?.name}</div>
                  <div style={{ color: COLORS.inkSoft, fontSize: 11 }}>{i.product?.brand} {i.size ? `· ${i.size}` : ""}</div>
                </div>
                <input type="number" min={1} value={i.qty} onChange={(e) => updateQty(idx, Number(e.target.value))} style={{ ...inputStyle, width: 48, padding: "4px 6px", textAlign: "center" }} />
                <button onClick={() => removeItem(idx)} style={{ background: "transparent", border: "none", color: COLORS.danger, cursor: "pointer", marginLeft: 4 }}>
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
        <div style={{ borderTop: `1px solid ${COLORS.line}`, paddingTop: 10, display: "flex", justifyContent: "space-between", fontFamily: "'IBM Plex Mono', monospace", fontWeight: 600, fontSize: 15, color: COLORS.ink, marginBottom: 12 }}>
          <span>Total</span>
          <span>₹{total.toLocaleString("en-IN")}</span>
        </div>
        <Button variant="brass" onClick={submit} disabled={!canSubmit} style={{ width: "100%", justifyContent: "center" }}>
          Submit Order
        </Button>
      </TagCard>
    </div>
  );
}

function ScanPanel({ onScan }) {
  const [code, setCode] = useState("");
  const [feedback, setFeedback] = useState(null); // {ok, msg}
  const [cameraOn, setCameraOn] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const videoRef = React.useRef(null);
  const streamRef = React.useRef(null);
  const detectorRef = React.useRef(null);
  const rafRef = React.useRef(null);
  const inputRef = React.useRef(null);

  const showFeedback = (result) => {
    setFeedback(result);
    setTimeout(() => setFeedback(null), 2200);
  };

  const submitCode = (e) => {
    e?.preventDefault();
    if (!code.trim()) return;
    showFeedback(onScan(code));
    setCode("");
    inputRef.current?.focus();
  };

  const stopCamera = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setCameraOn(false);
  };

  const startCamera = async () => {
    setCameraError("");
    if (!("BarcodeDetector" in window)) {
      setCameraError("Camera scanning isn't supported in this browser — use the code box below with a scanner or by typing instead.");
      return;
    }
    try {
      detectorRef.current = new window.BarcodeDetector();
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraOn(true);
      const tick = async () => {
        if (!videoRef.current || !detectorRef.current) return;
        try {
          const codes = await detectorRef.current.detect(videoRef.current);
          if (codes && codes.length > 0) {
            const value = codes[0].rawValue;
            stopCamera();
            showFeedback(onScan(value));
            return;
          }
        } catch {
          // ignore per-frame detection errors
        }
        rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);
    } catch (err) {
      setCameraError("Couldn't access the camera — check camera permission for this page, or use the code box below instead.");
    }
  };

  useEffect(() => () => stopCamera(), []);

  return (
    <TagCard style={{ padding: 14, marginBottom: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
        <ScanLine size={16} color={COLORS.brassDark} />
        <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 16, color: COLORS.ink }}>
          Scan to Order
        </span>
      </div>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "flex-end" }}>
        <form onSubmit={submitCode} style={{ flex: 1, minWidth: 220, display: "flex", gap: 8 }}>
          <input
            ref={inputRef}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Scan with a barcode scanner, or type the code and press Enter"
            style={{ ...inputStyle, flex: 1 }}
            autoFocus
          />
          <Button type="submit" variant="ghost" onClick={submitCode} style={{ padding: "9px 14px" }}>
            Add
          </Button>
        </form>

        {!cameraOn ? (
          <Button variant="brass" onClick={startCamera} style={{ padding: "9px 14px" }}>
            <Camera size={15} /> Scan with camera
          </Button>
        ) : (
          <Button variant="danger" onClick={stopCamera} style={{ padding: "9px 14px", border: `1px solid ${COLORS.line}` }}>
            <CameraOff size={15} /> Stop camera
          </Button>
        )}
      </div>

      {cameraError && <div style={{ color: COLORS.danger, fontSize: 12, marginTop: 8 }}>{cameraError}</div>}

      {cameraOn && (
        <div style={{ marginTop: 10, borderRadius: 8, overflow: "hidden", border: `1px solid ${COLORS.line}`, maxWidth: 340 }}>
          <video ref={videoRef} style={{ width: "100%", display: "block" }} muted playsInline />
        </div>
      )}

      {feedback && (
        <div style={{ marginTop: 8, fontSize: 13, color: feedback.ok ? COLORS.ok : COLORS.danger, display: "flex", alignItems: "center", gap: 5 }}>
          {feedback.ok ? <Check size={14} /> : <X size={14} />} {feedback.msg}
        </div>
      )}

      <p style={{ fontSize: 11, color: COLORS.inkSoft, margin: "8px 0 0" }}>
        Works with a USB/Bluetooth barcode scanner (acts like a keyboard) or your phone camera. Each product needs a barcode saved against it — the owner adds this when creating the product.
      </p>
    </TagCard>
  );
}

function ProductPicker({ product, onAdd }) {
  const sizeOptions = product.sizes ? product.sizes.split(",").map((s) => s.trim()).filter(Boolean) : [];
  const [size, setSize] = useState(sizeOptions[0] || "");

  return (
    <TagCard style={{ padding: 12 }}>
      <div style={{ width: "100%", aspectRatio: "1", borderRadius: 6, overflow: "hidden", background: COLORS.bg, marginBottom: 8, border: `1px solid ${COLORS.line}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
        {product.imageUrl ? (
          <img src={product.imageUrl} alt={product.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 32, fontWeight: 800, color: COLORS.line }}>{product.brand?.[0] || "?"}</span>
        )}
      </div>
      <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: COLORS.brassDark, textTransform: "uppercase" }}>{product.brand}</div>
      <div style={{ fontWeight: 600, fontSize: 13, color: COLORS.ink, marginBottom: 6 }}>{product.name}</div>
      <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 13, color: COLORS.ink, marginBottom: 8 }}>₹{product.price}</div>
      {sizeOptions.length > 0 && (
        <select value={size} onChange={(e) => setSize(e.target.value)} style={{ ...inputStyle, width: "100%", marginBottom: 8, fontSize: 12, padding: "6px 8px" }}>
          {sizeOptions.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      )}
      <Button variant="ghost" onClick={() => onAdd(product, size)} style={{ width: "100%", justifyContent: "center", fontSize: 13, padding: "6px 10px" }}>
        <Plus size={13} /> Add
      </Button>
    </TagCard>
  );
}

function OrdersTab({ orders, onUpdate }) {
  if (orders.length === 0) return <EmptyState text="No orders placed yet." />;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {orders.map((o) => (
        <TagCard key={o.id} style={{ padding: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 10, marginBottom: 8 }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: 16, color: COLORS.ink }}>{o.retailerName}</div>
              <div style={{ fontSize: 12, color: COLORS.inkSoft }}>
                Rep: {o.repName} · {new Date(o.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <Pill text={o.orderStatus} color={statusColor(o.orderStatus)} />
              <Pill text={o.paymentStatus} color={statusColor(o.paymentStatus)} />
            </div>
          </div>

          <div style={{ borderTop: `1px solid ${COLORS.line}`, paddingTop: 8, marginBottom: 10 }}>
            {o.items.map((it, ix) => (
              <div key={ix} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, padding: "3px 0", color: COLORS.ink }}>
                <span>{it.brand} — {it.name} {it.size ? `(${it.size})` : ""} × {it.qty}</span>
                <span style={{ fontFamily: "'IBM Plex Mono', monospace" }}>₹{(it.price * it.qty).toLocaleString("en-IN")}</span>
              </div>
            ))}
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
            <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontWeight: 700, fontSize: 15, color: COLORS.ink }}>Total ₹{o.totalAmount.toLocaleString("en-IN")}</span>
            <div style={{ display: "flex", gap: 8 }}>
              <select value={o.orderStatus} onChange={(e) => onUpdate(o.id, { orderStatus: e.target.value })} style={{ ...inputStyle, fontSize: 12, padding: "5px 8px" }}>
                {ORDER_STATUSES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <select value={o.paymentStatus} onChange={(e) => onUpdate(o.id, { paymentStatus: e.target.value })} style={{ ...inputStyle, fontSize: 12, padding: "5px 8px" }}>
                {PAYMENT_STATUSES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>
        </TagCard>
      ))}
    </div>
  );
}

function EmptyState({ text }) {
  return (
    <div style={{ border: `1px dashed ${COLORS.line}`, borderRadius: 10, padding: 30, textAlign: "center", color: COLORS.inkSoft, fontSize: 13 }}>
      {text}
    </div>
  );
}
