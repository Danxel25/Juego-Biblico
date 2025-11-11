import { Injectable } from '@angular/core';
import { GoogleGenAI } from '@google/genai';

@Injectable({
  providedIn: 'root',
})
export class GeminiService {
  private ai: GoogleGenAI | null = null;

  constructor() {
    // IMPORTANT: In a real app, API_KEY would be securely managed.
    // This is a placeholder for the applet environment.
    const apiKey = (window as any).process?.env?.API_KEY;
    if (apiKey) {
      this.ai = new GoogleGenAI({ apiKey });
    } else {
      console.warn('Gemini API key not found. Thinking Mode will be disabled.');
    }
  }

  async getComplexAnswer(topic: string, question: string): Promise<string> {
    if (!this.ai) {
      return Promise.resolve(
        'El Modo Pensamiento está desactivado. No se encontró la clave API de Gemini.'
      );
    }

    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `En el contexto del tema bíblico "${topic}", profundiza sobre la pregunta: "${question}". Ofrece una explicación detallada, mencionando personajes, contexto histórico y significado teológico.`,
        config: {
          temperature: 0.7,
        },
      });
      return response.text;
    } catch (error) {
      console.error('Error calling Gemini API:', error);
      return 'Hubo un error al procesar la solicitud. Por favor, inténtalo de nuevo más tarde.';
    }
  }

  async getVerseExplanation(verseReference: string): Promise<string> {
    if (!this.ai) {
      return Promise.resolve(
        'El Modo Estudio Profundo está desactivado. No se encontró la clave API de Gemini.'
      );
    }

    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Para el versículo bíblico "${verseReference}", proporciona un análisis profundo en español para un estudiante de la Biblia. Incluye:
1.  **Contexto Histórico y Literario:** ¿Qué estaba sucediendo en ese momento? ¿A quién se le escribió?
2.  **Análisis del Versículo:** Explica el significado de las palabras o frases clave.
3.  **Dato Curioso o Conexión:** Menciona algo interesante o una conexión con otra parte de la Biblia que no sea obvia.
4.  **Aplicación Teológica:** ¿Qué nos enseña este versículo sobre Dios y nuestra relación con Él?
Mantén la respuesta estructurada, clara y enriquecedora.`,
        config: { 
          temperature: 0.5 
        },
      });
      return response.text;
    } catch (error) {
      console.error('Error calling Gemini API for verse explanation:', error);
      return 'Hubo un error al generar la explicación del versículo. Por favor, inténtalo de nuevo más tarde.';
    }
  }
}
