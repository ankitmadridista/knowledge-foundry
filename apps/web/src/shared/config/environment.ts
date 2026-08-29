const environment = {
    apiBaseUrl:
        import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5000/api",
    clerkPublishableKey: import.meta.env.VITE_CLERK_PUBLISHABLE_KEY,
};

export default environment;
