import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import Site from "./Site";
import { isAdminPath } from "../routes";

const mockAddDoc = jest.fn(() => Promise.resolve({ id: "lead1" }));
jest.mock("../firebase", () => ({ db: {} }));
jest.mock("firebase/firestore", () => ({
  addDoc: (...a) => mockAddDoc(...a),
  collection: (_db, name) => ({ name }),
  serverTimestamp: () => "SERVER_TIME",
}));

beforeEach(() => mockAddDoc.mockClear());

test("shows the pitch, pricing and a live savings figure", () => {
  render(<Site />);
  expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Your orders. Your customers. Your profit.");
  expect(screen.getByTestId("saving-month")).toHaveTextContent("£1,871 a month");

  fireEvent.change(screen.getByLabelText("Monthly orders through delivery apps"), { target: { value: "20000" } });
  expect(screen.getByTestId("saving-month")).toHaveTextContent("£4,871 a month"); // 6000 − (1000 + 129)
  fireEvent.click(screen.getByLabelText(/Include the Delivery Service/));
  expect(screen.getByTestId("saving-month")).toHaveTextContent("£4,851 a month");

  expect(screen.getAllByText("£129").length).toBeGreaterThan(0);
  expect(screen.getAllByText("£149").length).toBeGreaterThan(0);
});

test("a demo request is saved as a new lead", async () => {
  render(<Site />);
  fireEvent.change(screen.getByLabelText("Your name"), { target: { value: " Ann " } });
  fireEvent.change(screen.getByLabelText("Restaurant"), { target: { value: "Ann's Kitchen" } });
  fireEvent.change(screen.getByLabelText("Email"), { target: { value: "ann@annskitchen.co.uk" } });
  fireEvent.change(screen.getByLabelText("Monthly sales on delivery apps"), { target: { value: "£5k–£10k" } });
  await act(async () => {
    fireEvent.click(screen.getByText("Book my demo"));
  });

  await waitFor(() => expect(screen.getByText("Thanks, we'll be in touch")).toBeInTheDocument());
  const [col, data] = mockAddDoc.mock.calls[0];
  expect(col).toEqual({ name: "leads" });
  expect(data).toEqual({
    name: "Ann", restaurant: "Ann's Kitchen", email: "ann@annskitchen.co.uk", phone: "", city: "", apps: "",
    monthlySales: "£5k–£10k", message: "", status: "new", source: "website", createdAt: "SERVER_TIME",
  });
});

test("bots that fill the hidden field are quietly ignored", async () => {
  render(<Site />);
  fireEvent.change(screen.getByLabelText("Your name"), { target: { value: "Bot" } });
  fireEvent.change(screen.getByLabelText("Restaurant"), { target: { value: "Spam" } });
  fireEvent.change(screen.getByLabelText("Email"), { target: { value: "bot@spam.test" } });
  fireEvent.change(screen.getByLabelText("Leave this empty"), { target: { value: "http://spam" } });
  await act(async () => {
    fireEvent.click(screen.getByText("Book my demo"));
  });
  expect(screen.getByText("Thanks, we'll be in touch")).toBeInTheDocument();
  expect(mockAddDoc).not.toHaveBeenCalled();
});

test("/admin opens the console; everything else is the public site", () => {
  expect(isAdminPath("/admin")).toBe(true);
  expect(isAdminPath("/admin/restaurants")).toBe(true);
  expect(isAdminPath("/")).toBe(false);
  expect(isAdminPath("/administrator")).toBe(false);
  expect(isAdminPath("/pricing")).toBe(false);
});
