# functioncalling

Here, you can turn small JavaScript functions into GPT function calls that you can call via an API. All functions are run on val.town.
----

## Use via POST:
To make a POST request to the API, use the endpoint:
https://functioncalling.fun/api?vals=@sdan.chatWithPdfRetriever
Include the following JSON payload in the request body:
{
  "prompt": ""
}
Make sure to set the Content-Type header to application/json.