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

document.addEventListener("keydown", (event) => {
	if (event.key === "Escape" && siteNavigation?.classList.contains("is-open")) {
		menuToggle?.click();
		menuToggle?.focus();
	}
});

const year = document.querySelector("#year");
if (year) year.textContent = String(new Date().getFullYear());

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Fade cards in as they scroll into view.
if (!reducedMotion && "IntersectionObserver" in window) {
	const revealTargets = document.querySelectorAll(".service-card, .audience-card, .project-card, .process-steps li, .trust-list li, .stat-list li");
	document.documentElement.classList.add("js-reveal");
	const revealObserver = new IntersectionObserver((entries) => {
		entries.forEach((entry) => {
			if (!entry.isIntersecting) return;
			entry.target.classList.add("is-visible");
			revealObserver.unobserve(entry.target);
		});
	}, { rootMargin: "0px 0px -8% 0px" });
	revealTargets.forEach((target, index) => {
		target.classList.add("reveal");
		target.style.transitionDelay = `${(index % 4) * 70}ms`;
		revealObserver.observe(target);
	});
}

// Neural-network background for the hero.
const canvas = document.querySelector(".hero-canvas");
const context = canvas?.getContext("2d");

if (canvas && context) {
	const colors = ["34, 211, 238", "129, 140, 248", "192, 132, 252"];
	const points = Array.from({ length: 64 }, (_, index) => ({
		x: ((index * 67 + 23) % 997) / 997,
		y: ((index * 139 + 41) % 991) / 991,
		phase: index * 1.7,
		size: index % 7 === 0 ? 2.6 : 1.4,
		color: colors[index % 3],
	}));
	let frame = 0;
	let width = 0;
	let height = 0;
	let isVisible = true;

	const resizeCanvas = () => {
		const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
		const bounds = canvas.getBoundingClientRect();
		width = bounds.width;
		height = bounds.height;
		canvas.width = Math.round(width * pixelRatio);
		canvas.height = Math.round(height * pixelRatio);
		context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
	};

	const drawNetwork = (time = 0) => {
		context.clearRect(0, 0, width, height);
		const reach = Math.min(150, Math.max(100, width / 10));

		const positions = points.map((point) => ({
			x: point.x * width + (reducedMotion ? 0 : Math.sin(time / 2600 + point.phase) * 10),
			y: point.y * height + (reducedMotion ? 0 : Math.cos(time / 3000 + point.phase) * 10),
			size: point.size,
			color: point.color,
		}));

		positions.forEach((point, index) => {
			positions.slice(index + 1).forEach((next, offset) => {
				const distance = Math.hypot(point.x - next.x, point.y - next.y);
				if (distance >= reach) return;
				const strength = 1 - distance / reach;
				context.beginPath();
				context.moveTo(point.x, point.y);
				context.lineTo(next.x, next.y);
				context.strokeStyle = `rgba(${point.color}, ${0.22 * strength})`;
				context.lineWidth = 1;
				context.stroke();

				// Signal pulses travelling along some links.
				if (!reducedMotion && (index + offset) % 5 === 0) {
					const progress = ((time / 2400) + index * 0.13) % 1;
					context.beginPath();
					context.arc(point.x + (next.x - point.x) * progress, point.y + (next.y - point.y) * progress, 1.3, 0, Math.PI * 2);
					context.fillStyle = `rgba(${point.color}, ${0.85 * strength})`;
					context.fill();
				}
			});

			context.beginPath();
			context.arc(point.x, point.y, point.size, 0, Math.PI * 2);
			context.fillStyle = `rgba(${point.color}, .85)`;
			context.shadowColor = `rgba(${point.color}, .9)`;
			context.shadowBlur = point.size > 2 ? 12 : 0;
			context.fill();
			context.shadowBlur = 0;
		});

		if (!reducedMotion && isVisible) frame = window.requestAnimationFrame(drawNetwork);
	};

	resizeCanvas();
	drawNetwork();
	window.addEventListener("resize", () => {
		window.cancelAnimationFrame(frame);
		resizeCanvas();
		drawNetwork();
	}, { passive: true });

	if (!reducedMotion && "IntersectionObserver" in window) {
		new IntersectionObserver(([entry]) => {
			isVisible = entry.isIntersecting;
			window.cancelAnimationFrame(frame);
			if (isVisible) frame = window.requestAnimationFrame(drawNetwork);
		}).observe(canvas);
	}
}
