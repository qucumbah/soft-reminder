import { signIn } from "next-auth/react";
import Image from "next/image";

const GitHubSignInButton: React.FC<{ disabled: boolean }> = (props) => {
  return (
    <button
      disabled={props.disabled}
      onClick={() => signIn("github")}
      className="flex gap-2 items-center px-5 py-4 rounded-lg invert bg-white"
    >
      <div className="relative w-8 aspect-square invert">
        <Image src="/github_mark.png" priority alt="" layout="fill" />
      </div>
      <div>Sign in with GitHub</div>
    </button>
  );
};

export default GitHubSignInButton;
