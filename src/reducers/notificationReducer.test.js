import notificationReducer, {
  setMessage,
  removeMessage,
} from "./notificationReducer";

describe("notificationReducer", () => {
  it("sets the message and type", () => {
    const state = notificationReducer(
      undefined,
      setMessage({ message: "Saved", type: "success" }),
    );
    expect(state).toEqual({ message: "Saved", type: "success" });
  });

  it("clears the message", () => {
    const populated = { message: "x", type: "error" };
    expect(notificationReducer(populated, removeMessage())).toEqual({
      message: "",
      type: null,
    });
  });
});
