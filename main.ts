import { Application, Router } from "https://deno.land/x/oak@v12.6.1/mod.ts";
import { ChatCompletionMessageParam, OpenAI } from "npm:openai";
import { ChatCompletionMessage } from "npm:openai";

const router = new Router();
const app = new Application();
const openai = new OpenAI();

app.use((ctx, next) => {
  ctx.response.headers.set("Access-Control-Allow-Origin", "*");
  ctx.response.headers.set(
    "Access-Control-Allow-Methods",
    "OPTIONS,GET",
  );
  ctx.response.headers.set(
    "Access-Control-Allow-Headers",
    "Content-Type,Authorization",
  );
  return next();
});

router
  .options("/", (ctx) => {
    ctx.response.status = 200;
    ctx.response.statusText = "OK";
  })
  .get("/", async (ctx) => {
    const body = await (await ctx.request.body({ type: "json" })).value;
    const functions = [
      {
        "name": "get_current_weather",
        "description": "Get the current weather",
        "parameters": {
          "type": "object",
          "properties": {
            "location": {
              "type": "string",
              "description": "The city and state, e.g. San Francisco, CA",
            },
            "format": {
              "type": "string",
              "enum": ["celsius", "fahrenheit"],
              "description":
                "The temperature unit to use. Infer this from the users location.",
            },
          },
          "required": ["location", "format"],
        },
      },
      {
        "name": "get_n_day_weather_forecast",
        "description": "Get an N-day weather forecast",
        "parameters": {
          "type": "object",
          "properties": {
            "location": {
              "type": "string",
              "description": "The city and state, e.g. San Francisco, CA",
            },
            "format": {
              "type": "string",
              "enum": ["celsius", "fahrenheit"],
              "description":
                "The temperature unit to use. Infer this from the users location.",
            },
            "num_days": {
              "type": "integer",
              "description": "The number of days to forecast",
            },
          },
          "required": ["location", "format", "num_days"],
        },
      },
    ];

    const messages: ChatCompletionMessage = [{
      role: "user",
      content: "hi",
    }];

    const completionConfig: ChatCompletionMessageParam = {
      model: "gpt-3.5-turbo",
      temperature: 0,
      top_p: 1,
      n: 1,
      frequency_penalty: 0.0,
      presence_penalty: 0.0,
      functions,
      messages,
    };

    const resp = await openai.chat.completions.create(completionConfig)
      .asResponse();
    if (resp.status !== 200) {
      throw new Error(await resp.text());
    }


    return resp;
  });

app.use(router.routes());
await app.listen({ port: 8000 });
