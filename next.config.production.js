/** @type {import('next').NextConfig} */
const nextConfig = {
    // Enable static export for cPanel deployment
    output: 'export',

    // Add trailing slash to URLs
    trailingSlash: true,

    // Disable image optimization for static export
    images: {
        unoptimized: true
    },

    // Environment variables
    env: {
        NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'https://yourdomain.com/api'
    },

    // Asset prefix for CDN (optional)
    // assetPrefix: 'https://cdn.yourdomain.com',

    // Disable server-side features for static export
    experimental: {
        esmExternals: false
    },

    // Webpack configuration
    webpack: (config, { isServer }) => {
        if (!isServer) {
            config.resolve.fallback = {
                ...config.resolve.fallback,
                fs: false,
                net: false,
                tls: false,
            };
        }
        return config;
    },

    // Headers for security
    async headers() {
        return [
            {
                source: '/(.*)',
                headers: [
                    {
                        key: 'X-Frame-Options',
                        value: 'DENY',
                    },
                    {
                        key: 'X-Content-Type-Options',
                        value: 'nosniff',
                    },
                    {
                        key: 'X-XSS-Protection',
                        value: '1; mode=block',
                    },
                    {
                        key: 'Referrer-Policy',
                        value: 'origin-when-cross-origin',
                    },
                ],
            },
        ];
    },
}

module.exports = nextConfig
