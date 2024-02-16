import { afterEach, expect } from "vitest";
import '@testing-library/jest-dom';

afterEach(() => {
	localStorage.clear();
	sessionStorage.clear();
});
