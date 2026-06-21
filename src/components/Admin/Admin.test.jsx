import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import loggedUserReducer from "../../reducers/loggedUserReducer";

// Keep the page off the network — the guard is what we're testing.
vi.mock("../../services/products", () => ({
  fetchProducts: vi.fn(() => Promise.resolve([])),
}));
vi.mock("../../services/adminProducts", () => ({
  default: {
    create: vi.fn(),
    update: vi.fn(),
    changePrice: vi.fn(),
    archive: vi.fn(),
    uploadImage: vi.fn(),
  },
}));

import Admin from "./index";

const renderWithUser = (loggedUser) => {
  const store = configureStore({
    reducer: { loggedUser: loggedUserReducer },
    preloadedState: { loggedUser },
  });
  return render(
    <Provider store={store}>
      <MemoryRouter initialEntries={["/admin"]}>
        <Routes>
          <Route path="/admin" element={<Admin />} />
          <Route path="/" element={<div>home page</div>} />
          <Route path="/login" element={<div>login page</div>} />
        </Routes>
      </MemoryRouter>
    </Provider>,
  );
};

describe("<Admin /> access guard", () => {
  it("redirects anonymous visitors to login", () => {
    renderWithUser(null);
    expect(screen.getByText("login page")).toBeInTheDocument();
  });

  it("redirects non-admin users to home", () => {
    renderWithUser({ username: "bob", isAdmin: false });
    expect(screen.getByText("home page")).toBeInTheDocument();
  });

  it("renders the admin panel for admins", async () => {
    renderWithUser({ username: "admin", isAdmin: true });
    expect(await screen.findByText("New product")).toBeInTheDocument();
  });
});
