import { Injectable } from '@angular/core';
import { SearchFilters } from '../models/search-filters.model';

import { AiAnalysisResult } from '../models/offline-ai.model';

@Injectable({
  providedIn: 'root'
})
export class OfflineAiService {

  constructor() { }

  // --- Dictionaries ---
  private readonly LOCATIONS: Record<string, string> = {
    'تجمع': 'New Cairo', 'تجمع خامس': 'New Cairo', 'new cairo': 'New Cairo', 'التسعين': 'New Cairo',
    'زايد': 'Sheikh Zayed', 'zayed': 'Sheikh Zayed', 'شيخ زايد': 'Sheikh Zayed',
    'اكتوبر': '6th of October', 'october': '6th of October',
    'ساحل': 'North Coast', 'sahel': 'North Coast', 'gouna': 'El Gouna', 'جونة': 'El Gouna',
    'عاصمة': 'New Capital', 'capital': 'New Capital', 'ادارية': 'New Capital',
    'معادي': 'Maadi', 'maadi': 'Maadi',
    'زمالك': 'Zamalek', 'zamalek': 'Zamalek',
    'مدينتي': 'Madinaty', 'madinaty': 'Madinaty',
    'رحاب': 'Al Rehab', 'rehab': 'Al Rehab',
    'شروق': 'El Shorouk', 'shorouk': 'El Shorouk',
    'عبور': 'Obour', 'obour': 'Obour',
    'مستقبل': 'Mostakbal City', 'mostakbal': 'Mostakbal City',
    'مدينة نصر': 'Nasr City', 'nasr city': 'Nasr City',
    'مصر الجديدة': 'Heliopolis', 'heliopolis': 'Heliopolis', 'korba': 'Heliopolis',
    'مقطم': 'Mokattam', 'mokattam': 'Mokattam',
    'دقي': 'Dokki', 'dokki': 'Dokki',
    'مهندسين': 'Mohandessin', 'mohandessin': 'Mohandessin',
    'وسط البلد': 'Downtown', 'downtown': 'Downtown'
  };

  private readonly TYPES: Record<string, string> = {
    'شقة': 'شقة', 'شقق': 'شقة', 'apartment': 'شقة', 'flat': 'شقة', 'استوديو': 'شقة', 'studio': 'شقة',
    'فيلا': 'فيلا', 'فلل': 'فيلا', 'villa': 'فيلا', 'stand alone': 'فيلا', 'مستقلة': 'فيلا',
    'تاون': 'تاون هاوس', 'townhouse': 'تاون هاوس',
    'توين': 'توين هاوس', 'twinhouse': 'توين هاوس',
    'شاليه': 'شاليه', 'chalet': 'شاليه', 'مضيف': 'شاليه', 'cabana': 'شاليه',
    'دوبلكس': 'دوبلكس', 'duplex': 'دوبلكس',
    'بنتهاوس': 'بنتهاوس', 'penthouse': 'بنتهاوس', 'رووف': 'بنتهاوس', 'roof': 'بنتهاوس',
    'مكتب': 'تجاري', 'office': 'تجاري', 'عيادة': 'تجاري', 'clinic': 'تجاري', 'محل': 'تجاري', 'store': 'تجاري'
  };

  private readonly AMENITIES: Record<string, keyof SearchFilters['amenities']> = {
    'بسين': 'pool', 'سباحة': 'pool', 'pool': 'pool',
    'جاردن': 'garden', 'حديقة': 'garden', 'garden': 'garden',
    'جراج': 'garage', 'ركنة': 'garage', 'parking': 'garage',
    'بلكونة': 'balcony', 'تراس': 'balcony', 'balcony': 'balcony', 'فيو': 'balcony'
  };

  // --- Main Analysis Method ---
  public analyze(message: string): AiAnalysisResult {
    const cleanMessage = this.normalizeText(message);

    // 1. Try Strict Regex Model
    const regexResult = this.runRegexModel(cleanMessage);
    if (regexResult.confidence > 0.8) return regexResult;

    // 2. Try Keyword Model
    const keywordResult = this.runKeywordModel(cleanMessage);
    if (keywordResult.confidence > 0.5) return keywordResult;

    // 3. Try Fuzzy Model (Last Resort)
    const fuzzyResult = this.runFuzzyModel(cleanMessage);
    return fuzzyResult;
  }

  // --- Helpers ---
  private normalizeText(text: string): string {
    return text.toLowerCase()
      .replace(/[أإآ]/g, 'ا')
      .replace(/[ة]/g, 'ه')
      .replace(/[ى]/g, 'ي')
      .replace(/[^\w\s\u0600-\u06FF]/g, ' ') // Remove special chars
      .replace(/\s+/g, ' ')
      .trim();
  }

  private readonly NUMBER_WORDS: Record<string, number> = {
    'واحد': 1, 'واحدة': 1, 'اول': 1,
    'اثنين': 2, 'اتنين': 2, 'تاني': 2,
    'ثلاث': 3, 'تلات': 3, 'تلاتة': 3, 'ثلاثة': 3,
    'اربع': 4, 'اربعة': 4,
    'خمس': 5, 'خمسة': 5,
    'ست': 6, 'ستة': 6
  };

  private readonly DUALS: Record<string, {key: 'beds' | 'baths', val: number}> = {
    'غرفتين': {key: 'beds', val: 2},
    'حمامين': {key: 'baths', val: 2},
    'اوضتين': {key: 'beds', val: 2}
  };

  // --- Model 1: The Strict Ruler (Regex) ---
  private runRegexModel(text: string): AiAnalysisResult {
    const filters: Partial<SearchFilters> = { amenities: { pool: false, garden: false, garage: false, balcony: false } };
    let confidence = 0;
    const matchedTokens: string[] = [];

    // Context Implication (e.g., "Masief" -> North Coast)
    if (text.includes('مصيف') || text.includes('اصيف')) {
       matchedTokens.push('Context: Masief -> North Coast');
       // Ideally we add 'North Coast' to a location filter if we had one
       confidence += 0.2;
    }

    // Pattern: "Price" (e.g., 5 million, 500000)
    // Matches: 5 مليون, 500 الف, 500000
    const priceMatch = text.match(/(\d+)\s*(مليون|الف|k|m)?/);
    if (priceMatch) {
      let val = parseInt(priceMatch[1]);
      const unit = priceMatch[2];
      if (unit === 'مليون' || unit === 'm') val *= 1000000;
      if (unit === 'الف' || unit === 'k') val *= 1000;
      
      // Heuristic: If < 50k, likely rental or mistake, ignore for sale price limit for now unless stated
      // For simplicity, let's treat single number as "Max Price"
      filters.priceTo = val;
      confidence += 0.3;
      matchedTokens.push(`Price: ${val}`);
    }

    // Pattern: "Bedrooms" (Digit)
    const bedMatch = text.match(/(\d+)\s*(غرف|نوم|bedroom)/);
    if (bedMatch) {
      filters.beds = bedMatch[1];
      confidence += 0.2;
      matchedTokens.push(`Beds: ${bedMatch[1]}`);
    }

    // Pattern: "Bedrooms" (Word)
    for (const [word, val] of Object.entries(this.NUMBER_WORDS)) {
      if (text.includes(`${word} غرف`) || text.includes(`${word} نوم`) || text.includes(`${word} اوض`)) {
        filters.beds = val.toString();
        confidence += 0.2;
        matchedTokens.push(`Beds: ${val}`);
        break;
      }
    }

    // Pattern: Duals (غرفتين)
    for (const [word, data] of Object.entries(this.DUALS)) {
      if (text.includes(word)) {
        if (data.key === 'beds') filters.beds = data.val.toString();
        if (data.key === 'baths') filters.baths = data.val.toString(); // If we tracked baths
        confidence += 0.2;
        matchedTokens.push(`${data.key}: ${data.val}`);
      }
    }

    // Direct Exact Matches from Dictionaries
    for (const [key, val] of Object.entries(this.LOCATIONS)) {
      if (new RegExp(`\\b${key}\\b`).test(text)) {
        // We don't have location in SearchFilters interface yet (it's mainly local component state), 
        // but let's assume we want to extract it to show we understood.
        // Ideally SearchFilters should have 'location'. For now we'll track it in matchedTokens.
        matchedTokens.push(`Location: ${val}`);
        confidence += 0.3;
        break; // Assume one location for now
      }
    }

    for (const [key, val] of Object.entries(this.TYPES)) {
      if (new RegExp(`\\b${key}\\b`).test(text)) {
        filters.type = val;
        confidence += 0.3;
        matchedTokens.push(`Type: ${val}`);
        break; 
      }
    }

    return { filters, confidence: Math.min(confidence, 1), modelUsed: 'regex', matchedTokens };
  }

  // --- Model 2: The Keyword Hunter (Bag of Words) ---
  private runKeywordModel(text: string): AiAnalysisResult {
    const filters: Partial<SearchFilters> = { amenities: { pool: false, garden: false, garage: false, balcony: false } };
    let score = 0;
    const tokens = text.split(' ');
    const matched: string[] = [];

    tokens.forEach(token => {
      // Type
      if (this.TYPES[token]) {
        filters.type = this.TYPES[token];
        score += 2;
        matched.push(`Type: ${this.TYPES[token]}`);
      }
      
      // Location
      if (this.LOCATIONS[token]) {
        matched.push(`Location: ${this.LOCATIONS[token]}`);
        score += 2;
      }
      
      // Amenities
      if (this.AMENITIES[token]) {
        const key = this.AMENITIES[token];
        if (filters.amenities) filters.amenities[key] = true;
        score += 1;
        matched.push(`Amenity: ${key}`);
      }
    });

    const confidence = Math.min(score / 5, 0.9); // Cap at 0.9, keep 1.0 for Regex
    return { filters: filters as any, confidence, modelUsed: 'keyword', matchedTokens: matched };
  }

  // --- Model 3: The Smart Guesser (Fuzzy) ---
  private runFuzzyModel(text: string): AiAnalysisResult {
    // This model tries to fix typos by comparing tokens to dictionary keys
    const filters: Partial<SearchFilters> = { amenities: { pool: false, garden: false, garage: false, balcony: false } };
    let score = 0;
    const tokens = text.split(' ');
    const matched: string[] = [];

    tokens.forEach(token => {
      if (token.length < 3) return; // Skip short words

      // Check Locations
      const bestLoc = this.findBestMatch(token, Object.keys(this.LOCATIONS));
      if (bestLoc) {
        matched.push(`Fuzzy Location: ${this.LOCATIONS[bestLoc]}`);
        score += 1.5;
      }

      // Check Types
      const bestType = this.findBestMatch(token, Object.keys(this.TYPES));
      if (bestType) {
        filters.type = this.TYPES[bestType];
        matched.push(`Fuzzy Type: ${this.TYPES[bestType]}`);
        score += 1.5;
      }
    });

    return { filters: filters as any, confidence: Math.min(score / 5, 0.7), modelUsed: 'fuzzy', matchedTokens: matched };
  }

  private findBestMatch(token: string, candidates: string[]): string | null {
    let best = null;
    let minDist = 2; // Allow max 2 edits

    for (const candidate of candidates) {
      if (Math.abs(candidate.length - token.length) > 2) continue;
      
      const dist = this.levenshtein(token, candidate);
      if (dist <= minDist) {
        minDist = dist;
        best = candidate;
      }
    }
    return best;
  }

  private levenshtein(a: string, b: string): number {
    const matrix = [];
    for (let i = 0; i <= b.length; i++) matrix[i] = [i];
    for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        if (b.charAt(i - 1) == a.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1, // substitution
            matrix[i][j - 1] + 1,     // insertion
            matrix[i - 1][j] + 1      // deletion
          );
        }
      }
    }
    return matrix[b.length][a.length];
  }

  // --- Robustness Test Suite (Diagnostic) ---
  public runDiagnostics() {
    console.log('--- Starting Offline AI Diagnostics ---');
    const testCases = [
      // Direct
      "شقة للبيع", "فيلا في التجمع", "عايز اشتري شاليه",
      // Typos
      "شقه في اتجمع", "فلا بحديقة", "شاليه بالساح", "عاوز شققة",
      // Price
      "شقت ب 2 مليون", "3 مليون", "تحت ال 500 الف",
      // Complex
      "شقة 3 غرف في زايد",
      "توين هاوس ب 5 مليون في اكتوبر",
      "عايز ارمي جتتي في الساحل", // 'ساحل' keyword
      "مكان فيه بسين",
      "حاجة لقطة في المعادي",
      "دوبلكس بحديقة",
      "شقة بلكونة كبيرة",
      // English / Arabizi support (partial)
      "apartment in zayed",
      "villa with pool",
      // Edge cases
      "ااااا", // garbage
      "بيت", // generic
      "عايز انام", // irrelevant
      "فيلا 5000000",
      "شقة غرفتين", // normalized 'غرف'
      "شقة 3 نوم",
      "روف", // Penthouse synonym?
      "ستوديو للايجار",
      "مصيف",
      "شقة قريبة من الشغل", // No location
      "عايز حاجة واسعة", // No regex
      "فيلا دورين",
      "تاون هاوس كورنر",
      "شقة متشطبة",
      "فيلا طوب احمر",
      "ارض ", // Type not in dict
      "مكتب", // Commercial
      "عيادة",
      "محل",
      "شقة مفروشة",
      "شقة قانون جديد",
      "ايجار قديم",
      "مدينتي",
      "الرحاب", // Missing loc
      "الشروق",
      "المستقبل",
      "التجمع الخامس",
      "التجمع الاول",
      "شارع التسعين",
      "حي الواحة",
      "المقطم", // Missing
      "مدينة نصر", // Missing partial
      "مصر الجديدة", // Missing
      "وسط البلد",
      "الدقي",
      "المهندسين"
    ];

    let passed = 0;
    
    testCases.forEach((input, idx) => {
      const res = this.analyze(input);
      const isSuccess = res.confidence > 0.3; // Low threshold for success in this raw test
      if (isSuccess) passed++;
      
      console.log(`[${idx+1}] "${input}" -> Model: ${res.modelUsed} | Conf: ${res.confidence.toFixed(2)} | Found: ${res.matchedTokens.join(', ')}`);
      if (!isSuccess) {
        // console.warn('   FAILED intent detection');
      }
    });
    
    console.log(`--- Diagnostics Complete: ${passed}/${testCases.length} potentially handled ---`);
    return passed;
  }
}
