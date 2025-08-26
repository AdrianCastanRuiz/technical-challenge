import '@testing-library/jest-dom';

// Polyfill por si tu entorno lo necesita
import { TextEncoder, TextDecoder } from 'util';
if (!globalThis.TextEncoder) (globalThis as any).TextEncoder = TextEncoder;
if (!globalThis.TextDecoder) (globalThis as any).TextDecoder = TextDecoder;
