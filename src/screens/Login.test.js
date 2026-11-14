import { act, fireEvent, render, screen } from "@testing-library/react";
import Login from "./Login";

const mockReset = jest.fn(() => Promise.resolve());
const mockSignIn = jest.fn(() => Promise.resolve());
jest.mock("../auth/AuthContext", () => ({
  useAuth: () => ({ signIn: mockSignIn, signOutUser: jest.fn(), resetPassword: mockReset }),
}));

beforeEach(() => jest.clearAllMocks());

test("forgot password sends a reset link to the email entered", async () => {
  render(<Login />);
  fireEvent.click(screen.getByText("Forgot password?"));
  expect(screen.getByText("Reset your password")).toBeInTheDocument();
  expect(screen.queryByLabelText("Password")).toBeNull();

  fireEvent.change(screen.getByLabelText("Email"), { target: { value: " me@menudock.test " } });
  await act(async () => {
    fireEvent.click(screen.getByText("Send reset link"));
  });
  expect(mockReset).toHaveBeenCalledWith("me@menudock.test");
  expect(screen.getByText(/a reset link is on its way/)).toBeInTheDocument();

  fireEvent.click(screen.getByText("Back to sign in"));
  expect(screen.getByLabelText("Password")).toBeInTheDocument();
});

test("asks for an email first, and doesn't reveal whether an account exists", async () => {
  render(<Login />);
  fireEvent.click(screen.getByText("Forgot password?"));
  await act(async () => {
    fireEvent.click(screen.getByText("Send reset link"));
  });
  expect(screen.getByText("Enter your email address.")).toBeInTheDocument();
  expect(mockReset).not.toHaveBeenCalled();

  mockReset.mockRejectedValueOnce({ code: "auth/user-not-found" });
  fireEvent.change(screen.getByLabelText("Email"), { target: { value: "nobody@menudock.test" } });
  await act(async () => {
    fireEvent.click(screen.getByText("Send reset link"));
  });
  expect(screen.getByText(/a reset link is on its way/)).toBeInTheDocument();
});

test("signing in still works", async () => {
  render(<Login />);
  fireEvent.change(screen.getByLabelText("Email"), { target: { value: "me@menudock.test" } });
  fireEvent.change(screen.getByLabelText("Password"), { target: { value: "secret" } });
  await act(async () => {
    fireEvent.click(screen.getByText("Sign in"));
  });
  expect(mockSignIn).toHaveBeenCalledWith("me@menudock.test", "secret");
});
