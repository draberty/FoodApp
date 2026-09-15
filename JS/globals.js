// Comp of global vars and helpers

const $ = (id) => document.getElementById(id);

if ("serviceWorker" in navigator) {
	window.addEventListener("load", () => {
		const isLivePreview =
			window.parent !== window ||
			window.location.port === "3000" ||
			window.location.pathname.includes("___vscode_livepreview");

		if (isLivePreview) {
			console.log(
				"[Service Worker] Registration bypassed (VS Code Live Preview detected)",
			);

			navigator.serviceWorker.getRegistrations().then((registrations) => {
				for (const registration of registrations) {
					registration.unregister();
				}
			});
			return;
		}

		navigator.serviceWorker
			.register("/FoodApp/sw.js")
			.then((registration) => {
				console.log(
					"[Service Worker] Registered with scope:",
					registration.scope,
				);
			})
			.catch((error) => {
				console.error("[Service Worker] Registration failed:", error);
			});
	});
}