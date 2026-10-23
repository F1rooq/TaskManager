const QUOTE_API_URL = "https://dummyjson.com/quotes/random";

const LOCAL_QUOTES = [
  {
    text: "الإنجاز يبدأ بخطوة صغيرة اليوم.",
    source: "اقتباس محلي"
  },
  {
    text: "المهام عالية الأولوية تستحق تركيزًا عاليًا.",
    source: "اقتباس محلي"
  },
  {
    text: "ركّز على الأهم قبل المهم.",
    source: "اقتباس محلي"
  },
  {
    text: "التركيز الآن يعني راحة لاحقًا.",
    source: "اقتباس محلي"
  }
];

export async function fetchHighPriorityMessage(task) {
  try {
    const remoteQuote = await fetchQuoteFromApi();

    return {
      text: remoteQuote.text,
      source: remoteQuote.source,
      fallback: false,
      taskTitle: task?.title ?? ""
    };
  } catch {
    const localQuote = await fetchQuoteMock();

    return {
      text: localQuote.text,
      source: localQuote.source,
      fallback: true,
      taskTitle: task?.title ?? ""
    };
  }
}

async function fetchQuoteFromApi() {
  const controller = new AbortController();

  const timeoutId = setTimeout(() => {
    controller.abort();
  }, 5000);

  try {
    const response = await fetch(QUOTE_API_URL, {
      signal: controller.signal
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (!data?.quote) {
      throw new Error("No quote found");
    }

    return {
      text: data.quote,
      source: data.author || "Unknown"
    };
  } finally {
    clearTimeout(timeoutId);
  }
}

function fetchQuoteMock() {
  return new Promise(resolve => {
    const randomIndex = Math.floor(Math.random() * LOCAL_QUOTES.length);

    setTimeout(() => {
      resolve(LOCAL_QUOTES[randomIndex]);
    }, 700);
  });
}