import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { useLanguage } from "@/hooks/use-language";

const copy = {
  hinglish: {
    message: "Oops! Page not found",
    home: "Return to Home",
  },
  en: {
    message: "Oops! Page not found",
    home: "Return to Home",
  },
  hi: {
    message: "Oops! Page नहीं मिला",
    home: "Home पर वापस जाएँ",
  },
};

const NotFound = () => {
  const location = useLocation();
  const { language } = useLanguage();
  const t = copy[language];

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted">
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold">404</h1>
        <p className="mb-4 text-xl text-muted-foreground">{t.message}</p>
        <a href="/" className="text-primary underline hover:text-primary/90">
          {t.home}
        </a>
      </div>
    </div>
  );
};

export default NotFound;
