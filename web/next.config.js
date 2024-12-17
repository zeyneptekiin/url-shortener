/** @type {import('next').NextConfig} */
const nextConfig = {
    async rewrites() {
        return [
            {
                source: '/api/:path*',
                destination: 'http://46.101.187.69:5001/:path*',
            },
        ];
    },
};

module.exports = nextConfig;
