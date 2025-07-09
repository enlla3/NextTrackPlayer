import { render } from "@testing-library/react";
import Spinner from "../Spinner";

describe("Spinner", () => {
	it("renders an SVG with the correct classes", () => {
		const { container } = render(<Spinner size={8} color="text-red-500" />);
		const svg = container.querySelector("svg");
		expect(svg).toBeInTheDocument();
		expect(svg).toHaveClass("animate-spin", "h-8", "w-8", "text-red-500");
	});
});
