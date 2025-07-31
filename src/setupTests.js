import '@testing-library/jest-dom';

// Mock para URLs
global.URL.createObjectURL = jest.fn(() => 'mock-image-url');
global.URL.revokeObjectURL = jest.fn();

// Polyfills para TextEncoder/TextDecoder se não estiverem disponíveis
if (typeof global.TextEncoder === 'undefined') {
  const { TextEncoder, TextDecoder } = require('util');
  global.TextEncoder = TextEncoder;
  global.TextDecoder = TextDecoder;
}

// Mock para fetch se necessário
import 'whatwg-fetch';
