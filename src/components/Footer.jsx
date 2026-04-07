import Image from "next/image";
import Link from "next/link";
import { CirclePlay, Globe, Mail, MapPin, MessageCircle, Phone, Send } from "lucide-react";

export default function Footer() {
  return (
    <footer className="mt-16 bg-[#f6f6f6]">
      <div className="mx-auto w-[calc(100%-24px)] max-w-[1240px] py-12">
        <div className="grid grid-cols-1 gap-8 text-[13px] text-[#666666] md:grid-cols-[1.25fr_1fr_1fr_1fr]">
          <div className="space-y-4 text-center md:text-left">
            <Link href="/" className="inline-flex items-center justify-center md:justify-start">
              <Image
                src="/images/logo-1025b.webp"
                alt="GADGETSHOB"
                width={112}
                height={38}
                className="h-auto w-auto"
                style={{ width: "auto", height: "auto" }}
              />
            </Link>
            <div className="mx-auto h-px w-32 bg-[#ececec] md:mx-0" />
            <div className="flex items-center justify-center gap-3 md:justify-start">
              <span className="flex h-9 w-9 items-center justify-center rounded-full border border-[#f0d3b8] bg-white text-[#f58a1f]">
                <Globe size={17} />
              </span>
              <span className="flex h-9 w-9 items-center justify-center rounded-full border border-[#f0d3b8] bg-white text-[#f58a1f]">
                <Send size={17} />
              </span>
              <span className="flex h-9 w-9 items-center justify-center rounded-full border border-[#f0d3b8] bg-white text-[#f58a1f]">
                <CirclePlay size={17} />
              </span>
              <span className="flex h-9 w-9 items-center justify-center rounded-full border border-[#f0d3b8] bg-white text-[#f58a1f]">
                <MessageCircle size={17} />
              </span>
            </div>
          </div>

          <div className="text-center md:text-left">
            <h4 className="text-[16px] font-semibold text-[#424242]">Contact Us</h4>
            <ul className="mt-4 space-y-3 text-[13px] text-[#676767]">
              <li className="flex items-center justify-center gap-2.5 leading-5 md:justify-start">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-[#f58a1f]">
                  <Mail size={15} />
                </span>
                mail@gmail.com
              </li>
              <li className="flex items-center justify-center gap-2.5 leading-5 md:justify-start">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-[#f58a1f]">
                  <Phone size={15} />
                </span>
                +880000000000
              </li>
              <li className="flex items-center justify-center gap-2.5 leading-5 md:justify-start">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-[#f58a1f]">
                  <MapPin size={15} />
                </span>
                Mirpur 10, Dhaka, Bangladesh
              </li>
            </ul>
          </div>

          <div className="text-center md:text-left">
            <h4 className="text-[16px] font-semibold text-[#424242]">Quick Links</h4>
            <ul className="mt-4 space-y-2.5 text-[13px] text-[#676767]">
              <li className="hover:text-[#f58a1f]">
                <Link href="#">Return & Refund Policy</Link>
              </li>
              <li className="hover:text-[#f58a1f]">
                <Link href="#">Privacy Policy</Link>
              </li>
              <li className="hover:text-[#f58a1f]">
                <Link href="#">Terms and Conditions</Link>
              </li>
              <li className="hover:text-[#f58a1f]">
                <Link href="#">About us</Link>
              </li>
            </ul>
          </div>

          <div className="text-center md:text-left">
            <h4 className="text-[16px] font-semibold text-[#424242]">Useful Links</h4>
            <ul className="mt-4 space-y-2.5 text-[13px] text-[#676767]">
              <li className="hover:text-[#f58a1f]">
                <Link href="#">Why Shop Online with Us</Link>
              </li>
              <li className="hover:text-[#f58a1f]">
                <Link href="#">Online Payment Methods</Link>
              </li>
              <li className="hover:text-[#f58a1f]">
                <Link href="#">After Sales Support</Link>
              </li>
              <li className="hover:text-[#f58a1f]">
                <Link href="#">FAQ</Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="bg-black py-3.5 text-center text-[11px] text-white sm:text-[12px]">
        Copyright &copy; 2026 neoncode.co
      </div>
    </footer>
  );
}
