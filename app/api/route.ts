import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import {
  ChatCompletionMessage,
  CreateChatCompletionRequestMessage,
} from 'openai/resources/chat';
const MAX_CHARACTERS = 10000;
// Configure OpenAI API
const openai = new OpenAI({
  apiKey: 'REPLACEMENT_TEXT', // defaults to process.env["OPENAI_API_KEY"]
});

export async function POST(request: NextRequest) {
  // Extract parameters
  const rawVals = decodeURIComponent(request.url?.split('=')[1]);

  const valsArray = rawVals.split(',');

  const { prompt } = await request.json();

  let allFunctions: any[] = [];
  let nameMappings: Record<string, string> = {}; // To store mappings between clean and regular names

  for (const val of valsArray) {
    const cleanVal = val.replace('@', '').replace('.', '_');
    nameMappings[cleanVal] = val; // Store the mapping

    console.log(
      `Processing val: ${val} clean ${cleanVal} and prompt: ${prompt}`,
    );

    // Fetch function arguments from val.town API for each val
    const argsResponse = await fetch(
      `https://api.val.town/v1/run/sdan.getArgs?args=["${val}"]`,
    );
    const argsData = await argsResponse.json();
    console.log(
      `Fetched arguments from val.town API for ${val}: ${JSON.stringify(
        argsData,
      )}`,
    );

    let properties = {};
    let required: any = []; // Step 1: Create an empty required array

    if (argsData && argsData.length > 0) {
      properties = argsData.reduce((acc: any, curr: any) => {
        acc[curr.name] = { type: curr.type };
        required.push(curr.name); // Step 2: Push property names to the required array
        return acc;
      }, {});
    }

    // Convert the received arguments into OpenAI function format for each val
    const functionFormat = {
      name: cleanVal,
      parameters: {
        type: 'object',
        properties: properties,
        required: required, // Step 3: Include the required array
      },
    };
    allFunctions.push(functionFormat);
  }

  console.log(
    `Converted all arguments into OpenAI function format: ${JSON.stringify(
      allFunctions,
    )}`,
  );

  // Prepare messages for OpenAI
  const messages: CreateChatCompletionRequestMessage[] = [
    {
      role: 'system',
      content: 'You have the ability to make function calls.',
    },
    {
      role: 'user',
      content: prompt,
    },
  ];

  do {
    // Calculate total characters used in message history
    let charsUsed = calculateCharacters(messages);

    if (charsUsed > MAX_CHARACTERS) {
      // Handle overflow, e.g., truncate, remove oldest messages, etc.
      handleOverflow(messages);
    }

    const openaiData = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages,
      functions: allFunctions,
      temperature: 0.7,
    });
    console.log(
      `Sent prompt to OpenAI and received response: ${JSON.stringify(
        openaiData,
      )}`,
    );

    const functionCall = openaiData.choices[0]?.message?.function_call;

    if (functionCall) {
      console.log(
        `OpenAI requested a function call: ${JSON.stringify(functionCall)}`,
      );

      const functionArgsArray = Object.entries(
        allFunctions.find((fn) => fn.name === functionCall.name).parameters
          .properties,
      ).map(([key, value]) => ({ name: key, type: (value as any).type }));

      let functionResult = await callFunction(
        nameMappings[functionCall.name], // Use the mapping to get the regular name
        functionCall.arguments,
        functionArgsArray,
      );

      // truncate the result if it's too long
      if (functionResult.length > 5000) {
        functionResult = functionResult.substring(0, 5000) + '...';
      }

      // console.log(
      //   `OpenAI requested a function call. Result: ${JSON.stringify(
      //     functionResult,
      //   )}`,
      // );

      messages.push({
        role: 'function',
        name: functionCall.name,
        content: JSON.stringify(functionResult),
      });
    } else {
      return NextResponse.json({
        response: openaiData.choices[0]?.message?.content,
      });
      break; // Exit the loop if there's no function call
    }
  } while (true);

  return NextResponse.json({
    response: messages[messages.length - 1].content,
  });
}

async function callFunction(
  functionName: string,
  openaiArgs: string,
  functionArgs: any[],
): Promise<string> {
  // 1. Parse the OpenAI arguments
  const parsedOpenaiArgs = JSON.parse(openaiArgs);

  // 2. Match each argument with its type from functionArgs
  const argsList: string[] = [];
  for (const arg of functionArgs) {
    if (parsedOpenaiArgs[arg.name]) {
      switch (arg.type) {
        case 'string':
          argsList.push(`"${parsedOpenaiArgs[arg.name]}"`);
          break;
        default:
          argsList.push(parsedOpenaiArgs[arg.name]);
          break;
      }
    }
  }

  // 3. Construct the URL for the Val API using the matched and parsed arguments
  const formattedFunctionName = functionName.replace('@', '').replace('_', '.'); // Ensure "@" prefix is removed
  const argsString = `[${argsList.join(',')}]`;
  console.log(
    `constructed url run: https://api.val.town/v1/run/${formattedFunctionName}?args=${argsString}`,
  );
  const valResp = await fetch(
    `https://api.val.town/v1/run/${formattedFunctionName}?args=${argsString}`,
  );

  return await valResp.text();
}

function calculateCharacters(
  messages: CreateChatCompletionRequestMessage[],
): number {
  return messages.reduce(
    (total, message) => total + (message.content ? message.content.length : 0),
    0,
  );
}

function handleOverflow(messages: CreateChatCompletionRequestMessage[]) {
  // Check if the total messages exceed the limit
  while (
    calculateCharacters(messages) > MAX_CHARACTERS &&
    messages.length > 1
  ) {
    messages.splice(1, 1); // Remove the second oldest message, keeping the system message intact
  }

  // Check if any single message exceeds the limit
  for (let i = 0; i < messages.length; i++) {
    const message = messages[i];
    if (message.content && message.content.length > MAX_CHARACTERS) {
      // Truncate the message and add an ellipsis
      message.content =
        message.content.substring(0, MAX_CHARACTERS - 3) + '...';
    }
  }
}
