type UserAvatarProps = {
  avatarUrl?: string | null;
  name?: string | null;
  size?: "sm" | "md" | "lg";
};

const sizeClassMap = {
  sm: "h-9 w-9 text-sm",
  md: "h-11 w-11 text-base",
  lg: "h-24 w-24 text-3xl",
};

export default function UserAvatar({
  avatarUrl,
  name,
  size = "md",
}: UserAvatarProps) {
  const initial = (name || "U").slice(0, 1).toUpperCase();

  return (
    <div
      className={`flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-black/40 font-black text-zinc-500 ${sizeClassMap[size]}`}
    >
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt={name ? `${name} 的头像` : "用户头像"}
          className="h-full w-full object-cover"
        />
      ) : (
        <span>{initial}</span>
      )}
    </div>
  );
}