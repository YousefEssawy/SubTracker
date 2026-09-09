import type { IconType } from "react-icons";

export interface IconProps {
  icon: IconType;
  size?: number;
  className?: string;
}

// Wraps react-icons/hi2 components directly (already an app dependency) instead of the
// handoff bundle's CDN-by-name approach, which existed only to work around the design
// tool's lack of npm access — keeps tree-shaking and avoids a runtime network fetch.
const Icon = ({ icon: IconComponent, size = 20, className = "" }: IconProps) => {
  return <IconComponent size={size} className={className} aria-hidden="true" />;
};

export default Icon;
