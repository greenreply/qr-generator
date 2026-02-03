"use client";

import { useState, useRef, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import {
  Instagram,
  Facebook,
  Youtube,
  Linkedin,
  Mail,
  Phone,
  Link as LinkIcon,
  Download,
  Settings2,
  XCircle
} from "lucide-react";

const PLATFORMS = [
  { id: "instagram", name: "Instagram", icon: Instagram, color: "text-pink-600", bg: "bg-pink-50" },
  { id: "facebook", name: "Facebook", icon: Facebook, color: "text-blue-600", bg: "bg-blue-50" },
  { id: "whatsapp", name: "WhatsApp", icon: Phone, color: "text-green-600", bg: "bg-green-50" },
  { id: "youtube", name: "YouTube", icon: Youtube, color: "text-red-600", bg: "bg-red-50" },
  { id: "linkedin", name: "LinkedIn", icon: Linkedin, color: "text-blue-700", bg: "bg-blue-50" },
  { id: "google", name: "Google", icon: Mail, color: "text-orange-600", bg: "bg-orange-50" },
];

export default function Home() {
  const [selectedPlatform, setSelectedPlatform] = useState(PLATFORMS[0]);
  const [link, setLink] = useState("");
  const [width, setWidth] = useState(512);
  const [height, setHeight] = useState(512);
  const [logoDataUrl, setLogoDataUrl] = useState<string>("");
  const [isClient, setIsClient] = useState(false);
  const qrRef = useRef<HTMLDivElement>(null);

  // Initialize state from localStorage
  useEffect(() => {
    setIsClient(true);
    const savedLink = localStorage.getItem("qr_link");
    const savedWidth = localStorage.getItem("qr_width");
    const savedHeight = localStorage.getItem("qr_height");
    const savedPlatformId = localStorage.getItem("qr_platform");

    if (savedLink) setLink(savedLink);
    if (savedWidth) setWidth(Number(savedWidth));
    if (savedHeight) setHeight(Number(savedHeight));
    if (savedPlatformId) {
      const platform = PLATFORMS.find(p => p.id === savedPlatformId);
      if (platform) setSelectedPlatform(platform);
    }
  }, []);

  // Persist state to localStorage
  useEffect(() => {
    if (isClient) {
      localStorage.setItem("qr_link", link);
      localStorage.setItem("qr_width", width.toString());
      localStorage.setItem("qr_height", height.toString());
      localStorage.setItem("qr_platform", selectedPlatform.id);
    }
  }, [link, width, height, selectedPlatform, isClient]);

  useEffect(() => {
    const fetchLogo = async () => {
      try {
        const logoPath = `/${selectedPlatform.id}.svg`;
        const response = await fetch(logoPath);
        const text = await response.text();
        const base64 = btoa(unescape(encodeURIComponent(text)));
        setLogoDataUrl(`data:image/svg+xml;base64,${base64}`);
      } catch (error) {
        console.error("Error fetching logo:", error);
      }
    };
    fetchLogo();
  }, [selectedPlatform.id]);

  const handleDownload = () => {
    if (!qrRef.current) return;
    const svg = qrRef.current.querySelector("svg");
    if (!svg) return;

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = width;
    canvas.height = height;

    const svgClone = svg.cloneNode(true) as SVGElement;
    svgClone.setAttribute("width", width.toString());
    svgClone.setAttribute("height", height.toString());

    const svgData = new XMLSerializer().serializeToString(svgClone);
    const img = new Image();

    img.onload = () => {
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, width, height);

      const qrSize = Math.min(width, height);
      const offsetX = (width - qrSize) / 2;
      const offsetY = (height - qrSize) / 2;

      ctx.drawImage(img, offsetX, offsetY, qrSize, qrSize);

      if (logoDataUrl) {
        const logoImg = new Image();
        logoImg.onload = () => {
          const logoSize = qrSize * 0.18;
          const x = (width - logoSize) / 2;
          const y = (height - logoSize) / 2;

          ctx.fillStyle = "white";
          const padding = logoSize * 0.15;
          ctx.fillRect(x - padding, y - padding, logoSize + padding * 2, logoSize + padding * 2);

          ctx.drawImage(logoImg, x, y, logoSize, logoSize);

          const pngFile = canvas.toDataURL("image/png", 1.0);
          const downloadLink = document.createElement("a");
          downloadLink.download = `${selectedPlatform.id}-qr.png`;
          downloadLink.href = pngFile;
          downloadLink.click();
        };
        logoImg.src = logoDataUrl;
      } else {
        const pngFile = canvas.toDataURL("image/png", 1.0);
        const downloadLink = document.createElement("a");
        downloadLink.download = `${selectedPlatform.id}-qr.png`;
        downloadLink.href = pngFile;
        downloadLink.click();
      }
    };

    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
  };

  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const previewRatio = width / height;
  const previewMaxDimension = 240;
  let previewWidth = previewMaxDimension;
  let previewHeight = previewMaxDimension;

  if (previewRatio > 1) {
    previewHeight = previewMaxDimension / previewRatio;
  } else {
    previewWidth = previewMaxDimension * previewRatio;
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-10">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Social QR Generator</h1>
          <p className="text-slate-500">Fast, simple, and branded QR codes.</p>
        </header>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden lg:grid lg:grid-cols-2">
          {/* Controls */}
          <div className="p-8 border-b lg:border-b-0 lg:border-r border-slate-200">
            <div className="space-y-6">
              {/* Platform */}
              <section>
                <label className="block text-sm font-semibold text-slate-900 mb-3 uppercase tracking-wider">Target Platform</label>
                <div className="grid grid-cols-3 gap-2">
                  {PLATFORMS.map((platform) => {
                    const Icon = platform.icon;
                    const isActive = selectedPlatform.id === platform.id;
                    return (
                      <button
                        key={platform.id}
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          if (selectedPlatform.id !== platform.id) {
                            setLink("");
                            setSelectedPlatform(platform);
                          }
                        }}
                        className={`flex flex-col items-center justify-center py-3 px-2 rounded-xl border transition-all ${isActive
                          ? "border-slate-900 bg-slate-900 text-white shadow-md scale-[1.02]"
                          : "border-slate-100 bg-slate-50 text-slate-500 hover:border-slate-300 hover:bg-white"
                          }`}
                      >
                        <Icon className={`w-5 h-5 mb-1 ${isActive ? "text-white" : ""}`} />
                        <span className="text-[10px] font-bold uppercase tracking-tight">{platform.name}</span>
                      </button>
                    );
                  })}
                </div>
              </section>

              {/* URL */}
              <section>
                <label className="block text-sm font-semibold text-slate-900 mb-3 uppercase tracking-wider">Link URL</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-slate-900 transition-colors">
                    <LinkIcon className="w-4 h-4" />
                  </div>
                  <input
                    type="url"
                    value={link}
                    onChange={(e) => setLink(e.target.value)}
                    placeholder="https://example.com"
                    className="block w-full pl-10 pr-10 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900/5 focus:border-slate-900 outline-none text-slate-900 font-medium"
                  />
                  {link && (
                    <button
                      type="button"
                      onClick={() => setLink("")}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-300 hover:text-slate-600 transition-colors"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                  )}
                </div>
                {!isValidUrl(link) && link !== "" && (
                  <p className="mt-2 text-xs text-red-600 font-bold bg-red-50 px-3 py-1 rounded-lg border border-red-100 inline-block">Please enter a valid URL.</p>
                )}
              </section>

              {/* Sizing */}
              <section>
                <label className="block text-sm font-semibold text-slate-900 mb-3 uppercase tracking-wider">Download Size (px)</label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-900 uppercase font-black">Width</span>
                    <input
                      type="number"
                      value={width}
                      onChange={(e) => setWidth(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-slate-900/5 focus:border-slate-900 text-black font-black text-lg"
                    />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-900 uppercase font-black">Height</span>
                    <input
                      type="number"
                      value={height}
                      onChange={(e) => setHeight(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-slate-900/5 focus:border-slate-900 text-black font-black text-lg"
                    />
                  </div>
                </div>
              </section>
            </div>
          </div>

          {/* Preview */}
          <div className="bg-slate-50/50 p-8 flex flex-col items-center justify-center min-h-[400px]">
            <div
              className="bg-white rounded-xl shadow-sm border border-slate-200 flex items-center justify-center transition-all duration-300 overflow-hidden"
              style={{
                width: `${previewWidth}px`,
                height: `${previewHeight}px`,
              }}
            >
              <div
                ref={qrRef}
                className="w-full h-full flex items-center justify-center p-4"
              >
                {isClient && link && isValidUrl(link) ? (
                  <QRCodeSVG
                    value={link}
                    size={Math.min(previewWidth, previewHeight) - 32}
                    level="H"
                    imageSettings={logoDataUrl ? {
                      src: logoDataUrl,
                      height: 32,
                      width: 32,
                      excavate: true,
                    } : undefined}
                  />
                ) : (
                  <div className="text-center">
                    <Settings2 className="w-8 h-8 text-slate-200 mx-auto mb-2 animate-spin-slow" />
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Enter link</p>
                  </div>
                )}
              </div>
            </div>

            <button
              disabled={!link || !isValidUrl(link)}
              type="button"
              onClick={(e) => {
                e.preventDefault();
                handleDownload();
              }}
              className="mt-8 w-full max-w-[240px] flex items-center justify-center gap-2 py-4 px-6 rounded-xl font-black text-sm transition-all bg-slate-900 text-white hover:bg-black disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed shadow-xl shadow-slate-900/20 active:scale-95"
            >
              <Download className="w-5 h-5" />
              DOWNLOAD PNG
            </button>

            <p className="mt-4 text-[10px] text-black font-black uppercase tracking-widest bg-white px-4 py-1.5 rounded-full border border-slate-200 shadow-sm">
              Output: {width} x {height} px
            </p>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
      `}</style>
    </div>
  );
}
