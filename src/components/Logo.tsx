
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

const Logo = ({ className, size = "md" }: LogoProps) => {
  const sizeClasses = {
    sm: "text-lg",
    md: "text-2xl",
    lg: "text-4xl"
  };

  return (
    <div className={cn("flex items-center font-bold", sizeClasses[size], className)}>
      <span className="text-aviation-blue-dark">Aero</span>
      <span className="text-aviation-blue">Nexus</span>
      <span className="ml-1 text-aviation-accent-green">Control</span>
    </div>
  );
};

export default Logo;
