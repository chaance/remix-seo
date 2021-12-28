function warn(message: string[]): void {
	if (typeof console !== "undefined")
		console.warn("remix-seo: " + message.join("\n"));
	try {
		// This error is thrown as a convenience so you can more easily
		// find the source for a warning that appears in the console by
		// enabling "pause on exceptions" in your JavaScript debugger.
		throw new Error("remix-seo: " + message.join("\n"));
	} catch (e) {}
}

function warnIfInvalidUrl(str: string, message: string) {
	try {
		new URL(str);
	} catch (_) {
		warn([message]);
	}
}

export { warn, warnIfInvalidUrl };
