import { Icon } from "../common";

export function SecurityFooter() {
  return (
    <div className="text-center mt-2">
      <p className="text-primary/60 text-xs flex items-center justify-center gap-1.5">
        <Icon name="verified_user" size="sm" />
        256-bit AES Encryption Verified
      </p>
    </div>
  );
}
