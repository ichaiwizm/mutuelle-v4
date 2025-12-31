import { createServer, type Server } from "node:http";
import { URL } from "node:url";
import { REDIRECT_PORT } from "./constants";

export function generateHtmlResponse(type: "success" | "error", title: string, message: string, email?: string): string {
  const icon = type === "success" ? "OK" : "ERREUR";
  const emailLine = email ? `<p>Compte connecte : <strong>${email}</strong></p>` : "";
  return `<html><head><title>${title}</title></head><body style="font-family:system-ui;padding:40px;text-align:center;"><h1>${icon} ${title}</h1>${emailLine}<p>${message}</p><p>Vous pouvez fermer cette fenetre.</p></body></html>`;
}

export type CallbackResult = { code: string; state: string } | { error: string };

export function createOAuthServer(expectedState: string, onResult: (res: CallbackResult) => void): Server {
  return createServer((req, res) => {
    const url = new URL(req.url || "/", `http://127.0.0.1:${REDIRECT_PORT}`);
    if (url.pathname !== "/oauth2/callback") {
      res.writeHead(404);
      res.end("Not Found");
      return;
    }
    const code = url.searchParams.get("code");
    const returnedState = url.searchParams.get("state");
    const error = url.searchParams.get("error");
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    if (error) {
      res.end(generateHtmlResponse("error", "Erreur d'authentification", error));
      onResult({ error });
      return;
    }
    if (!code || returnedState !== expectedState) {
      res.end(generateHtmlResponse("error", "Erreur", "Code d'autorisation invalide ou state mismatch."));
      onResult({ error: "Invalid authorization response" });
      return;
    }
    onResult({ code, state: returnedState });
  });
}
