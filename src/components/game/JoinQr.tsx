"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";

export function JoinQr({
  url,
  label = "Escanea para unirte",
}: {
  url: string;
  label?: string;
}) {
  const [dataUrl, setDataUrl] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void QRCode.toDataURL(url, {
      width: 280,
      margin: 2,
      color: {
        dark: "#1c1410",
        light: "#fff8f1",
      },
      errorCorrectionLevel: "M",
    }).then((value) => {
      if (!cancelled) setDataUrl(value);
    });
    return () => {
      cancelled = true;
    };
  }, [url]);

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="rounded-3xl bg-[#fff8f1] p-4 shadow-[0_12px_30px_rgba(28,20,16,0.12)]">
        {dataUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={dataUrl}
            alt="Código QR para unirse"
            className="h-[200px] w-[200px]"
          />
        ) : (
          <div className="flex h-[200px] w-[200px] items-center justify-center text-sm opacity-40">
            Generando QR…
          </div>
        )}
      </div>
      <p className="text-center text-xs opacity-55">{label}</p>
    </div>
  );
}
