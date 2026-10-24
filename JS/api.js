const QUOTE_API_URL = "https://dummyjson.com/quotes/random";

const LOCAL_QUOTES = {
  ar: [
    { text: "الإنجاز يبدأ بخطوة صغيرة اليوم.", source: "محلي" },
    { text: "المهام عالية الأولوية تستحق تركيزًا عاليًا.", source: "محلي" },
    { text: "ركّز على الأهم قبل المهم.", source: "محلي" },
    { text: "التركيز الآن يعني راحة لاحقًا.", source: "محلي" }
  ],
  en: [
    { text: "Progress starts with one small step today.", source: "local" },
    { text: "High-priority work deserves high-priority focus.", source: "local" },
    { text: "Do the important thing before the merely urgent.", source: "local" },
    { text: "Focus now means ease later.", source: "local" }
  ]
};

export async function fetchHighPriorityMessage(task, lang = "en") {
  try {
    const remoteQuote = await fetchQuoteFromApi();

    return {
      text: remoteQuote.text,
      source: remoteQuote.source,
      fallback: false,
      taskTitle: task?.title ?? ""
    };
  } catch {
    const localQuote = await fetchQuoteMock(lang);

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

function fetchQuoteMock(lang = "en") {
  const pack = LOCAL_QUOTES[lang] || LOCAL_QUOTES.en;

  return new Promise(resolve => {
    const randomIndex = Math.floor(Math.random() * pack.length);

    setTimeout(() => {
      resolve(pack[randomIndex]);
    }, 700);
  });
}