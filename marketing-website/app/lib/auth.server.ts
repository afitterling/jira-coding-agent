import { createCookie } from "@remix-run/node";
import {
  CognitoIdentityProviderClient,
  ConfirmForgotPasswordCommand,
  ConfirmSignUpCommand,
  ForgotPasswordCommand,
  InitiateAuthCommand,
  ResendConfirmationCodeCommand,
  SignUpCommand,
} from "@aws-sdk/client-cognito-identity-provider";

const region = process.env.AWS_REGION ?? "us-east-1";
const idp = new CognitoIdentityProviderClient({ region });
const CLIENT_ID = process.env.COGNITO_CLIENT_ID ?? "";

export interface SessionUser {
  email: string;
  idToken: string;
}

export const sessionCookie = createCookie("jca_marketing_session", {
  path: "/",
  httpOnly: true,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  maxAge: 60 * 60 * 8,
});

export async function getUser(request: Request): Promise<SessionUser | null> {
  const data = (await sessionCookie.parse(request.headers.get("Cookie"))) as SessionUser | null;
  return data?.email && data?.idToken ? data : null;
}

export function commitSession(user: SessionUser) {
  return sessionCookie.serialize(user);
}

export function destroySession() {
  return sessionCookie.serialize("", { maxAge: 0 });
}

function friendly(e: unknown): string {
  const name = (e as { name?: string })?.name ?? "";
  const msg = (e as Error)?.message ?? "Unexpected error";
  switch (name) {
    case "UsernameExistsException":
      return "An account with this email already exists.";
    case "InvalidPasswordException":
      return "Password must include upper/lowercase letters, a number and a symbol.";
    case "CodeMismatchException":
      return "The confirmation code is incorrect.";
    case "ExpiredCodeException":
      return "That code has expired. Request a new one.";
    case "NotAuthorizedException":
    case "UserNotFoundException":
      return "Incorrect email or password.";
    case "UserNotConfirmedException":
      return "Please confirm your email first.";
    case "LimitExceededException":
      return "Too many attempts. Please try again shortly.";
    default:
      return msg;
  }
}

export type AuthResult = { ok: true } | { ok: false; error: string };

export async function signUp(email: string, password: string): Promise<AuthResult> {
  try {
    await idp.send(
      new SignUpCommand({
        ClientId: CLIENT_ID,
        Username: email,
        Password: password,
        UserAttributes: [{ Name: "email", Value: email }],
      }),
    );
    return { ok: true };
  } catch (e) {
    return { ok: false, error: friendly(e) };
  }
}

export async function confirmSignUp(email: string, code: string): Promise<AuthResult> {
  try {
    await idp.send(new ConfirmSignUpCommand({ ClientId: CLIENT_ID, Username: email, ConfirmationCode: code }));
    return { ok: true };
  } catch (e) {
    return { ok: false, error: friendly(e) };
  }
}

export async function resendCode(email: string): Promise<AuthResult> {
  try {
    await idp.send(new ResendConfirmationCodeCommand({ ClientId: CLIENT_ID, Username: email }));
    return { ok: true };
  } catch (e) {
    return { ok: false, error: friendly(e) };
  }
}

export async function login(
  email: string,
  password: string,
): Promise<{ ok: true; user: SessionUser } | { ok: false; error: string; needsConfirmation?: boolean }> {
  try {
    const res = await idp.send(
      new InitiateAuthCommand({
        ClientId: CLIENT_ID,
        AuthFlow: "USER_PASSWORD_AUTH",
        AuthParameters: { USERNAME: email, PASSWORD: password },
      }),
    );
    const idToken = res.AuthenticationResult?.IdToken;
    if (!idToken) return { ok: false, error: "Login failed. No token returned." };
    return { ok: true, user: { email, idToken } };
  } catch (e) {
    if ((e as { name?: string })?.name === "UserNotConfirmedException") {
      return { ok: false, error: "Please confirm your email first.", needsConfirmation: true };
    }
    return { ok: false, error: friendly(e) };
  }
}

export async function requestPasswordReset(email: string): Promise<AuthResult> {
  try {
    await idp.send(new ForgotPasswordCommand({ ClientId: CLIENT_ID, Username: email }));
    return { ok: true };
  } catch (e) {
    return { ok: false, error: friendly(e) };
  }
}

export async function confirmPasswordReset(
  email: string,
  code: string,
  password: string,
): Promise<AuthResult> {
  try {
    await idp.send(
      new ConfirmForgotPasswordCommand({
        ClientId: CLIENT_ID,
        Username: email,
        ConfirmationCode: code,
        Password: password,
      }),
    );
    return { ok: true };
  } catch (e) {
    return { ok: false, error: friendly(e) };
  }
}
