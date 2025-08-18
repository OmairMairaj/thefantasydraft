/** @type {import('next').NextConfig} */
const nextConfig = {
    async headers() {
        return [
            {
                source: "/api/:path*",
                headers: [
                    { key: "Access-Control-Allow-Credentials", value: "true" },
                    { key: "Access-Control-Allow-Origin", value: "https://thefantasydraft.co.uk" },
                    { key: "Access-Control-Allow-Origin", value: "https://www.thefantasydraft.co.uk" },
                    { key: "Access-Control-Allow-Methods", value: "GET,DELETE,PATCH,POST,PUT" },
                    { key: "Access-Control-Allow-Headers", value: "Content-Type, Authorization" },
                ],
            },
        ];
    },
};


export default nextConfig;