import type { Metadata } from "next";
import { Geist, Noto_Sans_Lao } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

// Geist has no Lao glyphs, so Lao text falls through to this face.
const notoLao = Noto_Sans_Lao({
  variable: "--font-noto-lao",
  subsets: ["lao"],
});

export const metadata: Metadata = {
  title: "ລົດ 5 ຄັນ ແບບ 3D | xailordev",
  description: "Portfolio ລົດ 3D 5 ຄັນ: ເລື່ອນໜ້າເພື່ອແຍກຊິ້ນສ່ວນ, ລາກເພື່ອໝຸນ ແລະ ລອງປ່ຽນສີ. ສ້າງໂດຍ xailordev.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="lo"
      data-scroll-behavior="smooth"
      className={`${geistSans.variable} ${notoLao.variable} h-full snap-y snap-proximity antialiased`}
    >
      <body className="min-h-full">{children}</body>
    </html>
  );
}
