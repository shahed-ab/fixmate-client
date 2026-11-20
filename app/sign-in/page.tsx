import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { SignInClient } from "./SignInClient";

export const metadata = {
  title: "Sign In | FixMate",
  description: "Sign in to your FixMate workbench to manage repair bookings and diagnostic dispatches.",
};

interface SignInPageProps {
  searchParams: Promise<{ callbackUrl?: string }>;
}

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const { callbackUrl } = await searchParams;

  let session = null;
  try {
    session = await auth.api.getSession({
      headers: await headers(),
    });
  } catch (error) {
    console.error("Error checking session in SignInPage:", error);
  }

  if (session) {
    const role = (session.user as { role?: string } | undefined)?.role || "customer";
    const destination =
      callbackUrl ||
      (role === "admin"
        ? "/dashboard/admin"
        : role === "technician"
        ? "/dashboard/technician"
        : "/dashboard/customer");
    redirect(destination);
  }

  return <SignInClient callbackUrl={callbackUrl} />;
}
