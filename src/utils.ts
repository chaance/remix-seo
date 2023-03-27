export function warn(message: string): void {
	if (typeof console !== "undefined") console.warn("remix-seo: " + message);
	try {
		// This error is thrown as a convenience so you can more easily
		// find the source for a warning that appears in the console by
		// enabling "pause on exceptions" in your JavaScript debugger.
		throw new Error("remix-seo: " + message);
	} catch (e) {}
}

export function isValidUrl(str: string) {
	try {
		new URL(str);
		return true;
	} catch (_) {
		return false;
	}
}

export function isString(value: unknown): value is string {
	return typeof value === "string";
}

export function isObject(value: unknown): value is object {
	return value != null && typeof value === "object";
}

export function isFunction(value: unknown): value is Function {
	return typeof value === "function";
}

export function isDate(value: unknown): value is Date {
	return isObject(value) && value instanceof Date;
}
