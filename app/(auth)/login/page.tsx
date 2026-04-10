import { Suspense } from "react";
import LoginForm from "@/app/(auth)/login/LoginForm";

export default function LoginPage() {
  return (
    <Suspense fallback={<div />}>
      <LoginForm />
    </Suspense>
  );
}
