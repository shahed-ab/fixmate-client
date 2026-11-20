import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { SignUpClient } from "./SignUpClient";

export const metadata = {
  title: "Create Account | FixMate",
  description: "Join FixMate as a customer or certified technician for rapid appliance and electronic repairs.",
};

interface SignUpPageProps {
  searchParams: Promise<{ callbackUrl?: string }>;
}

export default async function SignUpPage({ searchParams }: SignUpPageProps) {
  const { callbackUrl } = await searchParams;

  let session = null;
  try {
    session = await auth.api.getSession({
      headers: await headers(),
    });
  } catch (error) {
    console.error("Error checking session in SignUpPage:", error);
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

  return <SignUpClient callbackUrl={callbackUrl} />;
}
