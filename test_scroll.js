// Check if scrolling is prevented by JavaScript
console.log('Document body scrollHeight:', document.body.scrollHeight);
console.log('Document body clientHeight:', document.body.clientHeight);
console.log('Window innerHeight:', window.innerHeight);
console.log('Document documentElement scrollHeight:', document.documentElement.scrollHeight);
console.log('Document documentElement clientHeight:', document.documentElement.clientHeight);

// Try to scroll programmatically
window.scrollTo(0, 100);
console.log('Scroll position after scrollTo(0, 100):', window.scrollY);

// Check computed styles that might prevent scrolling
const body = document.body;
const html = document.documentElement;
console.log('Body computed overflow-y:', getComputedStyle(body).overflowY);
console.log('HTML computed overflow-y:', getComputedStyle(html).overflowY);
console.log('Body computed height:', getComputedStyle(body).height);
console.log('HTML computed height:', getComputedStyle(html).height);
