const Footer = () => {
  return (
    <footer className="border-t border-border py-12">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center font-display font-bold text-primary-foreground text-xs">
              B
            </div>
            <span className="font-display font-semibold text-foreground">
              Briqlabs <span className="text-primary">AI</span>
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Briqlabs AI. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
