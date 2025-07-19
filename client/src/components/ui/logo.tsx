import logoPath from "@assets/3d9ef67e-7a41-40f0-8706-e520bf7cfb40_1752939479258.png";

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export function Logo({ size = 'md', className = '' }: LogoProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-16 h-16', 
    lg: 'w-24 h-24',
    xl: 'w-32 h-32'
  };

  return (
    <img 
      src={logoPath} 
      alt="Munchies Logo" 
      className={`${sizeClasses[size]} object-contain ${className}`}
    />
  );
}