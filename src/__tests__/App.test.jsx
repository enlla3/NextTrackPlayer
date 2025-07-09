import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import App from "../pages/App";

// Mock YouTubePlayer it doesn't hit real YouTube API
jest.mock("../components/YouTubePlayer", () => ({ artist, title }) => (
	<div data-testid="player">
		{artist} — {title}
	</div>
));

beforeEach(() => {
	// Stub fetch - initial returns one track, prefetch returns empty
	global.fetch = jest
		.fn()
		.mockResolvedValueOnce({
			ok: true,
			json: async () => ({
				recommended_tracks: [{ title: "SongX", artist: "ArtistY" }],
			}),
		})
		.mockResolvedValueOnce({
			ok: true,
			json: async () => ({ recommended_tracks: [] }),
		});
});

afterEach(() => {
	jest.resetAllMocks();
});

test("full flow: form → fetch → display → reset", async () => {
	render(<App />);

	// A) Form is visible
	const getBtn = screen.getByRole("button", { name: /get recommendations/i });
	expect(getBtn).toBeInTheDocument();

	// Fill in the Title and Artist fields
	fireEvent.change(screen.getByPlaceholderText(/^Title$/i), {
		target: { value: "SongX" },
	});
	fireEvent.change(screen.getByPlaceholderText(/^Artist$/i), {
		target: { value: "ArtistY" },
	});

	// Submit
	fireEvent.click(getBtn);

	// B) Wait for the mocked player to appear
	await waitFor(() =>
		expect(screen.getByTestId("player")).toHaveTextContent(
			"ArtistY — SongX"
		)
	);

	// C) Recommendation list shows the track
	expect(screen.getByText("SongX")).toBeInTheDocument();

	// D) Clicking Reset brings back the form
	fireEvent.click(screen.getByRole("button", { name: /reset/i }));
	expect(
		screen.getByRole("button", { name: /get recommendations/i })
	).toBeInTheDocument();
});
