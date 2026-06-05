import { createCookie } from "@remix-run/node";
import {
  CognitoIdentityProviderClient,
  ConfirmSignUpCommand,
  InitiateAuthCommand,
  ResendConfirmationCodeCommand,
  SignUpCommand,
} from "@aws-sdk/client-cognito-identity-provider";

const region = process.env.AWS_REGION ?? "us-east-1";
const idp = new CognitoIdentityProviderClient({ region });
const CLIENT_ID = process.env.COGNITO_CLIENT_ID ?? "";

// SignUp / ConfirmSignUp / InitiateAuth are public (unauthenticated) Cognito APIs:
// they take the app client id, not IAM. A public client (no secret) avoids SECRET_HASH.

export interface SessionUser {
  email: string;
  idToken: string;
  /** Cognito groups from the IdToken (e.g. ["admin"]). */
  groups: string[];
}

/** Admins (Cognito group "admin") see all costs; everyone else only their own. */
export function isAdmin(user: SessionUser | null): boolean {
  return !!user?.groups?.includes("admin");
}

/** Decode a JWT payload (no signature verification — only for reading own claims). */
function decodeJwt(token: string): Record<string, unknown> {
  try {
    const part = token.split(".")[1] ?? "";
    const json = Buffer.from(part.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf8");
    return JSON.parse(json);
  } catch {
    return {};
  }
}

export const sessionCookie = createCookie("jca_session", {
  path: "/",
  httpOnly: true,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  maxAge: 60 * 60 * 8, // 8h
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

/** Friendly message for the common Cognito error names. */
function friendly(e: unknown): string {
  const name = (e as { name?: string })?.name ?? "";
  const msg = (e as Error)?.message ?? "Unexpected error";
  switch (name) {
    case "UsernameExistsException":
      return "An account with this email already exists.";
    case "InvalidPasswordException":
      return "Password doesn't meet the requirements (min 8 chars, upper- & lowercase, number, symbol).";
    case "CodeMismatchException":
      return "That confirmation code is incorrect.";
    case "ExpiredCodeException":
      return "That code has expired — request a new one.";
    case "NotAuthorizedException":
      return "Incorrect email or password.";
    case "UserNotFoundException":
      return "Incorrect email or password.";
    case "LimitExceededException":
      return "Too many attempts — please wait a moment and try again.";
    default:
      return msg;
  }
}

export type AuthResult =
  | { ok: true }
  | { ok: false; error: string }
  | { ok: false; error: string; needsConfirmation: true };

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
    await idp.send(
      new ConfirmSignUpCommand({ ClientId: CLIENT_ID, Username: email, ConfirmationCode: code }),
    );
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
    if (!idToken) return { ok: false, error: "Login failed — no token returned." };
    const claims = decodeJwt(idToken);
    const groups = Array.isArray(claims["cognito:groups"])
      ? (claims["cognito:groups"] as string[])
      : [];
    return { ok: true, user: { email, idToken, groups } };
  } catch (e) {
    if ((e as { name?: string })?.name === "UserNotConfirmedException") {
      return { ok: false, error: "Please confirm your email first.", needsConfirmation: true };
    }
    return { ok: false, error: friendly(e) };
  }
}
