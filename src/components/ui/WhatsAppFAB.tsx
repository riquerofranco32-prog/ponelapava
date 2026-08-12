import { MessageCircle } from "lucide-react";
import { whatsappChatUrl } from "@/lib/whatsapp";

export default function WhatsAppFAB() {
  return (
    <a
      href={whatsappChatUrl(
        "Hola! Quería consultar sobre productos de Poné La Pava 👋",
      )}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chatear por WhatsApp"
      className="group fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-whatsapp text-white shadow-[0_10px_30px_-8px_rgba(37,211,102,0.6)] transition-transform duration-200 hover:scale-105 active:scale-95 sm:bottom-7 sm:right-7"
    >
      <span className="absolute inset-0 rounded-full bg-whatsapp animate-ping opacity-30 group-hover:opacity-0" />
      <MessageCircle size={26} className="relative" strokeWidth={2.2} />
    </a>
  );
}
