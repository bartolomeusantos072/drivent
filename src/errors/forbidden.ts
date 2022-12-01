import { ApplicationError } from "@/protocols";

export function   Forbidden(): ApplicationError {
  return {
    name: "Forbidden",
    message: "The server understands the request but refuses to authorize it.",
  };
}
