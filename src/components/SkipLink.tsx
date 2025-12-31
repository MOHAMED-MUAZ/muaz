interface SkipLinkProps {
  targetId: string;
  label?: string;
}

export const SkipLink = ({ targetId, label = 'Skip to main content' }: SkipLinkProps) => {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const target = document.getElementById(targetId);
    if (target) {
      target.focus();
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <a
      href={`#${targetId}`}
      onClick={handleClick}
      className="skip-link"
    >
      {label}
    </a>
  );
};
