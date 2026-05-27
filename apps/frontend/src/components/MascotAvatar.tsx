export function MascotAvatar({ size = 'md' }: { size?: 'xs' | 'sm' | 'md' | 'lg' }) {
  const dimensions = {
    xs: 'h-7 w-7',
    sm: 'h-10 w-10',
    md: 'h-16 w-16',
    lg: 'h-24 w-24',
  };

  return (
    <img
      src="/innovagov-mascot.png"
      alt=""
      aria-hidden="true"
      className={`${dimensions[size]} shrink-0 object-contain drop-shadow-md`}
    />
  );
}
