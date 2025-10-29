import { CheckCircle, Shield, Award } from "lucide-react";

interface TrustBadgeProps {
  type: "verified" | "trusted" | "premium";
  label?: string;
}

const TrustBadge = ({ type, label }: TrustBadgeProps) => {
  const config = {
    verified: {
      icon: CheckCircle,
      color: "text-trust-verified",
      bgColor: "bg-trust-verified/10",
      label: label || "Verified",
    },
    trusted: {
      icon: Shield,
      color: "text-primary",
      bgColor: "bg-primary/10",
      label: label || "Trusted",
    },
    premium: {
      icon: Award,
      color: "text-trust-gold",
      bgColor: "bg-trust-gold/10",
      label: label || "Premium",
    },
  };

  const { icon: Icon, color, bgColor, label: displayLabel } = config[type];

  return (
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full ${bgColor}`}>
      <Icon className={`w-4 h-4 ${color}`} />
      <span className={`text-xs font-medium ${color}`}>{displayLabel}</span>
    </div>
  );
};

export default TrustBadge;
