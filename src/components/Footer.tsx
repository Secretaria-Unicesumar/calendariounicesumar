import logoSecretaria from "@/assets/logo-secretaria-academica.png";
import logoCSC from "@/assets/logo-csc.png";
import logoUnicesumar from "@/assets/logo-unicesumar.png";

export const Footer = () => {
  return (
    <footer className="mt-12 border-t border-border bg-slate-900 dark:bg-slate-950">
      <div className="max-w-[1800px] mx-auto px-4 md:px-8 py-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logos */}
          <div className="flex items-center gap-6">
            <img 
              src={logoSecretaria} 
              alt="Secretaria Acadêmica Unicesumar" 
              className="h-16 w-16 object-contain"
            />
            <img 
              src={logoCSC} 
              alt="CSC" 
              className="h-12 w-12 object-contain"
            />
            <img 
              src={logoUnicesumar} 
              alt="Unicesumar" 
              className="h-8 object-contain"
            />
          </div>
          
          {/* Copyright text */}
          <div className="text-center md:text-right">
            <p className="text-sm text-slate-300">
              © 2026 CSC Secretaria Acadêmica Unicesumar
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};
