import { act, fireEvent, render, screen } from "@testing-library/react";
import GoLive from "./GoLive";

const mockActions = {
  createOwnerLogin: jest.fn(),
  createStripeLink: jest.fn(),
  listOwners: jest.fn(() => Promise.resolve([])),
  refreshStripe: jest.fn(),
  setBilling: jest.fn(() => Promise.resolve()),
  setStatus: jest.fn(() => Promise.resolve()),
};
jest.mock("../lib/adminActions", () => ({
  createOwnerLogin: (...a) => mockActions.createOwnerLogin(...a),
  createStripeLink: (...a) => mockActions.createStripeLink(...a),
  listOwners: (...a) => mockActions.listOwners(...a),
  refreshStripe: (...a) => mockActions.refreshStripe(...a),
  setBilling: (...a) => mockActions.setBilling(...a),
  setStatus: (...a) => mockActions.setStatus(...a),
  stripeCoverLabel: () => "1.75% + 20p",
}));

const taco = (extra = {}) => ({
  id: "taco-monster", name: "Taco Monster", status: "pending",
  billing: { platformFeePercent: 5, monthlyRetainer: 129, setupFee: 300 },
  payments: { provider: "stripe-connect", stripeAccountId: "" },
  ...extra,
});

const renderLive = async (r, onChanged = jest.fn()) => {
  await act(async () => { render(<GoLive restaurant={r} onChanged={onChanged} />); });
  return onChanged;
};
const click = async (text) => act(async () => { fireEvent.click(screen.getByText(text)); });

beforeEach(() => {
  // CRA resets mock implementations before every test, so set them here.
  mockActions.listOwners.mockResolvedValue([]);
  mockActions.setBilling.mockResolvedValue();
  mockActions.setStatus.mockResolvedValue();
  window.confirm = jest.fn(() => true);
});

test("go live warns when Stripe isn't ready, then sets the restaurant active", async () => {
  const onChanged = await renderLive(taco());
  await click("Go live");
  expect(window.confirm).toHaveBeenCalledWith(expect.stringMatching(/Stripe account isn't ready yet/));
  expect(mockActions.setStatus).toHaveBeenCalledWith("taco-monster", "active");
  expect(onChanged).toHaveBeenCalled();
  expect(screen.getByRole("status")).toHaveTextContent("Taco Monster is live.");
});

test("cancelling the confirm changes nothing; a live restaurant can be paused", async () => {
  window.confirm = jest.fn(() => false);
  await renderLive(taco({ status: "active" }));
  await click("Pause orders");
  expect(mockActions.setStatus).not.toHaveBeenCalled();

  window.confirm = jest.fn(() => true);
  await click("Pause orders");
  expect(mockActions.setStatus).toHaveBeenCalledWith("taco-monster", "paused");
});

test("'Stripe costs only' sets every MenuDock fee to 0 and saves", async () => {
  await renderLive(taco());
  expect(screen.getByText("Save fees")).toBeDisabled(); // nothing changed yet
  await click("Stripe costs only");
  await click("Save fees");
  expect(mockActions.setBilling).toHaveBeenCalledWith("taco-monster", { platformFeePercent: 0, monthlyRetainer: 0, setupFee: 0 });
  expect(screen.getByText(/Stripe costs \(1.75% \+ 20p per order\) are always passed on/)).toBeInTheDocument();
});

test("bad fee values can't be saved", async () => {
  await renderLive(taco());
  fireEvent.change(screen.getByLabelText("MenuDock fee (% of food)"), { target: { value: "-1" } });
  expect(screen.getByText("MenuDock fee must be between 0 and 30%.")).toBeInTheDocument();
  expect(screen.getByText("Save fees")).toBeDisabled();
});

test("creating the Stripe account shows a link to send the owner", async () => {
  mockActions.createStripeLink.mockResolvedValue({ url: "https://pay.example/payments/stripe-onboarding?r=taco-monster&t=abc", accountId: "acct_1" });
  await renderLive(taco());
  expect(screen.getByTestId("stripe-status")).toHaveTextContent("Not set up yet");
  await click("Create Stripe account");
  expect(mockActions.createStripeLink).toHaveBeenCalledWith("taco-monster");
  expect(screen.getByLabelText("Owner's Stripe link")).toHaveValue("https://pay.example/payments/stripe-onboarding?r=taco-monster&t=abc");
});

test("shows where Stripe onboarding is up to, and checks it", async () => {
  mockActions.refreshStripe.mockResolvedValue({ ready: true });
  await renderLive(taco({ payments: { stripeAccountId: "", stripeStatus: { ready: false, stillNeeded: 3 } } }));
  expect(screen.getByTestId("stripe-status")).toHaveTextContent("Waiting for the owner to finish (3 details still needed)");
  expect(screen.getByText("Get owner's Stripe link")).toBeInTheDocument();
  await click("Check Stripe");
  expect(screen.getByRole("status")).toHaveTextContent("Stripe is ready. Orders now pay into their account.");
});

test("a ready account says where orders pay into", async () => {
  await renderLive(taco({ payments: { stripeAccountId: "acct_9", stripeStatus: { ready: true } } }));
  expect(screen.getByTestId("stripe-status")).toHaveTextContent("Ready: orders pay into acct_9");
});

test("creating the owner's login shows the temporary password once", async () => {
  mockActions.createOwnerLogin.mockResolvedValue({ uid: "u1", email: "bro@taco.test", created: true, temporaryPassword: "Kp7m-Tx4q-Hw9z" });
  await renderLive(taco());
  expect(screen.getByText("Create login")).toBeDisabled();
  fireEvent.change(screen.getByLabelText("Owner's email"), { target: { value: "bro@taco.test" } });
  await click("Create login");
  expect(mockActions.createOwnerLogin).toHaveBeenCalledWith("taco-monster", "bro@taco.test");
  expect(screen.getByTestId("owner-login")).toHaveTextContent("Sign in on the tablet with bro@taco.test and password Kp7m-Tx4q-Hw9z");
});

test("server errors are shown, not swallowed", async () => {
  mockActions.createOwnerLogin.mockRejectedValue(new Error("bro@taco.test already runs another restaurant (noodle-lab). Use a different email."));
  await renderLive(taco());
  fireEvent.change(screen.getByLabelText("Owner's email"), { target: { value: "bro@taco.test" } });
  await click("Create login");
  expect(screen.getByRole("status")).toHaveTextContent(/already runs another restaurant/);
});
