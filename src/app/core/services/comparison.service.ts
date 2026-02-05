import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { firstValueFrom } from 'rxjs';

// Interfaces match our Property structure roughly
export interface Property {
  id: number | string;
  title: string;
  price: string | number; // Handling "15,000,000" string or number
  area: string | number; // "500 m2" or 500
  location: string;
  beds: number;
  baths: number;
  image?: string;
  _id?: string;
  coverImage?: string;
  images?: string[];
  [key: string]: any;
}

export interface ComparisonResult {
  winnerId: number | string;
  analysis: Record<string | number, {
    pros: string[];
    cons: string[];
    score: number;
  }>;
  summary: string;
}

@Injectable({
  providedIn: 'root'
})
export class ComparisonService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/ai/log`;

  // --- Local AI Engine (Heuristics) ---

  analyze(properties: Property[]): ComparisonResult {
    const scoredProperties = properties.map(p => this.scoreProperty(p, properties));
    
    // Find winner (highest score)
    const winner = scoredProperties.reduce((prev, current) => 
      (current.score > prev.score) ? current : prev
    );

    const result: ComparisonResult = {
      winnerId: winner.id,
      analysis: {},
      summary: ` بناءً على التحليل، ${winner.title} هو الخيار الأفضل لأنه يجمع بين السعر والمساحة.`
    };

    scoredProperties.forEach(p => {
      result.analysis[p.id] = {
        pros: p.pros,
        cons: p.cons,
        score: p.score
      };
    });

    return result;
  }

  private scoreProperty(p: Property, all: Property[]): { id: number | string, score: number, pros: string[], cons: string[], title: string } {
    let score = 50; // Base score
    const pros: string[] = [];
    const cons: string[] = [];

    // Normalize Price
    const numericPrice = this.parsePrice(p.price);
    const numericArea = this.parseArea(p.area);
    const avgPrice = all.reduce((sum, item) => sum + this.parsePrice(item.price), 0) / all.length;
    
    // 1. Price Rules
    if (numericPrice < avgPrice * 0.8) {
      score += 20;
      pros.push('سعر ممتاز (أقل من متوسط القائمة)');
    } else if (numericPrice > avgPrice * 1.2) {
      score -= 10;
      cons.push('السعر مرتفع مقارنة بالباقي');
    }

    // 2. Area Rules
    if (numericArea > 200) {
      score += 15;
      pros.push('مساحة واسعة جداً');
    } else if (numericArea < 100) {
       cons.push('المساحة قد تكون صغيرة');
    }

    // 3. Bedroom Rules
    if (p.beds >= 4) {
      score += 10;
      pros.push('مناسب للعائلات الكبيرة');
    }

    return { id: p.id, title: p.title, score, pros, cons };
  }

  private parsePrice(price: string | number): number {
    if (typeof price === 'number') return price;
    return parseInt(price.replace(/[^0-9]/g, '')) || 0;
  }

  private parseArea(area: string | number): number {
    if (typeof area === 'number') return area;
    return parseInt(area.replace(/[^0-9]/g, '')) || 0;
  }

  // --- External/Hybrid AI (Future) ---

  async askAi(question: string, properties: Property[]): Promise<string> {
    // 1. Local Fallback for simple queries
    if (question.includes('أرخص') || question.includes('سعر')) {
      const cheapest = properties.reduce((min, p) => 
        this.parsePrice(p.price) < this.parsePrice(min.price) ? p : min
      );
      const answer = `الأرخص هو ${cheapest.title} بسعر ${cheapest.price}.`;
      this.logToBackend(question, properties, answer, 'local');
      return answer;
    }

    // 2. Default generic answer (since we don't have external AI yet)
    const analysis = this.analyze(properties);
    const answer = `بناءً على المعطيات، أرشح لك ${properties.find(p => p.id === analysis.winnerId)?.title} كخيار متوازن. هل لديك تفضيلات محددة (مثل الموقع أو التشطيب)؟`;
    
    this.logToBackend(question, properties, answer, 'local');
    return answer;
  }

  private logToBackend(question: string, properties: Property[], answer: string, provider: 'local' | 'external') {
    const payload = {
      question,
      context: properties.map(p => p.id.toString()),
      answer,
      provider
    };
    // Fire and forget (don't await)
    this.http.post(this.apiUrl, payload).subscribe({
      error: err => console.warn('AI Logging failed', err)
    });
  }
}
