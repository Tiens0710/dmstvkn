/**
 * AI Service - Groq (text) + Gemini (image fallback)
 * Sử dụng Groq API cho chat text, Gemini cho phân tích ảnh hóa đơn
 */

// ========== API KEYS & CONFIG ==========
const GROQ_API_KEY = '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';
const GROQ_TEXT_MODEL = 'llama-3.3-70b-versatile';
const GROQ_VISION_MODEL = 'llama-3.2-90b-vision-preview';
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

export interface ParsedTransaction {
    amount: number;
    type: 'expense' | 'income';
    categoryName: string;
    note: string;
    date: string;
    confidence: number;
    rawText?: string;
}

export interface OrderItem {
    name: string;
    unitPrice: number;
    quantity: number;
    unit: string;
    totalPrice: number;
}

export interface OrderData {
    customerName: string;
    customerPhone: string;
    products: OrderItem[];
    totalAmount: number;
    orderDate: string;
}

export interface GeminiMessage {
    role: 'user' | 'model';
    text: string;
    imageBase64?: string;
    parsedTransaction?: ParsedTransaction;
    loading?: boolean;
}

const SYSTEM_PROMPT = `Bạn là trợ lý tài chính thông minh của ứng dụng FinWise. Nhiệm vụ của bạn là giúp người dùng ghi lại giao dịch tài chính.

Khi người dùng gửi:
- Mô tả chi tiêu/thu nhập (ví dụ: "ăn sáng 35k", "lương tháng 18 triệu")
- Ảnh hóa đơn, biên lai

Hãy:
1. Phân tích và trích xuất thông tin giao dịch
2. Trả lời thân thiện bằng tiếng Việt
3. **LUÔN** kết thúc bằng JSON block với định dạng sau (nếu tìm được thông tin):

\`\`\`json
{
  "amount": 78000,
  "type": "expense",
  "categoryName": "Ăn uống",
  "note": "Trà xanh sữa 2 ly",
  "date": "${new Date().toISOString().split('T')[0]}",
  "confidence": 0.95
}
\`\`\`

Danh mục chi tiêu hợp lệ: Ăn uống, Di chuyển, Mua sắm, Giải trí, Sức khỏe, Giáo dục, Tiện ích, Khác
Danh mục thu nhập hợp lệ: Lương, Thưởng, Đầu tư, Kinh doanh, Khác

Nếu không đủ thông tin, hỏi thêm người dùng một cách thân thiện.`;

// ========== GROQ API (cho text chat) ==========
export async function callGeminiText(
    userMessage: string,
    history: GeminiMessage[]
): Promise<string> {
    try {
        // Build messages array (OpenAI format)
        const messages: Array<{ role: string; content: string }> = [
            { role: 'system', content: SYSTEM_PROMPT },
        ];

        // Add conversation history
        history
            .filter(m => !m.loading && m.text.trim())
            .forEach(m => {
                messages.push({
                    role: m.role === 'model' ? 'assistant' : 'user',
                    content: m.text,
                });
            });

        // Add current user message
        messages.push({ role: 'user', content: userMessage });

        const response = await fetch(GROQ_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${GROQ_API_KEY}`,
            },
            body: JSON.stringify({
                model: GROQ_TEXT_MODEL,
                messages,
                temperature: 0.7,
                max_tokens: 1024,
            }),
        });

        if (!response.ok) {
            const errBody = await response.text();
            console.error('Groq API error:', response.status, errBody);
            throw new Error(`AI API error: ${response.status}`);
        }

        const data = await response.json();
        return data.choices?.[0]?.message?.content || 'Xin lỗi, tôi không hiểu. Bạn thử mô tả lại nhé!';
    } catch (error) {
        console.error('AI text error:', error);
        throw error;
    }
}

// ========== GROQ VISION (cho ảnh hóa đơn) ==========
export async function callGeminiWithImage(
    imageBase64: string,
    mimeType: string = 'image/jpeg'
): Promise<string> {
    try {
        const response = await fetch(GROQ_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${GROQ_API_KEY}`,
            },
            body: JSON.stringify({
                model: GROQ_VISION_MODEL,
                messages: [
                    { role: 'system', content: SYSTEM_PROMPT },
                    {
                        role: 'user',
                        content: [
                            {
                                type: 'text',
                                text: 'Hãy phân tích hóa đơn/biên lai trong ảnh này và trích xuất thông tin giao dịch.',
                            },
                            {
                                type: 'image_url',
                                image_url: {
                                    url: `data:${mimeType};base64,${imageBase64}`,
                                },
                            },
                        ],
                    },
                ],
                temperature: 0.5,
                max_tokens: 1024,
            }),
        });

        if (!response.ok) {
            const errBody = await response.text();
            console.error('Groq Vision error:', response.status, errBody);
            throw new Error(`Vision API error: ${response.status}`);
        }

        const data = await response.json();
        return data.choices?.[0]?.message?.content || 'Không đọc được hóa đơn. Bạn thử nhập thủ công nhé!';
    } catch (error) {
        console.error('Vision error:', error);
        throw error;
    }
}

// ========== PARSE TRANSACTION ==========
export function parseTransactionFromResponse(text: string): ParsedTransaction | null {
    try {
        const jsonMatch = text.match(/```json\n?([\s\S]*?)\n?```/);
        if (!jsonMatch) return null;

        const parsed = JSON.parse(jsonMatch[1]);
        if (!parsed.amount || !parsed.type) return null;

        return {
            amount: Number(parsed.amount),
            type: parsed.type === 'income' ? 'income' : 'expense',
            categoryName: parsed.categoryName || 'Khác',
            note: parsed.note || '',
            date: parsed.date || new Date().toISOString().split('T')[0],
            confidence: parsed.confidence || 0.8,
        };
    } catch {
        return null;
    }
}
// ========== PARSE ORDER ==========
const ORDER_SYSTEM_PROMPT = `Bạn là trợ lý bán hàng chuyên nghiệp của FinWise.
Nhiệm vụ của bạn là trích xuất thông tin đơn hàng từ mô tả của người dùng hoặc ảnh hóa đơn.

Hãy:
1. Trích xuất tên khách hàng, số điện thoại (nếu có).
2. Trích xuất danh sách sản phẩm: tên, đơn giá, số lượng, đơn vị.
3. Tính toán tổng tiền.
4. Trả lời bằng JSON block:

\`\`\`json
{
  "customerName": "Nguyễn Văn A",
  "customerPhone": "0901234567",
  "products": [
    { "name": "Táo Mỹ", "unitPrice": 120000, "quantity": 2, "unit": "kg", "totalPrice": 240000 }
  ],
  "totalAmount": 240000,
  "orderDate": "${new Date().toISOString().split('T')[0]}"
}
\`\`\`

Nếu không đủ thông tin, hãy điền giá trị mặc định hoặc trống, nhưng luôn trả về JSON.`;

export async function callGeminiOrder(text: string): Promise<OrderData | null> {
    try {
        const response = await fetch(GROQ_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${GROQ_API_KEY}`,
            },
            body: JSON.stringify({
                model: GROQ_TEXT_MODEL,
                messages: [
                    { role: 'system', content: ORDER_SYSTEM_PROMPT },
                    { role: 'user', content: text },
                ],
                temperature: 0.3,
            }),
        });

        if (!response.ok) return null;
        const data = await response.json();
        const content = data.choices?.[0]?.message?.content || '';
        const jsonMatch = content.match(/```json\n?([\s\S]*?)\n?```/);
        if (!jsonMatch) return null;
        return JSON.parse(jsonMatch[1]);
    } catch (error) {
        console.error('Order parsing error:', error);
        return null;
    }
}

// ========== AI FORECASTING ==========

const FORECAST_SYSTEM_PROMPT = `Bạn là cố vấn tài chính chiến lược của FinWise AI. 
Nhiệm vụ của bạn là phân tích lịch sử giao dịch và đưa ra dự báo:
1. Dự báo xu hướng chi tiêu trong 30 ngày tới dựa trên dữ liệu hiện tại.
2. Cảnh báo các nguy cơ (vượt ngân sách, dòng tiền âm).
3. Đưa ra 3 lời khuyên chiến lược để tối ưu tài chính (ngắn gọn, hành động được ngay).

Định dạng phản hồi bằng Markdown tiếng Việt, súc tích, chuyên nghiệp.`;

export async function getAIForecast(transactions: any[]): Promise<string> {
    const txnSummary = transactions.slice(0, 50).map(t =>
        `- ${t.date}: ${t.type === 'income' ? '+' : '-'}${t.amount} (${t.categoryName || 'Khác'}) - ${t.note || ''}`
    ).join('\n');

    const prompt = `Đây là 50 giao dịch gần nhất của tôi:\n${txnSummary}\n\n Hãy phân tích và đưa ra dự báo tài chính cho tôi.`;

    try {
        const response = await fetch(GROQ_API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${GROQ_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'llama-3.3-70b-versatile',
                messages: [
                    { role: 'system', content: FORECAST_SYSTEM_PROMPT },
                    { role: 'user', content: prompt }
                ],
                temperature: 0.7,
            }),
        });

        const data = await response.json();
        return data.choices?.[0]?.message?.content || 'Không thể tạo dự báo lúc này.';
    } catch (error) {
        console.error('Forecast error:', error);
        return 'Lỗi kết nối máy chủ AI.';
    }
}
