import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import notificationReducer from "../../reducers/notificationReducer";
import Notification from "./index";

const renderWithStore = (notification) => {
  const store = configureStore({
    reducer: { notification: notificationReducer },
    preloadedState: { notification },
  });
  return render(
    <Provider store={store}>
      <Notification />
    </Provider>,
  );
};

describe("<Notification />", () => {
  it("renders nothing when there is no message", () => {
    renderWithStore({ message: "", type: null });
    expect(screen.queryByRole("heading")).not.toBeInTheDocument();
  });

  it("shows a success message with the 'valid' class", () => {
    renderWithStore({ message: "Order placed", type: "success" });
    const heading = screen.getByText("Order placed");
    expect(heading).toBeInTheDocument();
    expect(heading.parentElement).toHaveClass("valid");
  });

  it("shows a non-success message with the 'error' class", () => {
    renderWithStore({ message: "Something failed", type: "error" });
    expect(screen.getByText("Something failed").parentElement).toHaveClass("error");
  });
});
