/** @type {import('next').NextConfig} */
const nextConfig = {
    // NOTE: i18n configuration removed because App Router does not support
    // next.config.js i18n. Use a client-side or middleware-based solution
    // such as `next-intl` or a custom middleware for locale detection.
    // Remove static export for Node.js deployment
    // output: 'export',

    // Add trailing slash to URLs
    trailingSlash: true,

    // Enable image optimization for Node.js deployment
    images: {
        domains: ['api.compound-360.com', '172.236.152.170','localhost'],
        remotePatterns: [
            {
                protocol: 'http',
                hostname: process.env.SERVER_IP || 'localhost',
                port: process.env.SERVER_PORT || '3000',
                pathname: '/api/v1/uploads/**',
            },
            {
                protocol: 'http',
                hostname: 'localhost',
                port: '4000',
                pathname: '/api/v1/uploads/**',
            },
            {
                protocol: 'http',
                hostname: 'localhost',
                port: '3000',
                pathname: '/**',
            },
            {
                protocol: 'http',
                hostname: 'localhost',
                port: '4000',
                pathname: '/**',
            },
        ],
        unoptimized: false
    },

    // Environment variables
    env: {
        NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1'
    },

    // Disable ESLint during build to avoid blocking deployment
    eslint: {
        ignoreDuringBuilds: true,
    },

    // Disable TypeScript type checking during build
    typescript: {
        ignoreBuildErrors: true,
    },

    // Disable server-side features for static export
    // experimental: {
    //   esmExternals: false
    // },

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



    // Headers for security (disabled for static export)
    // async headers() {
    //   return [
    //     {
    //       source: '/(.*)',
    //       headers: [
    //         {
    //           key: 'X-Frame-Options',
    //           value: 'DENY',
    //         },
    //         {
    //           key: 'X-Content-Type-Options',
    //           value: 'nosniff',
    //         },
    //         {
    //           key: 'X-XSS-Protection',
    //           value: '1; mode=block',
    //         },
    //         {
    //           key: 'Referrer-Policy',
    //           value: 'origin-when-cross-origin',
    //         },
    //       ],
    //     },
    //   ];
    // },
}

module.exports = nextConfig
