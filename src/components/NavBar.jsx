import logo from "../assets/logo.png";

export default function NavBar({ onReset }) {
	return (
		<nav className="bg-amber-200 text-amber-900 p-4 shadow flex items-center justify-between">
			{/* Logo and Title */}
			<div className="flex items-center space-x-3">
				<img
					src={logo}
					alt="NextTrack Logo"
					className="h-10 object-contain"
				/>
				<span className="text-2xl font-bold whitespace-nowrap">
					NextTrack
				</span>
			</div>

			{/* Reset Button */}
			<button
				onClick={onReset}
				className="bg-amber-900 text-white px-4 py-2 rounded hover:bg-amber-800 whitespace-nowrap"
			>
				Reset
			</button>
		</nav>
	);
}
