import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import adminService from "../../services/adminProducts";
import { fetchProducts } from "../../services/products";
import "./index.scss";

const emptyForm = { name: "", priceEuros: "", category: "", sizes: "", description: "", images: [] };

const Admin = () => {
  const user = useSelector((s) => s.loggedUser);
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  const load = async () => {
    try {
      setProducts(await fetchProducts());
    } catch {
      setMsg("Failed to load products");
    }
  };

  useEffect(() => {
    document.title = "Admin – KoZmo";
    load();
  }, []);

  if (user === null) return <Navigate to="/login" replace />;
  if (!user.isAdmin) return <Navigate to="/" replace />;

  const field = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const startEdit = (p) => {
    setEditingId(p.id);
    setForm({
      name: p.name,
      priceEuros: p.price,
      category: p.category,
      sizes: (p.sizes || []).join(", "),
      description: p.description === "No description available" ? "" : p.description,
      images: [p.image, p.imageBack].filter(Boolean),
    });
    window.scrollTo(0, 0);
  };

  const handleUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setBusy(true);
    try {
      const urls = [];
      for (const file of files) urls.push(await adminService.uploadImage(file));
      setForm((f) => ({ ...f, images: [...f.images, ...urls].slice(0, 8) }));
    } catch {
      setMsg("Image upload failed");
    } finally {
      setBusy(false);
      e.target.value = "";
    }
  };

  const removeImage = (url) =>
    setForm((f) => ({ ...f, images: f.images.filter((u) => u !== url) }));

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setMsg("");
    try {
      const payload = {
        name: form.name,
        description: form.description,
        category: form.category || "uncategorized",
        sizes: form.sizes.split(",").map((s) => s.trim()).filter(Boolean),
        images: form.images,
      };
      if (editingId) {
        await adminService.update(editingId, payload);
        if (form.priceEuros !== "") await adminService.changePrice(editingId, form.priceEuros);
        setMsg("Product updated");
      } else {
        await adminService.create({ ...payload, priceEuros: form.priceEuros });
        setMsg("Product created");
      }
      resetForm();
      await load();
    } catch {
      setMsg("Save failed — check the fields and try again");
    } finally {
      setBusy(false);
    }
  };

  const archive = async (id) => {
    if (!window.confirm("Archive this product? It will be hidden from the shop.")) return;
    setBusy(true);
    try {
      await adminService.archive(id);
      if (editingId === id) resetForm();
      await load();
    } catch {
      setMsg("Archive failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="admin-view">
      <div className="admin-panel">
        <h1 className="admin-title">{editingId ? "Edit product" : "New product"}</h1>
        {msg && <p className="admin-msg">{msg}</p>}

        <form className="admin-form" onSubmit={submit}>
          <label>
            Name
            <input value={form.name} onChange={field("name")} required />
          </label>
          <label>
            Price (EUR)
            <input
              type="number"
              step="0.01"
              min="0"
              value={form.priceEuros}
              onChange={field("priceEuros")}
              required={!editingId}
              placeholder={editingId ? "leave blank to keep" : ""}
            />
          </label>
          <label>
            Category
            <input value={form.category} onChange={field("category")} />
          </label>
          <label>
            Sizes (comma-separated)
            <input value={form.sizes} onChange={field("sizes")} placeholder="S, M, L" />
          </label>
          <label>
            Description
            <textarea value={form.description} onChange={field("description")} rows={3} />
          </label>

          {form.images.length > 0 && (
            <div className="admin-images">
              {form.images.map((url) => (
                <div className="admin-thumb" key={url}>
                  <img src={url} alt="" />
                  <button type="button" onClick={() => removeImage(url)} aria-label="Remove image">
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          <label className="admin-upload">
            Upload image(s)
            <input type="file" accept="image/*" multiple onChange={handleUpload} disabled={busy} />
          </label>

          <div className="admin-actions">
            <button type="submit" className="login-btn" disabled={busy}>
              {editingId ? "Save changes" : "Create product"}
            </button>
            {editingId && (
              <button type="button" className="admin-cancel" onClick={resetForm} disabled={busy}>
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="admin-list">
        {products.map((p) => (
          <div className="admin-row" key={p.id}>
            <img src={p.image} alt="" />
            <div className="admin-row-info">
              <span className="admin-row-name">{p.name}</span>
              <span className="admin-row-meta">
                {p.category} · €{p.price}
              </span>
            </div>
            <div className="admin-row-actions">
              <button type="button" onClick={() => startEdit(p)}>
                Edit
              </button>
              <button type="button" className="danger" onClick={() => archive(p.id)}>
                Archive
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Admin;
