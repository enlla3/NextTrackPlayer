import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import App from "../../pages/App";

jest.mock("../../config", () => ({ API_BASE_URL: "http://test/api" }));
jest.mock("../../components/YouTubePlayer", () => () => (
	<div data-testid="yt-player">YT</div>
));

describe("App integration - find flow", () => {
	beforeEach(() => {
		sessionStorage.clear();
		global.fetch = jest.fn();
	});
	afterEach(() => {
		jest.resetAllMocks();
	});

	it("loads results and appends more when 'Find more' is clicked", async () => {
		// First find response
		global.fetch
			.mockResolvedValueOnce({
				ok: true,
				json: async () => ({
					results: [
						{ title: "F1", artist: "A1" },
						{ title: "F2", artist: "A2" },
					],
				}),
			})
			// Find more response
			.mockResolvedValueOnce({
				ok: true,
				json: async () => ({
					results: [{ title: "F3", artist: "A3" }],
				}),
			});

		render(<App />);

		// Fill find form (enter title only)
		fireEvent.change(
			screen.getByPlaceholderText(/title \(if you remember it\)/i),
			{
				target: { value: "hello" },
			}
		);

		fireEvent.click(screen.getByRole("button", { name: /find songs/i }));

		// Player screen appears with Results list
		expect(await screen.findByTestId("yt-player")).toBeInTheDocument();
		expect(screen.getByText("Results")).toBeInTheDocument();

		// First items
		expect(screen.getByText("F1")).toBeInTheDocument();
		expect(screen.getByText("F2")).toBeInTheDocument();

		// Click Find more 
		fireEvent.click(screen.getByRole("button", { name: /find more/i }));

		// New item should append
		await waitFor(() => expect(screen.getByText("F3")).toBeInTheDocument());

		// Ensure fetch was called twice to /find-tracks
		expect(global.fetch).toHaveBeenCalledTimes(2);
		expect(global.fetch.mock.calls[0][0]).toMatch(/find-tracks/);
		expect(global.fetch.mock.calls[1][0]).toMatch(/find-tracks/);
	});
});
