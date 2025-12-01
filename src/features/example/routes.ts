import { Elysia } from "elysia";

const exampleRoutes = new Elysia().get("/example", () => "Hello Elysia");
