import path from 'node:path';
const cors = [
  { key: 'Access-Control-Allow-Origin', value: '*' },
  { key: 'Access-Control-Allow-Methods', value: 'GET,POST,OPTIONS' },
  { key: 'Access-Control-Allow-Headers', value: 'Authorization,Content-Type,Mcp-Session-Id' },
];
export default {
  webpack(config) { config.resolve.alias['@'] = path.resolve(process.cwd()); return config; },
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: false },
  async headers() {
    return [
      { source: '/api/v1/:path*', headers: cors },
      { source: '/api/oauth/token', headers: cors },
      { source: '/api/mcp', headers: cors },
      { source: '/sdk/:path*', headers: [{ key: 'Access-Control-Allow-Origin', value: '*' }] },
    ];
  },
};
