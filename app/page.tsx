'use client';
import { Boundary } from '#/ui/boundary';
import Button from '#/ui/button';
import { demos } from '#/lib/demos';
import Link from 'next/link';
import { useState } from 'react';
import { SkeletonCard } from '#/ui/skeleton-card';

export default function Page() {
  const HOSTED_URL = 'https://functioncalling.fun/api?vals='; // Change the URL to the hosted URL
  const [selectedDemos, setSelectedDemos] = useState<string[]>([]);
  const [iframeUrl, setIframeUrl] = useState<string | null>(null);
  const [functionLink, setFunctionLink] = useState<string | null>(null);
  const [gpt3Response, setGpt3Response] = useState<string | null>(null);
  const [prompt, setPrompt] = useState<string>('');
  const [customFunctionName, setCustomFunctionName] = useState<string | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState<boolean>(false); // Add a new state for loading
  const handleDemoSelection = (demo: string, functionName: string) => {
    if (demo === 'createyourown') {
      if (iframeUrl) {
        setIframeUrl(null);
        setSelectedDemos((prevDemos) =>
          prevDemos.filter((d) => d !== demo && d !== customFunctionName),
        );
        setFunctionLink((prevLink) => {
          const vals = prevLink
            ?.replace(`${HOSTED_URL}`, '')
            .split(',')
            .filter((val) => val !== customFunctionName && val !== '')
            .join(',');
          return vals ? `${HOSTED_URL}${vals}` : null;
        });
        setCustomFunctionName(null);
      } else {
        setIframeUrl('https://val.town/embed/new');
        setSelectedDemos((prevDemos) => [...prevDemos, demo]);
      }
    } else {
      setSelectedDemos((prevDemos) => {
        const newDemos = prevDemos.includes(functionName)
          ? prevDemos.filter((d) => d !== functionName)
          : [...prevDemos, functionName];
        const vals = newDemos.join(',');
        setFunctionLink(vals ? `${HOSTED_URL}${vals}` : null);
        return newDemos;
      });
    }
  };

  return (
    <div className="space-y-8">
      <h1 className="text-xl font-medium text-gray-300">
        Welcome to FunctionCalling.fun
      </h1>
      <p className="text-lg text-gray-200">
        Here, you can turn small JavaScript functions into GPT function calls
        that you can call via an API. All functions are run on val.town.
      </p>
      <div className="space-y-10 text-white">
        {demos.map((section) => {
          return (
            <div key={section.name} className="space-y-5">
              <Boundary
                labels={['Functions selected']}
                color="default"
                size="small"
                animateRerendering={true}
              >
                <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                  {section.items.map((item) => {
                    return (
                      <div
                        onClick={() =>
                          handleDemoSelection(item.name, item.functionAtName)
                        }
                        key={item.name}
                        className={`group block space-y-1.5 rounded-lg bg-gray-900 px-5 py-3 ${
                          selectedDemos.includes(item.functionAtName) ||
                          (item.name === 'createyourown' && iframeUrl)
                            ? 'bg-vercel-violet'
                            : 'hover:bg-gray-800'
                        }`}
                      >
                        {item.name === 'createyourown' ? (
                          <div className="flex items-center justify-center text-4xl font-bold text-gray-200 group-hover:text-gray-50">
                            +
                          </div>
                        ) : (
                          <div className="font-medium text-gray-200 group-hover:text-gray-50">
                            {item.name}
                          </div>
                        )}

                        {item.description && item.name !== 'createyourown' ? (
                          <div className="line-clamp-3 text-sm text-gray-400 group-hover:text-gray-300">
                            {item.description}
                          </div>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
                {iframeUrl && (
                  <div className="flex flex-col items-start space-y-2">
                    <iframe
                      src={iframeUrl}
                      style={{
                        display: iframeUrl ? 'block' : 'none',
                        width: '100%',
                        padding: '10px',
                      }}
                    />
                    {selectedDemos.includes('createyourown') && (
                      <div className="flex w-full items-center space-x-2">
                        <input
                          className="flex-grow rounded-lg bg-gray-700 px-3 py-1 text-sm font-medium text-gray-100"
                          type="text"
                          placeholder="Copy name of function, starts with @"
                          value={customFunctionName || ''}
                          onChange={(e) =>
                            setCustomFunctionName(e.target.value)
                          }
                        />

                        <Button
                          kind="default"
                          onClick={() => {
                            if (customFunctionName) {
                              setFunctionLink(
                                (prevLink) =>
                                  `${
                                    prevLink ? prevLink + ',' : HOSTED_URL
                                  }${customFunctionName}`,
                              );
                            }
                          }}
                        >
                          Submit
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </Boundary>

              {functionLink && (
                <Boundary
                  labels={['Run Function']}
                  color="default"
                  size="default"
                  animateRerendering={true}
                >
                  <div className="flex w-full items-center space-x-2">
                    <input
                      className="flex-grow rounded-lg bg-gray-700 px-3 py-2 text-lg font-medium text-gray-100"
                      type="text"
                      value={prompt}
                      placeholder="Enter your query to prompt GPT-3"
                      onChange={(e) => setPrompt(e.target.value)}
                    />
                    <Button
                      kind="default"
                      className="inline-flex gap-x-2 rounded-lg bg-gray-700 px-5 py-2 text-lg font-medium text-gray-100 no-underline hover:bg-gray-500 hover:text-white" // Adjusted the button style according to the instructions
                      onClick={async () => {
                        if (prompt && functionLink) {
                          setIsLoading(true);
                          setGpt3Response(null); // Clear the previous response when a new submission is entered
                          const res = await fetch(functionLink, {
                            method: 'POST',
                            headers: {
                              'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({ prompt }),
                          });
                          const data = await res.json();
                          setGpt3Response(data.response);
                          setIsLoading(false);
                        }
                      }}
                    >
                      Run
                    </Button>
                  </div>

                  <div className="mt-4"></div>

                  {/* Add the loading state display here */}
                  {isLoading && (
                    <div className="mt-4">
                      <SkeletonCard isLoading={true} />
                    </div>
                  )}

                  {gpt3Response && (
                    <Boundary
                      labels={['GPT-3 Response']}
                      color="default"
                      size="default"
                      animateRerendering={true}
                      // className="mt-4"
                    >
                      <div className="rounded-lg bg-gray-800 p-3">
                        <div className="font-medium text-gray-200">
                          {gpt3Response}
                        </div>
                      </div>
                    </Boundary>
                  )}

                  <div className="mt-4 rounded-lg bg-gray-800 p-3">
                    <div className="mb-2 font-medium text-gray-200">
                      Use via POST:
                    </div>
                    <div className="text-sm text-gray-300">
                      <div>
                        To make a POST request to the API, use the endpoint:
                      </div>
                      <div className="my-2 break-all rounded bg-gray-700 p-2">
                        {functionLink}
                      </div>
                      <div>
                        Include the following JSON payload in the request body:
                      </div>
                      <pre className="my-2 rounded bg-gray-700 p-2">
                        {`{
  "prompt": "${prompt}"
}`}
                      </pre>
                      <div>
                        Make sure to set the Content-Type header to
                        application/json.
                      </div>
                    </div>
                  </div>
                </Boundary>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
