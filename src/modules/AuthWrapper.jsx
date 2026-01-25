import { useState } from "react";
import { Login } from "./Login";
import { SignUp } from "./SignUp";

export function AuthWrapper({ apiUrl, onLogin }) {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <>
      {isLogin ? (
        <Login
          apiUrl={apiUrl}
          onLogin={onLogin}
          switchToSignUp={() => setIsLogin(false)}
        />
      ) : (
        <SignUp
          apiUrl={apiUrl}
          onLogin={onLogin}
          switchToLogin={() => setIsLogin(true)}
        />
      )}
    </>
  );
}
