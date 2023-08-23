export type Item = {
  name: string;
  slug: string;
  functionAtName: string;
  description?: string;
};

export const demos: { name: string; items: Item[] }[] = [
  {
    name: 'Functions selected',
    items: [
      {
        name: 'Weather',
        slug: 'weather',
        functionAtName: '@sdan.getWeather',
        description: 'Get weather description',
      },
      {
        name: 'Wikitxt',
        slug: 'wikitxt',
        functionAtName: '@sdan.wikitxt',
        description: 'Get wikipedia text',
      },
      {
        name: 'ChatWithPDF',
        slug: 'chatwithpdf',
        functionAtName: '@sdan.chatWithPdfRetriever',
        description: 'Chat with PDF',
      },
      {
        name: 'createyourown',
        functionAtName: 'createyourown',
        slug: 'createyourown',
      },
    ],
  },
];
