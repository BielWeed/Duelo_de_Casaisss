import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { MiniGameType, Player, Gender, GeoGuessrLocation } from '../types';
import { PT_BR, getPronounInfo } from '../utils/translations';

if (!process.env.API_KEY) {
  throw new Error("API_KEY do Google Gemini não está configurada. Verifique as variáveis de ambiente.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const parseJsonResponse = <T>(jsonString: string, context: string): T | null => {
    try {
        // A API Gemini pode retornar o JSON dentro de um bloco de código markdown.
        const cleanedJsonString = jsonString.replace(/^```json\s*|```\s*$/g, '').trim();
        return JSON.parse(cleanedJsonString) as T;
    } catch (e: any) {
        console.error(`Falha ao analisar a resposta JSON para ${context}:`, e.message, "\nTexto da resposta bruta:", jsonString);
        return null;
    }
};

const generatePrompt = (
  miniGameType: MiniGameType,
  adultMode: boolean,
  losingPlayer: Player,
  winningPlayer?: Player,
  existingQuestionText?: string
): string => {
  const loserPronouns = getPronounInfo(losingPlayer.gender, false);
  const loserName = losingPlayer.name;
  const partnerName = winningPlayer?.name;

  const modeSuffix = adultMode ? " (Modo Adulto +18: ousado, picante e íntimo!)" : " (Modo Padrão: divertido, leve e revelador)";
  
  let prompt = `Você é um mestre de cerimônias carismático para "Duelo de Casais". Sua missão é criar perguntas concisas e criativas em Português Brasileiro. Tom: ${modeSuffix}.\n`;
  prompt += `Jogador perdedor: ${loserName}.\n`;
  if (partnerName) { 
    prompt += `Parceiro(a/e) vencedor(a): ${partnerName}.\n`;
  }
  prompt += `--- Contexto do Minijogo ---\n`;

  switch (miniGameType) {
    case MiniGameType.VERDADE:
      prompt += `Minijogo: ${PT_BR.truthGameName}. Crie uma AFIRMAÇÃO específica, interessante e concisa sobre ${loserName}. Pode ser um hábito, uma gafe, uma opinião. Exemplo: "Verdade ou Mentira: ${loserName} já cantou karaokê desafinado só para fazer ${partnerName || 'alguém'} rir?". Retorne APENAS o texto da afirmação começando com "Verdade ou Mentira: ".`;
      break;

    case MiniGameType.EU_NUNCA:
      prompt += `Minijogo: ${PT_BR.neverHaveIEverGameName}. Crie uma afirmação "Eu nunca..." instigante e curta para ${loserName}. Deve ser uma situação específica e potencialmente surpreendente. Retorne APENAS o texto da afirmação "Eu nunca...".`;
      break;

    case MiniGameType.FARIA_NAO_FARIA:
      prompt += `Minijogo: ${PT_BR.wouldIDoItGameName}. Elabore um CENÁRIO HIPOTÉTICO vívido, criativo e conciso para ${loserName}. Deve ser um dilema interessante ou um desafio engraçado. Retorne APENAS o texto descrevendo o cenário.`;
      break;

    case MiniGameType.QUIZ_CASAL:
      if (partnerName) {
        prompt += `Minijogo: ${PT_BR.couplesQuizGameName}. O jogador ${loserName} precisa adivinhar um detalhe sobre ${partnerName}.\n`;
        if (existingQuestionText) {
          prompt += `REGENERE OPÇÕES para a pergunta: "${existingQuestionText}". Gere 4 opções de múltipla escolha NOVAS e CRIATIVAS, onde uma é a mais plausível e as outras são distratores convincentes. A pergunta original deve ser mantida.`;
        } else {
          prompt += `Formule uma PERGUNTA curta e envolvente sobre uma peculiaridade, gosto ou memória de ${partnerName}. Crie 4 opções de múltipla escolha distintas e plausíveis para esta pergunta.`;
        }
        prompt += `A resposta deve ser um objeto JSON.`;
      }
      break;
    default:
      prompt += `Gere uma pergunta divertida e genérica para ${loserName}.`;
  }
  return prompt;
};

export const generateQuestion = async (
  miniGameType: MiniGameType,
  adultMode: boolean,
  losingPlayer: Player,
  winningPlayer?: Player,
  existingQuestionForRegeneration?: string
): Promise<{questionText: string, options?: string[]}> => {

  const prompt = generatePrompt(miniGameType, adultMode, losingPlayer, winningPlayer, existingQuestionForRegeneration);
  const isQuiz = (miniGameType === MiniGameType.QUIZ_CASAL && winningPlayer);

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: isQuiz ? {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    pergunta: { type: Type.STRING, description: "A pergunta sobre o parceiro." },
                    opcoes: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Exatamente 4 opções de resposta." }
                },
                required: ["pergunta", "opcoes"]
            }
        } : {}
    });

    const responseText = response.text;
    if (!responseText) throw new Error("A API de IA retornou conteúdo de texto vazio.");

    if (isQuiz) {
        const parsed = parseJsonResponse<{pergunta: string, opcoes: string[]}>(responseText, `minigame ${miniGameType}`);
        if (parsed && parsed.pergunta && Array.isArray(parsed.opcoes) && parsed.opcoes.length === 4) {
            return {
                questionText: existingQuestionForRegeneration || parsed.pergunta,
                options: parsed.opcoes,
            };
        } else {
            throw new Error("Estrutura JSON inválida recebida para o quiz.");
        }
    } else {
        let questionText = responseText.trim();
        if (miniGameType === MiniGameType.VERDADE && !questionText.toLowerCase().startsWith("verdade ou mentira:")) {
            questionText = `Verdade ou Mentira: ${questionText}`;
        }
        return { questionText };
    }

  } catch (error: any) {
    console.error("Erro ao chamar a API Gemini:", error.message || error, "\nPrompt enviado:", prompt);
    const displayError = PT_BR.errorFetchingQuestion + " (Falha na IA)";
    return { questionText: existingQuestionForRegeneration || displayError };
  }
};


export const generateContextoSecretWord = async (): Promise<string> => {
  const prompt = `Gere uma única palavra em português, um substantivo comum ou adjetivo, com 5 a 10 letras, para um jogo de adivinhação. Retorne APENAS a palavra em minúsculas. Exemplos: "sonho", "segredo", "viagem".`;
  try {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
    });
    const word = response.text.trim().toLowerCase().replace(/[^a-zà-ú]/gi, '');
    return word || "amor";
  } catch (error) {
    console.error("Contexto: Erro ao obter palavra secreta da Gemini:", error);
    return "sorriso";
  }
};

export const getContextoWordSimilarityRank = async (secretWord: string, guessedWord: string): Promise<number> => {
  if (secretWord.toLowerCase() === guessedWord.toLowerCase()) return 1;

  const prompt = `A palavra secreta é "${secretWord}". O palpite foi "${guessedWord}". Classifique a similaridade semântica de 2 a 5000 (2=sinônimo, 5000=não relacionado). Retorne APENAS o número.`;

  try {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
    });
    const rank = parseInt(response.text.trim(), 10);
    return isNaN(rank) ? 5000 : rank;
  } catch (error) {
    console.error("Contexto: Erro ao obter a classificação de similaridade da Gemini:", error);
    return 9999;
  }
};

export const generateGeoGuessrLocation = async (): Promise<GeoGuessrLocation> => {
  const locationPrompt = `
    Gere um local reconhecível no mundo para um jogo estilo GeoGuessr.
    Não nomeie o país ou cidade na descrição. Inclua pistas sutis (idioma, arquitetura, flora, etc.).
    A descrição deve ser intrigante.
    Retorne um objeto JSON com: description (string), targetCity (string | null), targetCountry (string), targetContinent (string).
  `;

  try {
    const locationResponse = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: locationPrompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    description: { type: Type.STRING },
                    targetCity: { type: Type.STRING },
                    targetCountry: { type: Type.STRING },
                    targetContinent: { type: Type.STRING },
                },
                required: ["description", "targetCountry", "targetContinent"]
            }
        }
    });
    
    const parsedLocation = parseJsonResponse<{description: string; targetCity: string | null; targetCountry: string; targetContinent: string}>(locationResponse.text, "GeoGuessr location");
    if (!parsedLocation) throw new Error("Falha ao analisar JSON de localização.");

    const imagePrompt = `Uma fotografia realista e cinematográfica de uma rua em ${parsedLocation.targetCity ? parsedLocation.targetCity + ', ' : ''}${parsedLocation.targetCountry}, mostrando a arquitetura local, vegetação e o ambiente geral. Estilo Google Street View, alta qualidade, cor vívida.`;

    const imageResponse = await ai.models.generateImages({
        model: 'imagen-3.0-generate-002',
        prompt: imagePrompt,
        config: { numberOfImages: 1, outputMimeType: 'image/jpeg', aspectRatio: '16:9' }
    });
    
    const base64Image = imageResponse.generatedImages[0]?.image.imageBytes ?? null;
    const imageUrl = base64Image ? `data:image/jpeg;base64,${base64Image}` : null;

    return { ...parsedLocation, imageUrl };

  } catch (error: any) {
    console.error("GeoGuessr: Erro ao chamar a API Gemini:", error);
    // Fallback em caso de erro
    return { 
      description: "Uma cena urbana movimentada com edifícios de tijolos vermelhos e uma torre de telecomunicações icônica ao fundo. Folhas de bordo são visíveis nas árvores.",
      targetCountry: "Canadá", 
      targetContinent: "América do Norte", 
      targetCity: "Toronto",
      imageUrl: null
    };
  }
};
