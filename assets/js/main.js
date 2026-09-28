const menuToggle = document.querySelector(".menu-toggle");
const siteNavigation = document.querySelector(".site-nav");

menuToggle?.addEventListener("click", () => {
	const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
	menuToggle.setAttribute("aria-expanded", String(!isOpen));
	menuToggle.setAttribute("aria-label", isOpen ? "Open navigation" : "Close navigation");
	siteNavigation?.classList.toggle("is-open", !isOpen);
});

siteNavigation?.querySelectorAll("a").forEach((link) => {
	link.addEventListener("click", () => {
		menuToggle?.setAttribute("aria-expanded", "false");
		menuToggle?.setAttribute("aria-label", "Open navigation");
		siteNavigation.classList.remove("is-open");
	});
});

const year = document.querySelector("#year");
if (year) year.textContent = String(new Date().getFullYear());

const canvas = document.querySelector(".hero-canvas");
const context = canvas?.getContext("2d");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (canvas && context) {
	const points = Array.from({ length: 42 }, (_, index) => ({
		x: ((index * 67 + 23) % 997) / 997,
		y: ((index * 139 + 41) % 991) / 991,
		phase: index * 1.7,
		size: index % 7 === 0 ? 2.5 : 1.5,
	}));
	let frame = 0;

	const drawNetwork = (time = 0) => {
		const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
		const bounds = canvas.getBoundingClientRect();
		const width = bounds.width;
		const height = bounds.height;
		canvas.width = Math.round(width * pixelRatio);
		canvas.height = Math.round(height * pixelRatio);
		context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
		context.clearRect(0, 0, width, height);

		const positions = points.map((point) => ({
			x: point.x * width + (reducedMotion ? 0 : Math.sin(time / 2600 + point.phase) * 8),
			y: point.y * height + (reducedMotion ? 0 : Math.cos(time / 3000 + point.phase) * 8),
			size: point.size,
		}));

		positions.forEach((point, index) => {
			positions.slice(index + 1).forEach((next) => {
				const distance = Math.hypot(point.x - next.x, point.y - next.y);
				if (distance < 115) {
					context.beginPath();
					context.moveTo(point.x, point.y);
					context.lineTo(next.x, next.y);
					context.strokeStyle = `rgba(52, 91, 57, ${0.15 * (1 - distance / 115)})`;
					context.lineWidth = 1;
					context.stroke();
				}
			});

			context.beginPath();
			context.arc(point.x, point.y, point.size, 0, Math.PI * 2);
			context.fillStyle = index % 9 === 0 ? "rgba(230, 118, 90, .72)" : "rgba(51, 90, 56, .52)";
			context.fill();
		});

		if (!reducedMotion) frame = window.requestAnimationFrame(drawNetwork);
	};

	drawNetwork();
	window.addEventListener("resize", () => {
		window.cancelAnimationFrame(frame);
		drawNetwork();
	}, { passive: true });
}