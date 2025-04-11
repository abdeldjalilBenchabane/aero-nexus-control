
import { ReactNode } from "react";
import NavigationSidebar from "@/components/NavigationSidebar";
import { useLocation } from "react-router-dom";

interface PageLayoutProps {
  children: ReactNode;
  title?: string;
}

const PageLayout = ({ children, title }: PageLayoutProps) => {
  const location = useLocation();
  
  return (
    <div className="flex h-screen bg-background">
      <NavigationSidebar activePath={location.pathname} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-auto p-6">
          {title && (
            <div className="mb-6">
              <h1 className="text-3xl font-bold">{title}</h1>
            </div>
          )}
          {children}
        </main>
      </div>
    </div>
  );
};

export default PageLayout;
