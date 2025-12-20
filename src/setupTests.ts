import '@testing-library/jest-dom'

// Setup DOM for React 19
if (typeof document !== 'undefined') {
  // Ensure body exists
  if (!document.body) {
    const body = document.createElement('body')
    document.appendChild(body)
  }
}

