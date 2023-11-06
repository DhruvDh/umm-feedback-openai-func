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

    const messages: ChatCompletionMessage = [
      {
        role: "system",
        content: `
As part of an AI collaborative network tutoring students working on their Java labs, your role is pivotal in triaging issues based on autograder feedback and selecting what parts of a student's submission should be retrieved for another AI that specializes in offering targeted guidance.

You will be presented with autograder feedback, which you must interpret to understand the challenges within the student's work. Based on this analysis, you will select code excerpts using the provided tools and functions to share with the assisting AI.

Rules for your operation:

1. Carefully study the autograder feedback shared with you by the student, which can include:
   - Summary of passed and failed tests
   - Compiler errors
   - Runtime exceptions
   - stdout output for any print statements the student wrote

2. Select which methods from the student's code to share with the tutoring AI to help the student. This tutoring AI will only have access to the autograder feedback you studied, and the contents of the methods you select. These should correlate directly with the issues highlighted by the autograder, such as:
   - Source methods where the failure occurred
   - Other source methods that are likely to be implicated in the failure
   - Test method that failed

3. Do not select more than six methods to avoid overburdening the tutoring AI with data, there is a limit on how much text it can process at once.

4. JUnit tests are typicaly written by the instructor, and the student is expected to write the code to pass the tests. The student is not expected to modify the tests. Generally, the fault lies in the student's code, not the tests.

Your discernment in interpreting the autograder feedback and relevant methods for retrieval is critical in streamlining the assistance process, thus facilitating an effective learning journey for the student.
`,
      },
      {
        role: "user",
        content: `
Diagnostics from the autograder (stdout and stderr output) -

Welcome to the Fast Food Kitchen!
Thank you. The last order has been canceled

Thank you. The last order has been canceled

Thank you. The last order has been canceled

How many hamburgers do you want?
How many cheeseburgers do you want?
How many veggieburgers do you want?
How many sodas do you want?
Is your order to go? (Y/N)
You have 1 hamburgers
You have 1 cheeseburgers
You have 1 veggieburgers
You have 1 sodas
Thank you. Your order number is 4

Welcome to the Fast Food Kitchen!
Thank you. The last order has been canceled

Thank you. The last order has been canceled

Thank you. The last order has been canceled

How many hamburgers do you want?
How many cheeseburgers do you want?
How many veggieburgers do you want?
How many sodas do you want?
Is your order to go? (Y/N)
You have 2 hamburgers
You have 3 cheeseburgers
You have 4 veggieburgers
You have 5 sodas
Thank you. Your order number is 8

Welcome to the Fast Food Kitchen!
Thank you. The last order has been canceled

Thank you. The last order has been canceled

Thank you. The last order has been canceled

Sorry. There are no orders to cancel.

Welcome to the Fast Food Kitchen!
Thank you. The last order has been canceled

Thank you. The last order has been canceled

Thank you. The last order has been canceled

How many hamburgers do you want?
How many cheeseburgers do you want?
How many veggieburgers do you want?
How many sodas do you want?
Is your order to go? (Y/N)
You have 1 hamburgers
You have 1 cheeseburgers
You have 1 veggieburgers
You have 1 sodas
Thank you. Your order number is 15

Welcome to the Fast Food Kitchen!
Thank you. The last order has been canceled

Thank you. The last order has been canceled

Thank you. The last order has been canceled

How many hamburgers do you want?
How many cheeseburgers do you want?
How many veggieburgers do you want?
How many sodas do you want?
Is your order to go? (Y/N)
You have 1 hamburgers
You have 1 cheeseburgers
You have 1 veggieburgers
You have 1 sodas
Thank you. Your order number is 19

Enter order number to complete?
Your order is ready. Thank you!
Welcome to the Fast Food Kitchen!
Thank you. The last order has been canceled

Thank you. The last order has been canceled

Thank you. The last order has been canceled

How many hamburgers do you want?
How many cheeseburgers do you want?
How many veggieburgers do you want?
How many sodas do you want?
Is your order to go? (Y/N)
You have 1 hamburgers
You have 1 cheeseburgers
You have 1 veggieburgers
You have 1 sodas
Thank you. Your order number is 23

What is your order number?
Welcome to the Fast Food Kitchen!
Thank you. The last order has been canceled

Thank you. The last order has been canceled

Thank you. The last order has been canceled

How many hamburgers do you want?
How many cheeseburgers do you want?
How many veggieburgers do you want?
How many sodas do you want?
Is your order to go? (Y/N)
You have 1 hamburgers
You have 1 cheeseburgers
You have 1 veggieburgers
You have 1 sodas
Thank you. Your order number is 27

What is your order number?
Welcome to the Fast Food Kitchen!
Thank you. The last order has been canceled

Thank you. The last order has been canceled

Thank you. The last order has been canceled

Sorry, but you need to enter a 1, 2, 3, 4, 5, 6, or a 7
╷
├─ JUnit Jupiter ✔
│  └─ FastFoodKitchenDriverTest ✔
│     ├─ testAnyPendingOrders() ✔
│     ├─ testHandleFoodOrder() ✔
│     ├─ testHandleCancelLastOrder() ✘ There should be no orders to cancel
│     ├─ testHandleShowNumOrdersPending() ✔
│     ├─ testHandleCompleteOrder() ✘ There should be no pending orders after completing an order expected:<0> but was:<1>
│     ├─ testHandleCheckOnOrder() ✘ java.util.InputMismatchException
│     ├─ testHandleCancelOrder() ✘ java.util.InputMismatchException
│     └─ testHandleInvalidChoice() ✔
├─ JUnit Vintage ✔
└─ JUnit Platform Suite ✔

Failures (4):
  JUnit Jupiter:FastFoodKitchenDriverTest:testHandleCancelLastOrder()
    => java.lang.AssertionError: There should be no orders to cancel
       fastfoodkitchen.FastFoodKitchenDriverTest.testHandleCancelLastOrder(FastFoodKitchenDriverTest.java:61)
       [...]
  JUnit Jupiter:FastFoodKitchenDriverTest:testHandleCompleteOrder()
    => java.lang.AssertionError: There should be no pending orders after completing an order expected:<0> but was:<1>
       fastfoodkitchen.FastFoodKitchenDriverTest.testHandleCompleteOrder(FastFoodKitchenDriverTest.java:109)
       [...]
  JUnit Jupiter:FastFoodKitchenDriverTest:testHandleCheckOnOrder()
    => java.util.InputMismatchException
       fastfoodkitchen.FastFoodKitchenDriver.handleCheckOnOrder(FastFoodKitchenDriver.java:100)
       fastfoodkitchen.FastFoodKitchenDriverTest.testHandleCheckOnOrder(FastFoodKitchenDriverTest.java:125)
       [...]
  JUnit Jupiter:FastFoodKitchenDriverTest:testHandleCancelOrder()
    => java.util.InputMismatchException
       fastfoodkitchen.FastFoodKitchenDriver.handleCancelOrder(FastFoodKitchenDriver.java:113)
       fastfoodkitchen.FastFoodKitchenDriverTest.testHandleCancelOrder(FastFoodKitchenDriverTest.java:141)
       [...]

      `,
      },
      {
        role: "system",
        content: `

> Below is a synthesized outline of the student's submission, detailing the structure, fields, and methods of the Java files, as derived from treesitter queries:

    Java Files in Student's Submission: [fastfoodkitchen.FastFoodKitchenTest, fastfoodkitchen.FastFoodKitchenDriverTest, fastfoodkitchen.BurgerOrderTest, fastfoodkitchen.FastFoodKitchenDriver, fastfoodkitchen.FastFoodKitchen, fastfoodkitchen.BurgerOrder]

Class: fastfoodkitchen.FastFoodKitchenTest :

Fields: private FastFoodKitchen kitchen;
Methods: setUp(), testAddOrder(), testIsOrderDone(), testCancelOrder(), testCancelLastOrder(), testCompleteSpecificOrder(), testCompleteNextOrder(), testGetOrderList(), testFindOrderSeq(), testFindOrderBin(), testSelectionSort(), testInsertionSort()
Class: fastfoodkitchen.FastFoodKitchenDriverTest :

Fields: private FastFoodKitchenDriver driver;
Methods: setUp(), testAnyPendingOrders(), testHandleFoodOrder(), testHandleCancelLastOrder(), testHandleShowNumOrdersPending(), testHandleCompleteOrder(), testHandleCheckOnOrder(), testHandleCancelOrder(), testHandleInvalidChoice()
Class: fastfoodkitchen.BurgerOrderTest :

Methods: testGetNumHamburger(), testSetNumHamburger(), testSetNumHamburgerNegative(), testGetNumCheeseburgers(), testSetNumCheeseburgers(), testSetNumCheeseburgersNegative(), testGetNumVeggieburgers(), testSetNumVeggieburgers(), testSetNumVeggieburgersNegative(), testGetNumSodas(), testSetNumSodas(), testGetOrderNum(), testSetOrderNum(), testIsOrderToGo(), testSetOrderToGo(), testGetTotalBurgers()
Class: fastfoodkitchen.FastFoodKitchenDriver :

Fields: protected FastFoodKitchen kitchen = new FastFoodKitchen();
Constructors: FastFoodKitchenDriver()
Methods: setScanner(Scanner sc), anyPendingOrders(), displayMenu(), getChoiceFromUser(), getChoice(), handleFoodOrder(), handleCancelLastOrder(), handleShowNumOrdersPending(), handleCompleteOrder(), handleCheckOnOrder(), handleCancelOrder(), handleExit(), handleInvalidChoice(), main(String[] args)
Class: fastfoodkitchen.FastFoodKitchen :

Fields: private ArrayList<BurgerOrder> orderList = new ArrayList<>();
Constructors: FastFoodKitchen()
Methods: getNextOrderNum(), incrementNextOrderNum(), addOrder(int ham, int cheese, int veggie, int soda, boolean toGo), isOrderDone(int orderID), cancelOrder(int orderID), getNumOrdersPending(), cancelLastOrder(), orderCallOut(BurgerOrder order), completeSpecificOrder(int orderID), completeNextOrder(), getOrderList(), findOrderSeq(int whatWeAreLookingFor), findOrderBin(int orderID), selectionSort(), insertionSort()
Class: fastfoodkitchen.BurgerOrder :

Fields: private int numHamburgers = 0;
Constructors: BurgerOrder(int numHamburgers, int numCheeseburgers, int numVeggieburgers, int numSodas, boolean orderToGo,
        int orderNum)
Methods: getNumHamburger(), setNumHamburger(int numHamburgers), getNumCheeseburgers(), setNumCheeseburgers(int numCheeseburgers), getNumVeggieburgers(), setNumVeggieburgers(int numVeggieburgers), getNumSodas(), setNumSodas(int numSodas), getOrderNum(), setOrderNum(int orderNum), isOrderToGo(), setOrderToGo(boolean orderToGo), getTotalBurgers(), toString()
`,
      },
    ];

    const completionConfig: ChatCompletionMessageParam = {
      model: "gpt-3.5-turbo",
      n: 1,
      functions,
      messages,
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
