import { Application, Router } from "https://deno.land/x/oak/mod.ts";
import {
  ChatCompletionRequestMessage,
  CreateChatCompletionRequest,
  OpenAI,
} from "https://deno.land/x/openai/mod.ts";

const router = new Router();
const app = new Application();
const openai = new OpenAI();

app.use((ctx, next) => {
  ctx.response.headers.set("Access-Control-Allow-Origin", "*");
  ctx.response.headers.set("Access-Control-Allow-Methods", "OPTIONS,GET");
  ctx.response.headers.set(
    "Access-Control-Allow-Headers",
    "Content-Type,Authorization"
  );
  return next();
});

router
  .options("/", (ctx) => {
    ctx.response.status = 200;
    ctx.response.statusText = "OK";
  })
  .post("/", async (ctx) => {
    const body = await (await ctx.request.body({ type: "json" })).value;
    // const messages = body.messages;
    // const functions = body.functions;

    const functions = [
      {
        name: "get_method_body",
        description:
          "Returns the method body for a given method inside a given class.",
        parameters: {
          type: "object",
          properties: {
            params: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  className: {
                    type: "string",
                  },
                  methodName: {
                    type: "string",
                  },
                },
                required: ["className", "methodName"],
              },
            },
          },
          required: ["params"],
        },
      },
    ];

    const completionConfig: ChatCompletionMessageParam = {
      model: "gpt-3.5-turbo-1106",
      n: 1,
      functions,
      messages: body,
      function_call: { name: "get_method_body" },
      parse: JSON.parse,
    };

    const resp = await openai.chat.completions
      .create(completionConfig)
      .asResponse();
    if (resp.status !== 200) {
      throw new Error(await resp.text());
    }

    ctx.response.body = await resp.json();
    console.log(ctx.response.body);
  });

app.use(router.routes());
await app.listen({ port: 8000 });
