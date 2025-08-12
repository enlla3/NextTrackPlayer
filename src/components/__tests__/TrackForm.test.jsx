import { fireEvent, render, screen } from "@testing-library/react";
import TrackForm from "../TrackForm";

describe("TrackForm", () => {
	it("submits only non-empty tracks and parses comma lists; same_artist_only defaults to false", () => {
		const onSubmit = jest.fn();
		render(<TrackForm onSubmit={onSubmit} />);

		// Fill in one track
		fireEvent.change(screen.getByPlaceholderText("Title"), {
			target: { value: "My Song" },
		});
		fireEvent.change(screen.getByPlaceholderText("Artist"), {
			target: { value: "Me" },
		});

		// Preferences
		fireEvent.change(
			screen.getByPlaceholderText("Favorite artists (comma-sep)"),
			{ target: { value: "Me, You" } }
		);
		fireEvent.change(
			screen.getByPlaceholderText("Preferred genres (comma-sep)"),
			{ target: { value: "pop, rock" } }
		);
		fireEvent.change(
			screen.getByPlaceholderText("Preferred languages (comma-sep)"),
			{ target: { value: "english" } }
		);

		// Add the seed
		fireEvent.click(screen.getByRole("button", { name: /add track/i }));

		// Submit
		fireEvent.click(
			screen.getByRole("button", { name: /get recommendations/i })
		);

		expect(onSubmit).toHaveBeenCalledWith({
			track_ids: [{ title: "My Song", artist: "Me" }],
			preferences: {
				favorite_artists: ["Me", "You"],
				preferred_genres: ["pop", "rock"],
				preferred_languages: ["english"],
				same_artist_only: false,
			},
		});
	});

	it("sends same_artist_only=true when the checkbox is ticked", () => {
		const onSubmit = jest.fn();
		render(<TrackForm onSubmit={onSubmit} />);

		// Track
		fireEvent.change(screen.getByPlaceholderText("Title"), {
			target: { value: "Only You" },
		});
		fireEvent.change(screen.getByPlaceholderText("Artist"), {
			target: { value: "A-ha" },
		});

		// Tick checkbox
		fireEvent.click(screen.getByLabelText(/same artist only/i));

		// Add the seed
		fireEvent.click(screen.getByRole("button", { name: /add track/i }));

		// Submit
		fireEvent.click(
			screen.getByRole("button", { name: /get recommendations/i })
		);

		expect(onSubmit).toHaveBeenCalledWith(
			expect.objectContaining({
				preferences: expect.objectContaining({
					same_artist_only: true,
				}),
			})
		);
	});
});
