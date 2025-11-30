module.exports = {
  apps: [
    {
      name: "front-dona-zulmira",
      script: "node_modules/next/dist/bin/next",
      args: "start",
      env: {
        NODE_ENV: "production",
        HOSTNAME: "0.0.0.0",
        PORT: 3001,
        NEXT_PUBLIC_API_BASE_URL: "http://192.168.1.220:3000"
      }
    }
  ]
};
