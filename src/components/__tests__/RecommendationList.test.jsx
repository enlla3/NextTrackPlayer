import { fireEvent, render, screen } from "@testing-library/react";
import RecommendationList from "../RecommendationList";

const recs = [
	{ title: "Song A", artist: "Artist 1" },
	{ title: "Song B", artist: "Artist 2" },
	{ title: "Song C", artist: "Artist 3" },
];

describe("RecommendationList", () => {
	it("renders up to three items and highlights selection", () => {
		const onPick = jest.fn();
		render(
			<RecommendationList recs={recs} currentIndex={1} onPick={onPick} />
		);

		// Should render all three
		recs.forEach((r) => {
			expect(screen.getByText(r.title)).toBeInTheDocument();
			expect(screen.getByText(`Artist 2`)).toBeInTheDocument();
		});

		// The second item should have highlight class
		const highlighted = screen.getAllByText(/Song B/)[0].parentElement;
		expect(highlighted).toHaveClass("border-amber-900", "bg-amber-100");

		// Clicking an item calls onPick with its index
		fireEvent.click(screen.getByText("Song C"));
		expect(onPick).toHaveBeenCalledWith(2);
	});
});
