import { Application, Router } from "https://deno.land/x/oak/mod.ts";
import {
  ChatCompletionRequestMessage,
  CreateChatCompletionRequest,
  OpenAI,
} from "https://deno.land/x/openai/mod.ts";

const router = new Router();
const app = new Application();
const openai = new OpenAI({
  apiKey: Deno.env.get("OPENAI_API_KEY") ?? "",
  // apiKey: Deno.env.get("TOGETHER_API_KEY") ?? "",
  // baseURL: "https://api.together.xyz",
});

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
    const body = await ctx.request.body.json();
    // console.log(body);
    // const messages = body.messages;
    // const functions = body.functions;

    const functions = [
      {
        type: "function",
        function: {
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
      },
    ];

    const completionConfig: ChatCompletionMessageParam = {
      model: "gpt-3.5-turbo-0125",
      // model: "togethercomputer/CodeLlama-34b-Instruct",
      n: 1,
      tools: functions,
      messages: body,
      tool_choice: { type: "function", function: { name: "get_method_body" } },
      parse: JSON.parse,
    };

    const resp = await openai.chat.completions
      .create(completionConfig)
      .asResponse();
    if (resp.status !== 200) {
      throw new Error(await resp.text());
    }

    ctx.response.body = await resp.json();
    // console.log(ctx.response.body);
  });

app.use(router.routes());
await app.listen({ port: 8000 });
