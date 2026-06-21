import cartReducer, {
  addLocalItem,
  updateLocalQuantity,
  removeLocalItem,
  clearCart,
} from "./cartReducer";

const product = {
  id: "prod_1",
  name: "Shirt",
  description: "nice",
  image: "http://img/a.png",
  price: 50, // euros
  category: "tops",
};

describe("cartReducer — guest (local) cart", () => {
  it("adds a new local item, converting price to cents and tagging it local", () => {
    const state = cartReducer([], addLocalItem({ product, quantity: 2, size: "M" }));
    expect(state).toHaveLength(1);
    expect(state[0]).toMatchObject({
      productId: "prod_1",
      name: "Shirt",
      price: 5000, // 50 € → cents
      quantity: 2,
      size: "M",
      isLocal: true,
    });
  });

  it("merges same product + size and caps quantity at 10", () => {
    const first = cartReducer([], addLocalItem({ product, quantity: 7, size: "M" }));
    const merged = cartReducer(first, addLocalItem({ product, quantity: 8, size: "M" }));
    expect(merged).toHaveLength(1);
    expect(merged[0].quantity).toBe(10); // 7 + 8 = 15, capped at 10
  });

  it("treats different sizes as separate line items", () => {
    const first = cartReducer([], addLocalItem({ product, quantity: 1, size: "M" }));
    const second = cartReducer(first, addLocalItem({ product, quantity: 1, size: "L" }));
    expect(second).toHaveLength(2);
  });

  it("normalizes a missing size to null so no-size items merge together", () => {
    const first = cartReducer([], addLocalItem({ product, quantity: 1 }));
    expect(first[0].size).toBeNull();
    const merged = cartReducer(first, addLocalItem({ product, quantity: 1 }));
    expect(merged).toHaveLength(1);
    expect(merged[0].quantity).toBe(2);
  });

  it("updateLocalQuantity sets quantity, and removes the item when <= 0", () => {
    const state = cartReducer([], addLocalItem({ product, quantity: 1, size: "M" }));
    const { id } = state[0];
    const updated = cartReducer(state, updateLocalQuantity({ id, quantity: 5 }));
    expect(updated[0].quantity).toBe(5);
    const removed = cartReducer(updated, updateLocalQuantity({ id, quantity: 0 }));
    expect(removed).toHaveLength(0);
  });

  it("removeLocalItem removes by id; clearCart empties the cart", () => {
    const state = cartReducer([], addLocalItem({ product, quantity: 1, size: "M" }));
    const { id } = state[0];
    expect(cartReducer(state, removeLocalItem(id))).toHaveLength(0);
    expect(cartReducer(state, clearCart())).toEqual([]);
  });
});
