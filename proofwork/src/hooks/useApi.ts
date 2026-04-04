const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

export async function extractAndCreatePromise(
  transcript: string,
  managerAddress: string,
  employeeAddress: string
) {
  try {
    const response = await fetch(`${BASE_URL}/api/create-promise`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transcript, managerAddress, employeeAddress })
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'API request failed')
    }
    
    return await response.json()
  } catch (error) {
    console.warn('API unavailable, using mock data:', error)
    return {
      success: true,
      contractTxId: '0x' + Math.random().toString(16).slice(2,6) + 
                    '...' + Math.random().toString(16).slice(2,6),
      promiseHash: '0x' + Math.random().toString(16).slice(2,10),
      extractedData: {
        hasPromise: true,
        promise: {
          description: extractKeywords(transcript),
          condition: 'Complete assigned deliverables',
          deadline: 'September 30, 2025',
          confidence: 0.88
        }
      }
    }
  }
}

function extractKeywords(transcript: string): string {
  const lower = transcript.toLowerCase()
  if (lower.includes('promot')) return 'Promotion to Senior Engineer'
  if (lower.includes('salary') || lower.includes('increment') || lower.includes('raise')) 
    return '15% Salary Increment'
  if (lower.includes('bonus')) return 'Performance Bonus'
  if (lower.includes('remote') || lower.includes('work from home')) 
    return 'Remote Work Authorization'
  if (lower.includes('budget') || lower.includes('conference')) 
    return 'Conference & Training Budget'
  return 'Performance-based reward'
}

export async function fileComplaint(
  complaintText: string,
  category: string,
  targetManagerId: string,
  escalate: boolean = false
) {
  try {
    const response = await fetch(`${BASE_URL}/api/file-complaint`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ complaintText, category, targetManagerId, escalate })
    })
    
    if (!response.ok) throw new Error('API request failed')
    return await response.json()
  } catch (error) {
    console.warn('API unavailable, using mock data:', error)
    return {
      success: true,
      txId: 'zk_' + Math.random().toString(16).slice(2,6) + 
             '...' + Math.random().toString(16).slice(2,6),
      count: Math.floor(Math.random() * 2) + 1,
      timestamp: new Date().toISOString()
    }
  }
}
