import type { NextConfig } from "next";

// A Content-Security-Policy não fica aqui: o App Router injeta os dados de
// RSC via <script> inline (self.__next_f.push(...)) a cada página, então
// script-src precisa de um nonce novo por request — só dá pra gerar isso em
// src/proxy.ts (código estático aqui não tem acesso à request). Headers
// abaixo são estáticos e não dependem de nonce.
const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

export default nextConfig;
