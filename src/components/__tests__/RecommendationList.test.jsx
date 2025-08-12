import { fireEvent, render, screen } from "@testing-library/react";
import RecommendationList from "../RecommendationList";

const recs = [
	{ title: "Song A", artist: "Artist 1" },
	{ title: "Song B", artist: "Artist 2" },
	{ title: "Song C", artist: "Artist 3" },
];

describe("RecommendationList", () => {
	it("renders items and highlights the current one; clicking calls onPick", () => {
		const onPick = jest.fn();
		render(
			<RecommendationList recs={recs} currentIndex={1} onPick={onPick} />
		);

		// Titles render
		recs.forEach((r) => {
			expect(screen.getByText(r.title)).toBeInTheDocument();
		});

		// Target the 2nd <li>
		const items = screen.getAllByRole("listitem");
		expect(items).toHaveLength(3);

		const highlighted = items[1];
		expect(highlighted).toHaveClass("bg-amber-100");
		// Assert text content on the container to avoid duplicate-node matches
		expect(highlighted).toHaveTextContent("Artist 2");

		// Clicking a non-current item calls onPick with its index
		fireEvent.click(screen.getByText("Song C"));
		expect(onPick).toHaveBeenCalledWith(2);
	});

	it("shows a small spinner row when isLoadingMore is true", () => {
		render(
			<RecommendationList
				recs={recs}
				currentIndex={0}
				onPick={() => {}}
				isLoadingMore={true}
			/>
		);
		expect(
			screen.getByLabelText(/loading more recommendations/i)
		).toBeInTheDocument();
	});
});
